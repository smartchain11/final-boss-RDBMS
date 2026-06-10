<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\ResourceModel;
use App\Libraries\FeatureSchema;

class AdminController extends ResourceController
{
    
    private function createNotification($userId, $title, $message)
    {
        $notifModel = new \App\Models\NotificationModel();
        $notifModel->insert([
            'user_id' => $userId,
            'title'   => $title,
            'message' => $message
        ]);
    }

    public function approveResource($id = null)
    {
        FeatureSchema::ensure();

        $resourceModel = new ResourceModel();
        $resource = $resourceModel->find($id);

        if (!$resource || ($resource['material_type'] ?? 'book') !== 'book') {
            return $this->failNotFound('Book not found.');
        }

        $resourceModel->update($id, ['is_approved' => true]);

        // Notify Uploader
        $this->createNotification(
            $resource['uploader_id'], 
            'Material Approved!', 
            "Congratulations! Your book \"{$resource['title']}\" has been verified and is now live on the platform."
        );

        return $this->respond(['message' => 'Book approved successfully.']);
    }

  
    public function listPendingResources()
    {
        FeatureSchema::ensure();

        $resourceModel = new ResourceModel();
        $resources = $resourceModel
            ->select('resources.*, users.name as uploader_name, course_sections.section_name, courses.title as course_title')
            ->join('users', 'users.user_id = resources.uploader_id', 'left')
            ->join('course_sections', 'course_sections.section_id = resources.section_id', 'left')
            ->join('courses', 'courses.course_id = course_sections.course_id', 'left')
            ->where('resources.is_approved', 0)
            ->where('resources.material_type', 'book')
            ->findAll();
            
        return $this->respond($resources);
    }

  
    public function deleteResource($id = null)
    {
        FeatureSchema::ensure();

        $resourceModel = new ResourceModel();
        $resource = $resourceModel->find($id);
        if (!$resource || ($resource['material_type'] ?? 'book') !== 'book') {
            return $this->failNotFound('Book not found.');
        }

        // Notify Uploader before delete
        $this->createNotification(
            $resource['uploader_id'], 
            'Material Rejected', 
            "Unfortunately, your submission \"{$resource['title']}\" did not meet our quality standards and has been rejected."
        );

        $resourceModel->delete($id);
        return $this->respondDeleted(['message' => 'Book deleted successfully.']);
    }

    public function addSection()
    {
        $sectionModel = new \App\Models\SectionModel();
        $data = [
            'section_name' => $this->request->getVar('section_name'),
            'course_id'    => $this->request->getVar('course_id') ?? 1,
            'sort_order'   => $this->request->getVar('sort_order') ?? 0
        ];

        if (!$data['section_name']) {
            return $this->fail('Section name is required');
        }

        if ($sectionModel->insert($data)) {
            return $this->respondCreated(['message' => 'Category created successfully']);
        }

        return $this->failServerError('Could not create category');
    }

    public function listSections()
    {
        $sectionModel = new \App\Models\SectionModel();
        return $this->respond($sectionModel->findAll());
    }

    public function updateSection($id = null)
    {
        $sectionModel = new \App\Models\SectionModel();
        if (!$sectionModel->find($id)) {
            return $this->failNotFound('Category not found');
        }

        $data = [
            'section_name' => $this->request->getVar('section_name'),
            'sort_order'   => $this->request->getVar('sort_order')
        ];

        $sectionModel->update($id, array_filter($data));
        return $this->respond(['message' => 'Category updated successfully']);
    }

    public function deleteSection($id = null)
    {
        $sectionModel = new \App\Models\SectionModel();
        if (!$sectionModel->find($id)) {
            return $this->failNotFound('Category not found');
        }
        $sectionModel->delete($id);
        return $this->respondDeleted(['message' => 'Category deleted successfully']);
    }

    public function listAllResources()
    {
        FeatureSchema::ensure();

        $resourceModel = new ResourceModel();
        return $this->respond(
            $resourceModel->where('material_type', 'book')->findAll()
        );
    }


    public function addCourse()
    {
        $header = $this->request->getServer('HTTP_AUTHORIZATION');
        $token = explode(' ', $header)[1];
        $key = env('JWT_SECRET');
        $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($key, 'HS256'));
        $uploaderId = $decoded->uid;

        $courseModel = new \App\Models\CourseModel();
        $data = [
            'title'       => $this->request->getVar('title'),
            'description' => $this->request->getVar('description'),
            'dept_id'     => $this->request->getVar('dept_id'),
            'uploader_id' => $uploaderId
        ];

        if (!$data['title'] || !$data['dept_id']) {
            return $this->fail('Title and Subject Category (Dept ID) are required');
        }

        if ($courseModel->insert($data)) {
            $courseId = $courseModel->getInsertID();
            
            $sectionModel = new \App\Models\SectionModel();
            $sectionModel->insert([
                'section_name' => 'General',
                'course_id'    => $courseId,
                'sort_order'   => 0
            ]);

            return $this->respondCreated(['message' => 'Course/Subject created successfully']);
        }

        return $this->failServerError('Could not create course');
    }

    public function deleteCourse($id = null)
    {
        $courseModel = new \App\Models\CourseModel();
        if (!$courseModel->find($id)) {
            return $this->failNotFound('Course not found');
        }
        $courseModel->delete($id);
        return $this->respondDeleted(['message' => 'Course deleted successfully']);
    }


    public function listDepartments()
    {
        $deptModel = new \App\Models\DepartmentModel();
        return $this->respond($deptModel->findAll());
    }

    public function addDepartment()
    {
        $deptModel = new \App\Models\DepartmentModel();
        $data = [
            'dept_name'   => $this->request->getVar('dept_name'),
            'description' => $this->request->getVar('description')
        ];

        if (!$data['dept_name']) {
            return $this->fail('Subject name is required');
        }

        if ($deptModel->insert($data)) {
            return $this->respondCreated(['message' => 'Subject added successfully']);
        }

        return $this->failServerError('Could not add subject');
    }

    public function deleteDepartment($id = null)
    {
        $deptModel = new \App\Models\DepartmentModel();
        if (!$deptModel->find($id)) {
            return $this->failNotFound('Subject not found');
        }
        $deptModel->delete($id);
        return $this->respondDeleted(['message' => 'Subject deleted successfully']);
    }

    public function listUsers()
    {
        FeatureSchema::ensure();
        $userModel = new \App\Models\UserModel();
        $users = $userModel->select('user_id, name, email, role, account_type, education_level, is_blocked, created_at')->findAll();
        return $this->respond($users);
    }

    public function toggleUserStatus($id = null)
    {
        FeatureSchema::ensure();
        $userModel = new \App\Models\UserModel();
        $user = $userModel->find($id);
        if (!$user) return $this->failNotFound('User not found');

        $newStatus = (int)!((bool)$user['is_blocked']);
        $userModel->update($id, ['is_blocked' => $newStatus]);

        return $this->respond(['message' => $newStatus ? 'User blocked successfully' : 'User unblocked successfully', 'is_blocked' => $newStatus]);
    }

    public function resetUserPassword($id = null)
    {
        FeatureSchema::ensure();
        $userModel = new \App\Models\UserModel();
        $user = $userModel->find($id);
        if (!$user) return $this->failNotFound('User not found');

        $newPassword = $this->request->getVar('password');
        if (empty($newPassword)) {
            return $this->fail('New password is required.', 400);
        }

        $userModel->update($id, ['password' => $newPassword]);

        return $this->respond(['message' => 'Password updated successfully.']);
    }

    public function listUnverifiedUsers()
    {
        FeatureSchema::ensure();
        $userModel = new \App\Models\UserModel();
        // 0 = pending verification
        $users = $userModel->where('verification_status', 0)->findAll();
        return $this->respond($users);
    }

    public function verifyUser($id = null)
    {
        FeatureSchema::ensure();
        $db = \Config\Database::connect();
        $user = $db->table('users')->where('user_id', $id)->get()->getRowArray();
        if (!$user) return $this->failNotFound('User not found');

        // Calculate and restore promo discount upon verification
        $promoDiscount = 0.0;
        if (($user['account_type'] ?? '') === 'student') {
            // Restore original discount based on level
            $promoDiscount = ($user['education_level'] ?? '') === 'tertiary' ? 20.0 : 15.0;
        }

        $db->table('users')->where('user_id', $id)->update([
            'verification_status' => 1,
            'promo_discount' => $promoDiscount
        ]);

        // Notify Student
        $this->createNotification(
            $id, 
            'ID Verification Successful!', 
            "Your student identity has been verified. You are now eligible for exclusive discounts and full platform access."
        );

        return $this->respond(['message' => 'User identity verified successfully.']);
    }

    public function deleteUser($id = null)
    {
        FeatureSchema::ensure();
        $userModel = new \App\Models\UserModel();
        if (!$userModel->find($id)) return $this->failNotFound('User not found');

        // Instead of deleting, we set status to 2 (Rejected) 
        // and strip them of promo eligibility as requested
        $userModel->update($id, [
            'verification_status' => 2,
            'promo_discount' => 0.0
        ]);

        // Notify Student
        $this->createNotification(
            $id, 
            'ID Verification Rejected', 
            "Your student ID proof was rejected. You can re-apply up to 3 times, but promo eligibility has been suspended."
        );
        
        return $this->respond(['message' => 'User application rejected. Profile preserved but promo-locked.']);
    }
}
