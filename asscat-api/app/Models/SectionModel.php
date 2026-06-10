<?php
 namespace App\Models; use CodeIgniter\Model; class SectionModel extends Model { protected $table = 'course_sections'; protected $primaryKey = 'section_id'; protected $useAutoIncrement = true; protected $returnType = 'array'; protected $allowedFields = [ 'course_id', 'section_name', 'sort_order' ]; } 
