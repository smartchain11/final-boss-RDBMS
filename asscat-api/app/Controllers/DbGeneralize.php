<?php

namespace App\Controllers;

use CodeIgniter\Controller;

class DbGeneralize extends Controller
{
    public function index()
    {
        $db = \Config\Database::connect();
        try {
            $db->query("ALTER TABLE resources ADD COLUMN dept_id INT AFTER section_id");
            $db->query("UPDATE resources SET dept_id = 3 WHERE section_id = 3");
            return "Database generalized successfully!";
        } catch (\Exception $e) {
            return "Database update notice: " . $e->getMessage();
        }
    }
}
