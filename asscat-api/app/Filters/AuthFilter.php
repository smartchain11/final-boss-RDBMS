<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Services;
use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

class AuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        if ($request->is('options')) {
            return;
        }

        $header = $request->getServer('HTTP_AUTHORIZATION') 
                  ?? $request->getServer('REDIRECT_HTTP_AUTHORIZATION') 
                  ?? $request->header('Authorization');

        if ($header instanceof \CodeIgniter\HTTP\Header) {
            $header = $header->getValue();
        }

        if (!$header) {
            return Services::response()
                ->setJSON(['error' => 'No authorization header provided.'])
                ->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED);
        }

        $parts = explode(' ', $header);
        if (count($parts) < 2) {
            return Services::response()
                ->setJSON(['error' => 'Malformed authorization header.'])
                ->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED);
        }
        $token = $parts[1];
        $key = env('JWT_SECRET');

        if (!$key) {
            log_message('error', 'JWT_SECRET environment variable is not set.');
            return Services::response()->setJSON(['error' => 'Server configuration error.'])->setStatusCode(ResponseInterface::HTTP_INTERNAL_SERVER_ERROR);
        }

        try {
            $decoded = JWT::decode($token, new Key($key, 'HS256'));

            $uri = $request->getUri()->getPath();
            
            $isManagementRoute = str_contains($uri, 'admin/course') || str_contains($uri, 'admin/section');
            
            if (str_starts_with($uri, 'admin/') && !$isManagementRoute && $decoded->role !== 'admin') {
                return Services::response()->setJSON(['error' => 'Admin role required.'])
                                           ->setStatusCode(ResponseInterface::HTTP_FORBIDDEN);
            }

            if ($isManagementRoute && !in_array($decoded->role, ['uploader', 'admin'])) {
                return Services::response()->setJSON(['error' => 'Uploader or Admin role required.'])
                                           ->setStatusCode(ResponseInterface::HTTP_FORBIDDEN);
            }

            if (str_starts_with($uri, 'upload/') && !in_array($decoded->role, ['uploader', 'admin'])) {
                return Services::response()->setJSON(['error' => 'Uploader or Admin role required.'])
                                           ->setStatusCode(ResponseInterface::HTTP_FORBIDDEN);
            }

            if (!empty($arguments)) {
                $userRole = $decoded->role;
                if (!in_array($userRole, $arguments, true)) {
                    return Services::response()->setJSON(['error' => 'You do not have permission to perform this action.'])
                                               ->setStatusCode(ResponseInterface::HTTP_FORBIDDEN);
                }
            }
        } catch (\Exception $e) {
            return Services::response()->setJSON(['error' => 'Invalid token.', 'message' => $e->getMessage()])->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED);
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
    }
}