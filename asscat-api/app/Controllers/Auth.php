<?php
namespace App\Controllers;
use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\API\ResponseTrait;
use App\Models\UserModel;
use \Firebase\JWT\JWT;

class Auth extends ResourceController {
    use ResponseTrait;

    public function login() {
        $userModel = new UserModel();
        
        $json = $this->request->getJSON();
        $email = $json->email ?? '';
        $password = $json->password ?? '';

        $user = $userModel->where('email', $email)->first();

        if (!$user) {
            return $this->respond(['error' => 'User not found. Please check your email.'], 401);
        }

        if (!password_verify($password, $user['password_hash'])) {
            return $this->respond(['error' => 'Invalid password.'], 401);
        }

        $key = env('JWT_SECRET');
        if (!$key) {
            log_message('error', 'JWT_SECRET environment variable is not set.');
            return $this->respond(['error' => 'Server configuration error.'], 500);
        }

        $payload = [
            "iat" => time(),
            "exp" => time() + 3600, // Token expires in 1 hour
            "uid" => $user['user_id'],
            "email" => $user['email'],
            "role" => $user['role']
        ];

        $token = JWT::encode($payload, $key, 'HS256');

        return $this->respond([
            'message' => 'Login Successful',
            'token' => $token,
            'role' => $user['role']
        ], 200);
    }
}