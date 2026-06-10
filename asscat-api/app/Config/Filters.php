<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class Filters extends BaseConfig
{
    
    public array $aliases = [
        'csrf'          => \CodeIgniter\Filters\CSRF::class,
        'toolbar'       => \CodeIgniter\Filters\DebugToolbar::class,
        'honeypot'      => \CodeIgniter\Filters\Honeypot::class,
        'invalidchars'  => \CodeIgniter\Filters\InvalidChars::class,
        'secureheaders' => \CodeIgniter\Filters\SecureHeaders::class,
        'cors'          => \App\Filters\Cors::class,
        'auth'          => \App\Filters\AuthFilter::class,
    ];

    
    public array $globals = [
        'before' => [
            'cors',
        ],
        'after' => [
            'toolbar',
        ],
    ];

    
    public array $methods = [];

    
    public array $filters = [
        'auth' => [
            'before' => [
                'upload/*',
                'admin/*',
                'user/*',
                'auth/upgrade',
                'user/sessions/*',
                'resource/*/purchase',
                'resource/*/open',
                'book/*/purchase',
                'book/*/open',
                'transactions/*',
            ]
        ]
    ];
}
