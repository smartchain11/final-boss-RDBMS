<?php
namespace App\Models;
use CodeIgniter\Model;

class ResourceTagModel extends Model {
    protected $table = 'resource_tags';
    protected $allowedFields = ['resource_id', 'tag_id'];
    protected $useAutoIncrement = false;
}
