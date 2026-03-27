<?php
namespace App\Models;
use CodeIgniter\Model;

class UserDetailModel extends Model {
    protected $table = 'user_details';
    protected $primaryKey = 'user_id';
    protected $allowedFields = ['user_id', 'bio', 'profile_image', 'specialization'];
}
