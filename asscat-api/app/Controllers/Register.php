<?php
namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;

class Register extends ResourceController {
    public function create() {
        $userModel = new UserModel();
        $json = $this->request->getJSON();

        if (!$json) {
            return $this->respond(['error' => 'No JSON data received by the server'], 400);
        }
        
        if (empty($json->password)) {
            return $this->respond(['error' => 'Password is required'], 400);
        }
        
        $role = 'student';
        if (isset($json->role)) {
            if (in_array($json->role, ['student', 'uploader'], true)) {
                $role = $json->role;
            } else {
                return $this->respond(['error' => 'Invalid role. Choose either student or uploader.'], 400);
            }
        }

        $data = [
            'name'          => $json->name ?? 'No Name',
            'email'         => $json->email ?? '',
            'password'      => $json->password,
            'role'          => $role
        ];

        try {
            $result = $userModel->insert($data);
            if ($result) {
                return $this->respondCreated(['status' => 'success', 'message' => 'User registered']);
            } else {
                return $this->respond(['status' => 'error', 'errors' => $userModel->errors()], 400);
            }
        } catch (\Exception $e) {
            return $this->respond(['status' => 'exception', 'message' => $e->getMessage()], 500);
        }
    }
}