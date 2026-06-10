<?php
namespace App\Models;
use CodeIgniter\Model;

class UserModel extends Model {
    protected $table = 'users';
    protected $primaryKey = 'user_id';
    
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;

     protected $allowedFields = [
         'name', 
         'email', 
         'password', // Allow password to be set, it will be hashed by the callback
         'password_hash',
         'role',
         'account_type',
         'education_level',
         'promo_discount',
         'proof_file_path',
         'subscription_tier',
         'subscription_expires_at',
         'profile_image_path',
         'is_blocked',
         'verification_status',
         'verification_attempts'
     ];

    protected $beforeInsert = ['hashPassword'];
    protected $beforeUpdate = ['hashPassword'];

    protected $validationRules = [
        'email'         => 'required|valid_email|is_unique[users.email]',
        'name'          => 'required|min_length[2]',
        'password'      => 'required|min_length[6]'
    ];

    protected $validationMessages = [
        'email' => [
            'is_unique' => 'Sorry, that email is already registered.'
        ]
    ];

    protected function hashPassword(array $data) {
        if (!isset($data['data']['password'])) return $data;

        $data['data']['password_hash'] = password_hash($data['data']['password'], PASSWORD_BCRYPT);
        unset($data['data']['password']); // Important: remove plain password

        return $data;
    }
}
