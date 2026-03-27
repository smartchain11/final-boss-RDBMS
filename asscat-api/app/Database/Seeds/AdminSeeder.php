<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run()
    {
        $data = [
            'name'          => 'System Admin',
            'email'         => 'nulldev11@nullsec.null',
            'password_hash' => '$2y$10$dS7K2aWq4s9rdlbhYoZQ6uVTDxTPh0SgeawdkUl.wN5w5YhLVDkCe',
            'role'          => 'admin'
        ];

        $db = \Config\Database::connect();
        $builder = $db->table('users');
        $existing = $builder->where('email', $data['email'])->get()->getRow();

        if ($existing) {
            $builder->where('user_id', $existing->user_id)->update($data);
            echo "Admin user updated successfully.\n";
        } else {
            $builder->insert($data);
            echo "Admin user created successfully.\n";
        }
    }
}
