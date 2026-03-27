<?php

namespace App\Controllers;

use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\HTTP\ResponseInterface;
use App\Models\CourseModel;

class CourseController extends ResourceController
{
    
    public function index()
    {
        $resourceModel = new \App\Models\ResourceModel();
        $resources = $resourceModel
            ->select('resources.*, users.name as uploader_name, course_sections.section_name, courses.title as course_title, courses.dept_id')
            ->join('users', 'users.user_id = resources.uploader_id', 'left')
            ->join('course_sections', 'course_sections.section_id = resources.section_id', 'left')
            ->join('courses', 'courses.course_id = course_sections.course_id', 'left')
            ->where('resources.is_approved', true)
            ->findAll();
        
        return $this->respond($resources);
    }

    
    public function all()
    {
        $courseModel = new CourseModel();
        return $this->respond($courseModel->findAll());
    }

    
    public function show($id = null)
    {
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
                    'is_approved' => true
                ])->findAll();
        }

        $course['sections'] = $sections;

        return $this->respond($course);
    }

    
    public function create()
    {
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
        $resourceModel = new \App\Models\ResourceModel();
        $resource = $resourceModel
            ->select('resources.*, users.name as uploader_name, course_sections.section_name, courses.title as course_title')
            ->join('users', 'users.user_id = resources.uploader_id', 'left')
            ->join('course_sections', 'course_sections.section_id = resources.section_id', 'left')
            ->join('courses', 'courses.course_id = course_sections.course_id', 'left')
            ->find($id);

        if (!$resource) {
            return $this->failNotFound('Resource not found.');
        }

        return $this->respond($resource);
    }
}