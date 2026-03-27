<?php
use CodeIgniter\Router\RouteCollection;


$routes->options('(:any)', function() {});

$routes->get('dbgeneralize', 'DbGeneralize::index');
$routes->get('/', 'Home::index');
$routes->post('auth/login', 'Auth::login');
$routes->post('auth/register', 'Register::create');
$routes->get('courses', 'CourseController::index');
$routes->get('courses/all', 'CourseController::all');
$routes->get('departments', 'AdminController::listDepartments');
$routes->get('course/(:num)', 'CourseController::show/$1');
$routes->get('resource/(:num)', 'CourseController::resourceDetail/$1');
$routes->post('upload/resource', 'Upload::create');
$routes->get('upload/my', 'Upload::listMyResources');
$routes->delete('upload/delete/(:num)', 'Upload::deleteMyResource/$1');
$routes->get('admin/resources/pending', 'AdminController::listPendingResources');
$routes->get('admin/resources/all', 'AdminController::listAllResources');
$routes->post('admin/resource/approve/(:num)', 'AdminController::approveResource/$1');
$routes->delete('admin/resource/delete/(:num)', 'AdminController::deleteResource/$1');

$routes->get('admin/sections', 'AdminController::listSections');
$routes->post('admin/section/add', 'AdminController::addSection');
$routes->put('admin/section/update/(:num)', 'AdminController::updateSection/$1');
$routes->delete('admin/section/delete/(:num)', 'AdminController::deleteSection/$1');

$routes->post('admin/course/add', 'AdminController::addCourse');
$routes->delete('admin/course/delete/(:num)', 'AdminController::deleteCourse/$1');

$routes->get('admin/departments', 'AdminController::listDepartments');
$routes->post('admin/department/add', 'AdminController::addDepartment');
$routes->delete('admin/department/delete/(:num)', 'AdminController::deleteDepartment/$1');