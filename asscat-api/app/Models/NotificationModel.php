<?php
 namespace App\Models; use CodeIgniter\Model; class NotificationModel extends Model { protected $table = 'notifications'; protected $primaryKey = 'notif_id'; protected $useAutoIncrement = true; protected $returnType = 'array'; protected $allowedFields = ['user_id', 'title', 'message', 'is_read']; protected $useTimestamps = false; } 
