<?php
namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\API\ResponseTrait;
use App\Models\ResourceModel;
use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

class Upload extends ResourceController {
    use ResponseTrait;

    public function create() {
        $header = $this->request->getServer('HTTP_AUTHORIZATION');
        $token = explode(' ', $header)[1];
        $key = env('JWT_SECRET');
        $decoded = JWT::decode($token, new Key($key, 'HS256'));
        $uploaderId = $decoded->uid ?? null;

        $file = $this->request->getFile('file');
        $courseId = $this->request->getPost('course_id');
        $deptId = $this->request->getPost('dept_id');
        $title = $this->request->getPost('title');
        $description = $this->request->getPost('description');
        $link = $this->request->getPost('link');

        $sectionId = null;
        if ($courseId) {
            $sectionModel = new \App\Models\SectionModel();
            $section = $sectionModel->where('course_id', $courseId)->first();
            if ($section) {
                $sectionId = $section['section_id'];
            }
        }

        if (!$title) {
            return $this->fail('Title is required');
        }

        $resourceModel = new ResourceModel();

        try {
            if ($file && $file->isValid() && !$file->hasMoved()) {
                $newName = $file->getRandomName();
                $file->move(FCPATH . 'uploads', $newName);

                $resourceModel->insert([
                    'section_id'    => $sectionId,
                    'dept_id'       => $deptId,
                    'uploader_id'   => $uploaderId,
                    'title'         => $title,
                    'description'   => $description,
                    'file_path'     => 'uploads/' . $newName,
                    'file_type'     => $file->getClientExtension(),
                    'is_approved'   => false
                ]);

                return $this->respondCreated(['message' => 'File uploaded successfully']);
            }
            
            if (!empty($link)) {
                $resourceModel->insert([
                    'section_id'    => $sectionId,
                    'dept_id'       => $deptId,
                    'uploader_id'   => $uploaderId,
                    'title'         => $title,
                    'description'   => $description,
                    'file_path'     => $link,
                    'file_type'     => 'link',
                    'is_approved'   => false
                ]);
                return $this->respondCreated(['message' => 'Link uploaded successfully']);
            }
        } catch (\CodeIgniter\Database\Exceptions\DatabaseException $e) {
            log_message('error', 'Database error during upload: ' . $e->getMessage());
            return $this->fail('Database error. Please ensure the section exists.', 409);
        } catch (\Exception $e) {
            log_message('error', 'General error during upload: ' . $e->getMessage());
            return $this->failServerError('An unexpected error occurred');
        }

        return $this->fail('Upload failed. No file or link provided.');
    }

    public function listMyResources() {
        $header = $this->request->getServer('HTTP_AUTHORIZATION');
        $token = explode(' ', $header)[1];
        $key = env('JWT_SECRET');
        $decoded = JWT::decode($token, new Key($key, 'HS256'));
        $uploaderId = $decoded->uid;

        $resourceModel = new ResourceModel();
        return $this->respond($resourceModel->where('uploader_id', $uploaderId)->findAll());
    }

    public function deleteMyResource($id = null) {
        $header = $this->request->getServer('HTTP_AUTHORIZATION');
        $token = explode(' ', $header)[1];
        $key = env('JWT_SECRET');
        $decoded = JWT::decode($token, new Key($key, 'HS256'));
        $uploaderId = $decoded->uid;

        $resourceModel = new ResourceModel();
        $resource = $resourceModel->find($id);

        if (!$resource) {
            return $this->failNotFound('Resource not found');
        }

        $resourceUploaderId = $resource['uploader_id'] ?? null;

        if ($resourceUploaderId != $uploaderId && $decoded->role !== 'admin') {
            return $this->failForbidden('You can only delete your own resources');
        }

        if ($resourceModel->delete($id)) {
            return $this->respondDeleted(['message' => 'Resource deleted successfully']);
        }

        return $this->failServerError('Could not delete resource');
    }
}