<?php

namespace App\Controllers;

use App\Libraries\FeatureSchema;
use App\Libraries\JwtAuth;
use App\Models\CourseModel;
use CodeIgniter\RESTful\ResourceController;

class CourseController extends ResourceController
{
    private function getAuthUser(): ?array
    {
        $header = $this->request->getHeaderLine('Authorization');
        $decoded = JwtAuth::decodeFromHeader($header);
        
        if (! $decoded || empty($decoded->uid)) {
            return null;
        }

        $userModel = new \App\Models\UserModel();
        return $userModel->find((int) $decoded->uid);
    }

    private function isSubscriptionActive(array $user): bool
    {
        $tier = $user['subscription_tier'] ?? 'free';
        if ($tier === 'free') {
            return false;
        }

        $expiresAt = $user['subscription_expires_at'] ?? null;
        if (! $expiresAt) {
            return false;
        }

        return strtotime($expiresAt) > time();
    }

    private function getBestDiscount(array $user): float
    {
        $isAdmin = ($user['role'] ?? '') === 'admin';
        if ($isAdmin) return 0.0;

        $studentDiscount = 0.0;
        if ((int)($user['verification_status'] ?? 0) === 1) {
            $studentDiscount = (float) ($user['promo_discount'] ?? 0);
        }

        $subDiscount = 0.0;
        $tier = $user['subscription_tier'] ?? 'free';
        $expiresAt = $user['subscription_expires_at'] ?? null;
        if ($tier !== 'free' && $expiresAt && strtotime($expiresAt) > time()) {
            $map = ['pro' => 10.0, 'pro_plus' => 25.0];
            $subDiscount = $map[$tier] ?? 0.0;
        }

        return max($studentDiscount, $subDiscount);
    }

    private function getOpenLimitForUser(array $user): ?int
    {
        if (($user['role'] ?? '') === 'admin') {
            return null;
        }

        $tier = $user['subscription_tier'] ?? 'free';
        $isActive = $this->isSubscriptionActive($user);

        if ($tier === 'pro_plus' && $isActive) {
            return null; // Unlimited
        }

        if ($tier === 'pro' && $isActive) {
            return 50;
        }

        // Default Free limits
        return 5;
    }

    private function getOpenedCountInWindow(int $userId): int
    {
        $db = \Config\Database::connect();
        
        $builder = $db->table('resource_access_logs')
            ->select('COUNT(resource_access_logs.access_id) AS total')
            ->where('resource_access_logs.user_id', $userId)
            ->where('resource_access_logs.opened_at >=', date('Y-m-d H:i:s', strtotime('-30 days')))
            ->join('resource_purchases', "resource_purchases.resource_id = resource_access_logs.resource_id AND resource_purchases.user_id = resource_access_logs.user_id AND resource_purchases.status = 'completed'", 'left')
            ->where('resource_purchases.purchase_id IS NULL');
            
        $result = $builder->get()->getRowArray();

        return (int) ($result['total'] ?? 0);
    }

    private function hasPurchased(int $userId, int $resourceId): bool
    {
        $db = \Config\Database::connect();
        return $db->table('resource_purchases')
            ->where('user_id', $userId)
            ->where('resource_id', $resourceId)
            ->where('status', 'completed')
            ->countAllResults() > 0;
    }

    private function buildPreview(string $text, int $previewPercent): string
    {
        $clean = trim($text);
        if ($clean === '') {
            return '';
        }

        $length = max(1, (int) ceil(strlen($clean) * ($previewPercent / 100)));
        return substr($clean, 0, $length);
    }

    private function createReadToken(int $userId, int $resourceId, int $expiresAt): ?string
    {
        $secret = env('JWT_SECRET');
        if (! is_string($secret) || $secret === '') {
            return null;
        }

        $payload = "{$userId}:{$resourceId}:{$expiresAt}";
        return hash_hmac('sha256', $payload, $secret);
    }

    
    public function index()
    {
        FeatureSchema::ensure();

        $db = \Config\Database::connect();
        $resourceModel = new \App\Models\ResourceModel();
        $resources = $resourceModel
            ->select('resources.*, users.name as uploader_name, course_sections.section_name, courses.title as course_title, courses.dept_id')
            ->join('users', 'users.user_id = resources.uploader_id', 'left')
            ->join('course_sections', 'course_sections.section_id = resources.section_id', 'left')
            ->join('courses', 'courses.course_id = course_sections.course_id', 'left')
            ->where('resources.is_approved', true)
            ->where('resources.material_type', 'book')
            ->findAll();
        
        foreach ($resources as &$res) {
            $count = $db->table('resource_access_logs')
                        ->where('resource_id', $res['resource_id'])
                        ->countAllResults();
            $res['opened_count'] = $count;
        }
        
        return $this->respond($resources);
    }

    public function recent()
    {
        FeatureSchema::ensure();

        $resourceModel = new \App\Models\ResourceModel();
        $resources = $resourceModel
            ->select('resources.*, users.name as uploader_name, course_sections.section_name, courses.title as course_title, courses.dept_id')
            ->join('users', 'users.user_id = resources.uploader_id', 'left')
            ->join('course_sections', 'course_sections.section_id = resources.section_id', 'left')
            ->join('courses', 'courses.course_id = course_sections.course_id', 'left')
            ->where('resources.is_approved', true)
            ->where('resources.material_type', 'book')
            ->orderBy('resources.resource_id', 'DESC')
            ->limit(4)
            ->findAll();
        
        return $this->respond($resources);
    }

    
    public function all()
    {
        FeatureSchema::ensure();

        $courseModel = new CourseModel();
        return $this->respond($courseModel->findAll());
    }

    
    public function show($id = null)
    {
        FeatureSchema::ensure();

        $courseModel = new CourseModel();
        $course = $courseModel->find($id);

        if (!$course) {
            return $this->failNotFound('Course not found.');
        }

        $sectionModel = new \App\Models\SectionModel();
        $sections = $sectionModel->where('course_id', $course['course_id'])->findAll();

        $resourceModel = new \App\Models\ResourceModel();
        
        foreach ($sections as &$section) {
            $section['resources'] = $resourceModel
                ->select('resources.*, users.name as uploader_name')
                ->join('users', 'users.user_id = resources.uploader_id', 'left')
                ->where([
                    'section_id'  => $section['section_id'],
                    'is_approved' => true,
                    'material_type' => 'book',
                ])->findAll();
        }

        $course['sections'] = $sections;

        return $this->respond($course);
    }

    
    public function create()
    {
        FeatureSchema::ensure();

        $rules = [
            'title'       => 'required|min_length[3]|max_length[200]',
            'dept_id'     => 'required|integer',
            'uploader_id' => 'required|integer',
        ];

        if (! $this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $courseModel = new CourseModel();

        $data = [
            'title'       => $this->request->getVar('title'),
            'description' => $this->request->getVar('description'),
            'dept_id'     => (int) $this->request->getVar('dept_id'),
            'uploader_id' => (int) $this->request->getVar('uploader_id'),
        ];

        if ($courseModel->insert($data)) {
            $response = [
                'status'   => 201,
                'error'    => null,
                'messages' => [
                    'success' => 'Course created successfully',
                ],
                'course_id' => $courseModel->getInsertID(),
            ];

            return $this->respondCreated($response);
        }

        return $this->failServerError('Could not create course.');
    }

    public function resourceDetail($id = null)
    {
        FeatureSchema::ensure();

        $resourceModel = new \App\Models\ResourceModel();
        $resource = $resourceModel
            ->select('resources.*, users.name as uploader_name, course_sections.section_name, courses.title as course_title')
            ->join('users', 'users.user_id = resources.uploader_id', 'left')
            ->join('course_sections', 'course_sections.section_id = resources.section_id', 'left')
            ->join('courses', 'courses.course_id = course_sections.course_id', 'left')
            ->find($id);

        if (!$resource || ($resource['material_type'] ?? 'book') !== 'book') {
            return $this->failNotFound('Book not found.');
        }

        $user = $this->getAuthUser();

        // Security check for unapproved materials
        if (! (bool) ($resource['is_approved'] ?? false)) {
            $isAdmin = ($user['role'] ?? '') === 'admin';
            $isOwner = $user && (int) $user['user_id'] === (int) $resource['uploader_id'];
            
            if (! $isAdmin && ! $isOwner) {
                return $this->failNotFound('Book not found or pending approval.');
            }
        }

        $price = (float) ($resource['price'] ?? 0);
        $previewPercent = (int) ($resource['preview_percent'] ?? 20);
        $freePreviewPages = isset($resource['free_preview_pages']) && $resource['free_preview_pages'] !== null
            ? (int) $resource['free_preview_pages']
            : null;
        $requiresPurchase = $price > 0;
        $hasPurchase = false;
        $openLimit = null;
        $openedCount = 0;
        $pageCount = isset($resource['page_count']) ? (int) $resource['page_count'] : null;
        $previewPages = ($pageCount && $pageCount > 0) ? max(1, (int) ceil($pageCount * ($previewPercent / 100))) : null;
        if ($freePreviewPages !== null && $freePreviewPages > 0) {
            $previewPages = $pageCount && $pageCount > 0
                ? min($freePreviewPages, $pageCount)
                : $freePreviewPages;
        }

        if ($user) {
            $hasPurchase = $requiresPurchase ? $this->hasPurchased((int) $user['user_id'], (int) $resource['resource_id']) : true;
            $openLimit = $this->getOpenLimitForUser($user);
            $openedCount = $openLimit ? $this->getOpenedCountInWindow((int) $user['user_id']) : 0;
        }

        $canAccessFull = ! $requiresPurchase || $hasPurchase || ($user['role'] ?? '') === 'admin';
        
        $discountPercent = 0.0;
        $studentDiscount = 0.0;
        $subscriptionDiscount = 0.0;
        $discountSource = 'none';

        if ($user) {
            $isAdmin = ($user['role'] ?? '') === 'admin';
            if (! $isAdmin) {
                if ((int)($user['verification_status'] ?? 0) === 1) {
                    $studentDiscount = (float) ($user['promo_discount'] ?? 0);
                }
                $tier = $user['subscription_tier'] ?? 'free';
                $expiresAt = $user['subscription_expires_at'] ?? null;
                if ($tier !== 'free' && $expiresAt && strtotime($expiresAt) > time()) {
                    $map = ['pro' => 10.0, 'pro_plus' => 25.0];
                    $subscriptionDiscount = $map[$tier] ?? 0.0;
                }
                $discountPercent = max($studentDiscount, $subscriptionDiscount);
                if ($discountPercent > 0) {
                    $discountSource = $discountPercent === $subscriptionDiscount ? 'subscription' : 'student';
                }
            }
        }

        $discountedPrice = max(0, $price * (1 - ($discountPercent / 100)));

        if (! $canAccessFull) {
            $resource['full_file_path'] = $resource['file_path'];
            $resource['file_path'] = null;
            $resource['preview_description'] = $this->buildPreview((string) ($resource['description'] ?? ''), $previewPercent);
        }

        $resource['access'] = [
            'requires_purchase' => $requiresPurchase,
            'has_purchase' => $hasPurchase,
            'can_access_full' => $canAccessFull,
            'preview_percent' => $previewPercent,
            'free_preview_pages' => $freePreviewPages,
            'preview_pages' => $previewPages,
            'total_pages' => $pageCount,
            'listed_price' => $price,
            'discount_percent' => $discountPercent,
            'student_discount' => $studentDiscount,
            'subscription_discount' => $subscriptionDiscount,
            'discount_source' => $discountSource,
            'discounted_price' => round($discountedPrice, 2),
            'open_limit' => $openLimit,
            'opened_count' => $openedCount,
        ];

        return $this->respond($resource);
    }

    public function purchaseResource($id = null)
    {
        FeatureSchema::ensure();

        $user = $this->getAuthUser();
        if (! $user) {
            return $this->failUnauthorized('Authentication required.');
        }

        $resourceModel = new \App\Models\ResourceModel();
        $resource = $resourceModel->find($id);
        if (! $resource || ! (bool) $resource['is_approved'] || ($resource['material_type'] ?? 'book') !== 'book') {
            return $this->failNotFound('Book not found.');
        }

        $price = (float) ($resource['price'] ?? 0);
        if ($price <= 0) {
            return $this->respond(['message' => 'This book is free and does not require purchase.'], 200);
        }

        $userId = (int) $user['user_id'];
        $resourceId = (int) $resource['resource_id'];
        $paymentMethod = $this->request->getVar('payment_method') ?? 'card';

        if ($this->hasPurchased($userId, $resourceId)) {
            return $this->respond(['message' => 'Book already purchased.'], 200);
        }

        $discountPercent = $this->getBestDiscount($user);

        $paidAmount = round(max(0, $price * (1 - ($discountPercent / 100))), 2);
        $ownerSharePercent = (float) ($resource['owner_share_percent'] ?? 20);
        $ownerAmount = round($paidAmount * ($ownerSharePercent / 100), 2);
        $uploaderAmount = round($paidAmount - $ownerAmount, 2);

        $db = \Config\Database::connect();
        $db->table('resource_purchases')->insert([
            'user_id' => $userId,
            'resource_id' => $resourceId,
            'listed_price' => $price,
            'discount_percent' => $discountPercent,
            'paid_amount' => $paidAmount,
            'uploader_amount' => $uploaderAmount,
            'owner_amount' => $ownerAmount,
            'payment_method' => $paymentMethod,
            'status' => 'completed',
        ]);

        $db->table('user_transactions')->insert([
            'user_id' => $userId,
            'resource_id' => $resourceId,
            'transaction_type' => 'purchase',
            'payment_method' => $paymentMethod,
            'amount' => $paidAmount,
            'uploader_amount' => $uploaderAmount,
            'owner_amount' => $ownerAmount,
            'note' => "Book purchase completed via {$paymentMethod}",
        ]);

        // Send email receipt
        try {
            $emailService = new \App\Libraries\EmailService();
            $emailService->sendPurchaseReceipt($user['email'], $user['name'], $resource['title'], $paidAmount, $paymentMethod);
        } catch (\Throwable $e) {
            log_message('error', 'Failed to send purchase receipt email: ' . $e->getMessage());
        }

        return $this->respondCreated([
            'message' => 'Book purchase successful.',
            'pricing' => [
                'listed_price' => $price,
                'discount_percent' => $discountPercent,
                'paid_amount' => $paidAmount,
                'uploader_amount' => $uploaderAmount,
                'owner_amount' => $ownerAmount,
            ],
        ]);
    }

    public function openMaterial($id = null)
    {
        FeatureSchema::ensure();

        $user = $this->getAuthUser();
        if (! $user) {
            return $this->failUnauthorized('Authentication required to open a book.');
        }

        $resourceModel = new \App\Models\ResourceModel();
        $resource = $resourceModel->find($id);
        
        if (!$resource || ($resource['material_type'] ?? 'book') !== 'book') {
            return $this->failNotFound('Book not found.');
        }

        $userId = (int) $user['user_id'];
        $resourceId = (int) $resource['resource_id'];

        // Security check for unapproved materials
        if (! (bool) ($resource['is_approved'] ?? false)) {
            $isAdmin = ($user['role'] ?? '') === 'admin';
            $isOwner = $userId === (int) $resource['uploader_id'];
            
            if (! $isAdmin && ! $isOwner) {
                return $this->failNotFound('Book not found or pending approval.');
            }
        }

        $isOwner = $userId === (int) ($resource['uploader_id'] ?? 0);

        $price = (float) ($resource['price'] ?? 0);
        $hasPurchased = $this->hasPurchased($userId, $resourceId);
        $isAdmin = ($user['role'] ?? '') === 'admin';

        if ($price > 0 && ! $hasPurchased && ! $isAdmin && ! $isOwner) {
            $discount = 0.0;
            if ((int)($user['verification_status'] ?? 0) === 1) {
                $discount = (float) ($user['promo_discount'] ?? 0);
            }
            $discountedPrice = round(max(0, $price * (1 - ($discount / 100))), 2);
            return $this->respond([
                'error' => 'Purchase required before opening this book.',
                'discounted_price' => $discountedPrice,
                'discount_percent' => $discount,
            ], 402);
        }

        $openLimit = $this->getOpenLimitForUser($user);
        $openedCount = $openLimit ? $this->getOpenedCountInWindow($userId) : 0;

        $db = \Config\Database::connect();
        $alreadyOpened = $db->table('resource_access_logs')
            ->where('user_id', $userId)
            ->where('resource_id', $resourceId)
            ->countAllResults() > 0;

        if ($openLimit !== null && ! $alreadyOpened && ! $hasPurchased && ! $isOwner && $openedCount >= $openLimit) {
            return $this->respond([
                'error' => 'Open limit reached for your account tier.',
                'open_limit' => $openLimit,
                'opened_count' => $openedCount,
            ], 403);
        }

        if (! $alreadyOpened) {
            $db->table('resource_access_logs')->insert([
                'user_id' => $userId,
                'resource_id' => $resourceId,
            ]);

            if (! $isOwner) {
                $db->table('user_transactions')->insert([
                    'user_id' => $userId,
                    'resource_id' => $resourceId,
                    'transaction_type' => 'material_open',
                    'amount' => 0.00,
                    'uploader_amount' => 2.50,
                    'note' => 'Book opened (System Incentive)',
                ]);
            }
        } else {
            $db->table('resource_access_logs')
                ->where('user_id', $userId)
                ->where('resource_id', $resourceId)
                ->update(['opened_at' => date('Y-m-d H:i:s')]);

            if (! $isOwner) {
                $db->table('user_transactions')->insert([
                    'user_id' => $userId,
                    'resource_id' => $resourceId,
                    'transaction_type' => 'material_open',
                    'amount' => 0.00,
                    'uploader_amount' => 0.00,
                    'note' => 'Book re-opened',
                ]);
            }
        }

        $expiresAt = time() + 300;
        $token = $this->createReadToken($userId, $resourceId, $expiresAt);
        if (! $token) {
            return $this->respond(['error' => 'Reader is not configured on this server.'], 500);
        }

        return $this->respond([
            'message' => 'Book access granted.',
            'open_url' => site_url("book/{$resourceId}/read?uid={$userId}&exp={$expiresAt}&token={$token}"),
            'open_limit' => $openLimit,
            'opened_count' => $openLimit ? ($alreadyOpened ? $openedCount : $openedCount + 1) : null,
        ]);
    }

    public function readBook($id = null)
    {
        FeatureSchema::ensure();

        $resourceModel = new \App\Models\ResourceModel();
        $resource = $resourceModel->find($id);
        
        if (!$resource || ($resource['material_type'] ?? 'book') !== 'book') {
            return $this->failNotFound('Book not found.');
        }

        $userId = (int) ($this->request->getGet('uid') ?? 0);
        $expiresAt = (int) ($this->request->getGet('exp') ?? 0);
        $token = (string) ($this->request->getGet('token') ?? '');
        $isDownload = $this->request->getGet('download') === '1';

        if ($userId < 1 || $expiresAt < 1 || $token === '') {
            return $this->respond(['error' => 'Invalid reader token.'], 403);
        }

        if ($expiresAt < time()) {
            return $this->respond(['error' => 'Reader token has expired.'], 403);
        }

        $expectedToken = $this->createReadToken($userId, (int) $resource['resource_id'], $expiresAt);
        if (! $expectedToken || ! hash_equals($expectedToken, $token)) {
            return $this->respond(['error' => 'Reader token validation failed.'], 403);
        }

        // Additional check for unapproved materials (trusting the token but being explicit)
        if (! (bool) ($resource['is_approved'] ?? false)) {
             // If we are here, the token is valid, meaning openMaterial (which is secure) was called.
        }

        $price = (float) ($resource['price'] ?? 0);
        $hasPurchased = $this->hasPurchased($userId, (int) $resource['resource_id']);
        
        $userModel = new \App\Models\UserModel();
        $user = $userModel->find($userId);

        $isPro = $user && $this->isSubscriptionActive($user);
        $isAdmin = $user && ($user['role'] ?? '') === 'admin';

        if ($isDownload && $price > 0 && !$hasPurchased && !$isPro && !$isAdmin) {
            log_message('warning', "Unauthorized download attempt for resource {$id} by user {$userId}");
            return $this->respond([
                'error' => 'FORBIDDEN: Downloading premium materials is restricted to purchased accounts or Pro/Pro+ subscribers.',
                'warning' => 'Continuous unauthorized attempts may lead to account suspension.',
                'action' => 'purchase_required'
            ], 403);
        }

        if ($price > 0 && !$hasPurchased && !$isPro && !$isAdmin) {
            return $this->respond(['error' => 'Purchase or Pro subscription required for full access to this book.'], 403);
        }

        $path = (string) ($resource['file_path'] ?? '');
        if ($path === '') {
            return $this->respond(['error' => 'Book file is unavailable.'], 404);
        }

        if (preg_match('#^https?://#i', $path) === 1) {
            return redirect()->to($path);
        }

        return redirect()->to(base_url(ltrim($path, '/')));
    }

    public function myTransactions()
    {
        FeatureSchema::ensure();

        $user = $this->getAuthUser();
        if (! $user) {
            return $this->failUnauthorized('Authentication required.');
        }

        $db = \Config\Database::connect();
        $transactions = $db->table('user_transactions')
            ->where('user_id', (int) $user['user_id'])
            ->orderBy('created_at', 'DESC')
            ->get()
            ->getResultArray();

        return $this->respond($transactions);
    }
}
