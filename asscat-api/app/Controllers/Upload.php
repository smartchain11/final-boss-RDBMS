<?php
namespace App\Controllers;

use App\Libraries\FeatureSchema;
use App\Libraries\JwtAuth;
use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\API\ResponseTrait;
use App\Models\ResourceModel;

class Upload extends ResourceController {
    use ResponseTrait;

    public function create() {
        FeatureSchema::ensure();

        $header = $this->request->getServer('HTTP_AUTHORIZATION');
        $decoded = JwtAuth::decodeFromHeader($header);
        if (! $decoded) {
            return $this->failUnauthorized('Invalid token.');
        }
        $uploaderId = $decoded->uid ?? null;

        $file = $this->request->getFile('file');
        $coverImage = $this->request->getFile('cover_image');
        $courseId = $this->request->getPost('course_id');
        $deptId = $this->request->getPost('dept_id');
        $title = $this->request->getPost('title');
        $description = $this->request->getPost('description');
        $link = $this->request->getPost('link');
        $bookAuthor = trim((string) ($this->request->getPost('book_author') ?? ''));
        $isbn = trim((string) ($this->request->getPost('isbn') ?? ''));
        $edition = trim((string) ($this->request->getPost('edition') ?? ''));
        $publisher = trim((string) ($this->request->getPost('publisher') ?? ''));
        $languageCode = trim((string) ($this->request->getPost('language_code') ?? ''));
        $pageCountInput = $this->request->getPost('page_count');
        $pageCount = $pageCountInput === null || $pageCountInput === '' ? null : (int) $pageCountInput;
        $freePreviewPagesInput = $this->request->getPost('free_preview_pages');
        $freePreviewPages = $freePreviewPagesInput === null || $freePreviewPagesInput === '' ? null : (int) $freePreviewPagesInput;
        $price = (float) ($this->request->getPost('price') ?? 0);
        $previewPercent = 20;
        $ownerSharePercent = 20;

        if ($price < 0) {
            return $this->fail('Price cannot be negative.', 400);
        }

        if ($pageCount !== null && $pageCount < 1) {
            return $this->fail('Page count must be 1 or higher.', 400);
        }

        if ($freePreviewPages !== null && $freePreviewPages < 1) {
            return $this->fail('Free preview pages must be 1 or higher.', 400);
        }

        if ($pageCount !== null && $freePreviewPages !== null && $freePreviewPages > $pageCount) {
            return $this->fail('Free preview pages cannot be greater than total page count.', 400);
        }

        $sectionId = null;
        if ($courseId) {
            $sectionModel = new \App\Models\SectionModel();
            $section = $sectionModel->where('course_id', $courseId)->first();
            if ($section) {
                $sectionId = $section['section_id'];
            }
        }

        if (!$title) {
            return $this->fail('Title is required');
        }

        if ($file && $file->isValid()) {
            $allowedExtensions = [
                'pdf', 'epub', 'docx', 'odt', 
                'mp4', 'mov', 'mp3', 'wav', 'aiff', 'ogg', 
                'jpeg', 'jpg', 'png', 'tiff', 'svg', 
                'csv', 'xlsx', 'html', 'xml', 'md'
            ];
            $extension = strtolower($file->getClientExtension());
            if (!in_array($extension, $allowedExtensions, true)) {
                return $this->fail('Invalid file type. Allowed: Documents (docx, odt, pdf, epub), Media (video, audio, images), Data (csv, xlsx), and Code (html, xml, md).', 400);
            }
        }

        $resourceModel = new ResourceModel();
        $coverImagePath = null;

        if ($coverImage && $coverImage->isValid() && !$coverImage->hasMoved()) {
            $coverName = $coverImage->getRandomName();
            $coverImage->move(FCPATH . 'uploads', $coverName);
            $coverImagePath = 'uploads/' . $coverName;
        }

        try {
            if ($file && $file->isValid() && !$file->hasMoved()) {
                $newName = $file->getRandomName();
                $file->move(FCPATH . 'uploads', $newName);

                $resourceModel->insert([
                    'section_id'    => $sectionId,
                    'dept_id'       => $deptId,
                    'uploader_id'   => $uploaderId,
                    'title'         => $title,
                    'book_author'   => $bookAuthor ?: null,
                    'isbn'          => $isbn ?: null,
                    'edition'       => $edition ?: null,
                    'publisher'     => $publisher ?: null,
                    'page_count'    => $pageCount,
                    'language_code' => $languageCode ?: null,
                    'description'   => $description,
                    'file_path'     => 'uploads/' . $newName,
                    'file_type'     => $file->getClientExtension(),
                    'material_type' => 'book',
                    'price'         => $price,
                    'owner_share_percent' => $ownerSharePercent,
                    'preview_percent' => $previewPercent,
                    'free_preview_pages' => $freePreviewPages,
                    'is_approved'   => false,
                    'cover_image_path' => $coverImagePath
                ]);

                return $this->respondCreated(['message' => 'Digital book uploaded successfully']);
            }
            
            if (!empty($link)) {
                $resourceModel->insert([
                    'section_id'    => $sectionId,
                    'dept_id'       => $deptId,
                    'uploader_id'   => $uploaderId,
                    'title'         => $title,
                    'book_author'   => $bookAuthor ?: null,
                    'isbn'          => $isbn ?: null,
                    'edition'       => $edition ?: null,
                    'publisher'     => $publisher ?: null,
                    'page_count'    => $pageCount,
                    'language_code' => $languageCode ?: null,
                    'description'   => $description,
                    'file_path'     => $link,
                    'file_type'     => 'link',
                    'material_type' => 'book',
                    'price'         => $price,
                    'owner_share_percent' => $ownerSharePercent,
                    'preview_percent' => $previewPercent,
                    'free_preview_pages' => $freePreviewPages,
                    'is_approved'   => false,
                    'cover_image_path' => $coverImagePath
                ]);
                return $this->respondCreated(['message' => 'Digital book link uploaded successfully']);
            }
        } catch (\CodeIgniter\Database\Exceptions\DatabaseException $e) {
            log_message('error', 'Database error during upload: ' . $e->getMessage());
            return $this->fail('Database error. Please ensure the section exists.', 409);
        } catch (\Exception $e) {
            log_message('error', 'General error during upload: ' . $e->getMessage());
            return $this->failServerError('An unexpected error occurred');
        }

        return $this->fail('Upload failed. No file or link provided.');
    }

    public function listMyResources() {
        FeatureSchema::ensure();

        $header = $this->request->getServer('HTTP_AUTHORIZATION');
        $decoded = JwtAuth::decodeFromHeader($header);
        if (! $decoded) {
            return $this->failUnauthorized('Invalid token.');
        }
        $uploaderId = $decoded->uid;

        $resourceModel = new ResourceModel();
        return $this->respond(
            $resourceModel->where('uploader_id', $uploaderId)->findAll()
        );
    }

    public function deleteMyResource($id = null) {
        FeatureSchema::ensure();

        $header = $this->request->getServer('HTTP_AUTHORIZATION');
        $decoded = JwtAuth::decodeFromHeader($header);
        if (! $decoded) {
            return $this->failUnauthorized('Invalid token.');
        }
        $uploaderId = $decoded->uid;

        $resourceModel = new ResourceModel();
        $resource = $resourceModel->find($id);

        if (!$resource) {
            return $this->failNotFound('Resource not found');
        }

        $resourceUploaderId = $resource['uploader_id'] ?? null;

        if ($resourceUploaderId != $uploaderId && $decoded->role !== 'admin') {
            return $this->failForbidden('You can only delete your own resources');
        }

        if ($resourceModel->delete($id)) {
            return $this->respondDeleted(['message' => 'Resource deleted successfully']);
        }

        return $this->failServerError('Could not delete resource');
    }
}
