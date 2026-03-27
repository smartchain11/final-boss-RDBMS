<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use App\Models\ResourceModel;

class AdminController extends ResourceController
{
    
    public function approveResource($id = null)
    {
        $resourceModel = new ResourceModel();
        $resource = $resourceModel->find($id);

        if (!$resource) {
            return $this->failNotFound('Resource not found.');
        }

        $resourceModel->update($id, ['is_approved' => true]);

        return $this->respond(['message' => 'Resource approved successfully.']);
    }

  
    public function listPendingResources()
    {
        $resourceModel = new ResourceModel();
        $resources = $resourceModel
            ->select('resources.*, users.name as uploader_name, course_sections.section_name, courses.title as course_title')
            ->join('users', 'users.user_id = resources.uploader_id', 'left')
            ->join('course_sections', 'course_sections.section_id = resources.section_id', 'left')
            ->join('courses', 'courses.course_id = course_sections.course_id', 'left')
            ->where('resources.is_approved', 0)
            ->findAll();
            
        return $this->respond($resources);
    }

  
    public function deleteResource($id = null)
    {
        $resourceModel = new ResourceModel();
        if (!$resourceModel->find($id)) {
            return $this->failNotFound('Resource not found.');
        }
        $resourceModel->delete($id);
        return $this->respondDeleted(['message' => 'Resource deleted successfully.']);
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
        $resourceModel = new ResourceModel();
        return $this->respond($resourceModel->findAll());
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
}