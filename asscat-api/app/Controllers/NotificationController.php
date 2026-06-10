<?php

namespace App\Controllers;

use App\Libraries\FeatureSchema;
use App\Libraries\JwtAuth;
use App\Models\NotificationModel;
use CodeIgniter\RESTful\ResourceController;

class NotificationController extends ResourceController
{
    private function getAuthUser(): ?array
    {
        $header = $this->request->getHeaderLine('Authorization');
        $decoded = JwtAuth::decodeFromHeader($header);
        
        if (! $decoded || empty($decoded->uid)) {
            return null;
        }

        $userModel = new \App\Models\UserModel();
        return $userModel->find((int) $decoded->uid);
    }

    public function index()
    {
        FeatureSchema::ensure();
        $user = $this->getAuthUser();
        if (!$user) return $this->failUnauthorized();

        $notifModel = new NotificationModel();
        $notifications = $notifModel
            ->where('user_id', $user['user_id'])
            ->orderBy('created_at', 'DESC')
            ->limit(50)
            ->findAll();

        return $this->respond($notifications);
    }

    public function markAsRead($id = null)
    {
        FeatureSchema::ensure();
        $user = $this->getAuthUser();
        if (!$user) return $this->failUnauthorized();

        $notifModel = new NotificationModel();
        $notifModel->update($id, ['is_read' => 1]);

        return $this->respond(['message' => 'Notification marked as read.']);
    }

    public function markAllAsRead()
    {
        FeatureSchema::ensure();
        $user = $this->getAuthUser();
        if (!$user) return $this->failUnauthorized();

        $notifModel = new NotificationModel();
        $notifModel->where('user_id', $user['user_id'])->set(['is_read' => 1])->update();

        return $this->respond(['message' => 'All notifications marked as read.']);
    }

    public function delete($id = null)
    {
        FeatureSchema::ensure();
        $user = $this->getAuthUser();
        if (!$user) return $this->failUnauthorized();

        $notifModel = new NotificationModel();
        $notifModel->delete($id);

        return $this->respondDeleted(['message' => 'Notification deleted.']);
    }
}
