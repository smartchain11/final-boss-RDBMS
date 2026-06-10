<?php
define('FCPATH', __DIR__ . '/public/');
require FCPATH . '../app/Config/Paths.php';
$paths = new Config\Paths();
require rtrim($paths->systemDirectory, '\\/ ') . '/bootstrap.php';

$app = \Config\Services::codeigniter();
$app->initialize();

$db = \Config\Database::connect();
$tables = $db->listTables();

echo "DATABASE SCHEMA ANALYSIS\n";
echo "========================\n\n";

foreach ($tables as $table) {
    echo "TABLE: " . strtoupper($table) . "\n";
    echo "----------------------------------------\n";
    $fields = $db->getFieldData($table);
    foreach ($fields as $field) {
        $primary = $field->primary_key ? " [PRIMARY KEY]" : "";
        $nullable = $field->nullable ? "NULL" : "NOT NULL";
        echo sprintf("  %-25s %-15s %-10s %s\n", $field->name, strtoupper($field->type), $nullable, $primary);
    }
    
    // Count rows
    $count = $db->table($table)->countAllResults();
    echo "\n  => Total Records: $count\n";
    echo "========================================\n\n";
}
