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
        'book_author',
        'isbn',
        'edition',
        'publisher',
        'page_count',
        'language_code',
        'description',
        'file_path',
        'file_type',
        'material_type',
        'price',
        'owner_share_percent',
        'preview_percent',
        'free_preview_pages',
        'is_approved',
        'cover_image_path'
    ];

    protected $useTimestamps = false; // We'll let MariaDB handle current_timestamp()
}
