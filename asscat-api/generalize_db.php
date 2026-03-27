<?php

use CodeIgniter\Boot;
use Config\Paths;

define('FCPATH', __DIR__ . DIRECTORY_SEPARATOR . 'public' . DIRECTORY_SEPARATOR);
chdir(FCPATH);
require FCPATH . '../app/Config/Paths.php';
$paths = new Paths();
require $paths->systemDirectory . '/Boot.php';

$db = \Config\Database::connect();

try {
    $db->query("ALTER TABLE resources ADD COLUMN dept_id INT AFTER section_id");
    
    $db->query("UPDATE resources r 
                JOIN course_sections s ON r.section_id = s.section_id 
                JOIN courses c ON s.course_id = c.course_id 
                SET r.dept_id = c.dept_id");
    
    $db->query("UPDATE resources SET dept_id = 3 WHERE section_id = 3 AND dept_id IS NULL");
    
    $db->query("UPDATE resources SET section_id = 1 WHERE section_id IS NULL OR section_id = 0");
    
    echo "Database generalized successfully!\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
