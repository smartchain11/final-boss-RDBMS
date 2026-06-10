<?php

namespace App\Libraries;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class JwtAuth
{
    public static function decodeFromHeader(?string $authorizationHeader): ?object
    {
        if (empty($authorizationHeader)) {
            $authorizationHeader = $_SERVER['HTTP_AUTHORIZATION'] 
                                 ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] 
                                 ?? null;
        }

        if (empty($authorizationHeader)) {
            return null;
        }

        $parts = explode(' ', trim($authorizationHeader));
        if (count($parts) !== 2 || strtolower($parts[0]) !== 'bearer') {
            if (count($parts) === 1 && strlen($parts[0]) > 50) {
                $token = $parts[0];
            } else {
                return null;
            }
        } else {
            $token = $parts[1];
        }

        $key = $_ENV['JWT_SECRET'] ?? getenv('JWT_SECRET') ?? null;
        if (! $key) {
            log_message('error', 'JWT_SECRET missing in decodeFromHeader');
            return null;
        }
        
        $key = trim($key, '"\' ');

        try {
            return JWT::decode($token, new Key($key, 'HS256'));
        } catch (\Exception $e) {
            log_message('notice', 'JWT decode failed: ' . $e->getMessage());
            return null;
        }
    }
}
