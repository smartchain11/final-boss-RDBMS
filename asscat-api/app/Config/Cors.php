<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;


class Cors extends BaseConfig
{
    
    public array $default = [
        
        'allowedOrigins' => array_filter(array_map('trim', explode(',', getenv('cors.allowedOrigins') ?: 'http://localhost:3000'))),

        
        'allowedOriginsPatterns' => [],

        
        'supportsCredentials' => true,

        
        'allowedHeaders' => ['Content-Type', 'Authorization', 'X-Requested-With'],

        
        'exposedHeaders' => [],

        
        'allowedMethods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

        
        'maxAge' => 7200,
    ];
}
