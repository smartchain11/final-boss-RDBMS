<?php

namespace App\Models;

use CodeIgniter\Model;

class ResourceModel extends Model
{
    protected $table            = 'resources';
    protected $primaryKey       = 'resource_id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $allowedFields    = [
        'section_id',
        'dept_id',
        'uploader_id',
        'title',
        'description',
        'file_path',
        'file_type',
        'is_approved'
    ];

    protected $useTimestamps = false; // We'll let MariaDB handle current_timestamp()
}
