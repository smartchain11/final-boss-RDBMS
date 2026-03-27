<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class RdbmsMappingSeeder extends Seeder
{
    public function run()
    {
        $db = \Config\Database::connect();

        $db->query("CREATE TABLE IF NOT EXISTS `user_details` (
            `user_id` INT PRIMARY KEY,
            `bio` TEXT,
            `profile_image` VARCHAR(255),
            `specialization` VARCHAR(100),
            FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
        ) ENGINE=InnoDB;");

        $db->query("CREATE TABLE IF NOT EXISTS `tags` (
            `tag_id` INT AUTO_INCREMENT PRIMARY KEY,
            `tag_name` VARCHAR(50) UNIQUE NOT NULL
        ) ENGINE=InnoDB;");

        $db->query("CREATE TABLE IF NOT EXISTS `resource_tags` (
            `resource_id` INT,
            `tag_id` INT,
            PRIMARY KEY (`resource_id`, `tag_id`),
            FOREIGN KEY (`resource_id`) REFERENCES `resources`(`resource_id`) ON DELETE CASCADE,
            FOREIGN KEY (`tag_id`) REFERENCES `tags`(`tag_id`) ON DELETE CASCADE
        ) ENGINE=InnoDB;");

        try {
            $db->query("ALTER TABLE `courses` ADD CONSTRAINT `fk_course_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments`(`dept_id`) ON DELETE CASCADE;");
        } catch (\Exception $e) {}

        try {
            $db->query("ALTER TABLE `resources` ADD CONSTRAINT `fk_resource_dept` FOREIGN KEY (`dept_id`) REFERENCES `departments`(`dept_id`) ON DELETE SET NULL;");
        } catch (\Exception $e) {}

        echo "RDBMS Relational Mapping Applied Successfully!\n";
    }
}
