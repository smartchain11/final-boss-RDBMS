<?php
namespace App\Controllers;

use App\Libraries\FeatureSchema;
use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;

class Register extends ResourceController {

    public function sendOtp()
    {
        FeatureSchema::ensure();

        $email = trim((string) ($this->request->getVar('email') ?? ''));
        if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->respond(['error' => 'A valid email address is required.'], 400);
        }

        $userModel = new UserModel();
        $existing = $userModel->where('email', $email)->first();

        if ($existing && (bool)($existing['email_verified'] ?? 1)) {
            return $this->respond(['error' => 'This email is already registered and verified.'], 409);
        }

        // Rejected users with max attempts
        if ($existing && (int)$existing['verification_status'] === 2 && (int)$existing['verification_attempts'] >= 3) {
            return $this->respond(['error' => 'Maximum verification attempts (3) reached. Registration locked.'], 403);
        }

        $db = \Config\Database::connect();

        // Rate limit
        $recentCount = $db->table('verification_codes')
            ->where('email', $email)
            ->where('type', 'email_verify')
            ->where('created_at >=', date('Y-m-d H:i:s', strtotime('-1 hour')))
            ->countAllResults();

        if ($recentCount >= 3) {
            return $this->respond(['error' => 'Too many verification requests. Please try again in 1 hour.'], 429);
        }

        // Invalidate old unused codes
        $db->table('verification_codes')
            ->where('email', $email)
            ->where('type', 'email_verify')
            ->where('used', 0)
            ->update(['used' => 1]);

        $code = \generateOtpCode();
        $expiresAt = date('Y-m-d H:i:s', strtotime('+15 minutes'));

        $db->table('verification_codes')->insert([
            'email' => $email,
            'code' => $code,
            'type' => 'email_verify',
            'expires_at' => $expiresAt,
        ]);

        try {
            $emailService = new \App\Libraries\EmailService();
            $emailService->sendVerificationCode($email, $code);
        } catch (\Throwable $e) {
            log_message('error', 'Failed to send registration OTP: ' . $e->getMessage());
            return $this->respond(['error' => 'Failed to send verification email. Please try again.'], 500);
        }

        return $this->respond(['message' => 'Verification code sent to your email.']);
    }

    public function create() {
        FeatureSchema::ensure();

        $userModel = new UserModel();

        $email = trim((string) ($this->request->getVar('email') ?? ''));
        $code = trim((string) ($this->request->getVar('code') ?? ''));
        $name = $this->request->getVar('name') ?? 'No Name';
        $password = $this->request->getVar('password');
        $role = $this->request->getVar('role') ?? 'student';
        $accountType = $this->request->getVar('account_type') ?? 'student';
        $educationLevel = $this->request->getVar('education_level') ?? 'none';

        if (empty($password)) {
            return $this->respond(['error' => 'Password is required'], 400);
        }

        if (!in_array($role, ['student', 'uploader'], true)) {
            return $this->respond(['error' => 'Invalid role. Choose either student or uploader.'], 400);
        }

        if (!in_array($accountType, ['regular', 'student'], true)) {
            $accountType = 'student';
        }

        if ($accountType === 'student') {
            if (! in_array($educationLevel, ['secondary', 'tertiary'], true)) {
                return $this->respond(['error' => 'Invalid education level. Choose secondary or tertiary.'], 400);
            }
        } else {
            $educationLevel = 'none';
        }

        // Verify OTP code
        $db = \Config\Database::connect();
        $record = $db->table('verification_codes')
            ->where('email', $email)
            ->where('code', $code)
            ->where('type', 'email_verify')
            ->where('used', 0)
            ->orderBy('created_at', 'DESC')
            ->get()
            ->getRowArray();

        if (! $record) {
            return $this->respond(['error' => 'Invalid or expired verification code. Please request a new one.'], 400);
        }

        if (\isOtpExpired($record['expires_at'])) {
            $db->table('verification_codes')
                ->where('code_id', $record['code_id'])
                ->update(['used' => 1]);
            return $this->respond(['error' => 'Verification code has expired. Request a new one.'], 400);
        }

        $proofFilePath = null;
        if ($accountType === 'student') {
            $file = $this->request->getFile('proof_file');
            if (!$file || !$file->isValid()) {
                return $this->respond(['error' => 'Proof of student status (ID/Document) is required for student accounts.'], 400);
            }

            if (!$file->hasMoved()) {
                $newName = $file->getRandomName();
                $file->move(FCPATH . 'uploads/proofs', $newName);
                $proofFilePath = 'uploads/proofs/' . $newName;
            }
        }

        $promoDiscount = 0.0;
        if ($accountType === 'student') {
            $promoDiscount = $educationLevel === 'tertiary' ? 20.0 : 15.0;
        }

        $data = [
            'name'            => $name,
            'email'           => $email,
            'password'        => $password,
            'email_verified'  => 1,
            'role'            => $role,
            'account_type'    => $accountType,
            'education_level' => $educationLevel,
            'promo_discount'  => $promoDiscount,
            'proof_file_path' => $proofFilePath,
            'verification_status' => $accountType === 'student' ? 0 : 1,
            'verification_attempts' => $accountType === 'student' ? 1 : 0,
        ];

        try {
            $existing = $userModel->where('email', $email)->first();
            if ($existing) {
                if ((int)$existing['verification_status'] === 2) {
                    $data['verification_attempts'] = (int)$existing['verification_attempts'] + 1;
                    $data['promo_discount'] = 0.0;
                    $data['email_verified'] = 1;

                    $userModel->setValidationRule('email', 'required|valid_email');

                    if ($userModel->update($existing['user_id'], $data)) {
                        // Mark OTP code as used
                        $db->table('verification_codes')
                            ->where('code_id', $record['code_id'])
                            ->update(['used' => 1]);

                        return $this->respondCreated([
                            'status' => 'success',
                            'message' => "Account updated (Attempt {$data['verification_attempts']}/3). Email verified.",
                            'attempts' => $data['verification_attempts']
                        ]);
                    }
                }
                return $this->respond(['error' => 'Email already registered.'], 400);
            }

            $result = $userModel->insert($data);
            if ($result) {
                $db->table('verification_codes')
                    ->where('code_id', $record['code_id'])
                    ->update(['used' => 1]);

                return $this->respondCreated([
                    'status' => 'success',
                    'message' => 'Registration successful. You can now log in.',
                    'account_type' => $accountType,
                    'education_level' => $educationLevel,
                    'promo_discount' => $promoDiscount,
                ]);
            } else {
                return $this->respond(['status' => 'error', 'errors' => $userModel->errors()], 400);
            }
        } catch (\Exception $e) {
            return $this->respond(['status' => 'exception', 'message' => $e->getMessage()], 500);
        }
    }
}
