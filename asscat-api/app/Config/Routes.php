<?php
use CodeIgniter\Router\RouteCollection;


$routes->options('(:any)', function() {});

$routes->get('dbgeneralize', 'DbGeneralize::index');
$routes->get('/', 'Home::index');
$routes->post('auth/login', 'Auth::login');
$routes->post('auth/register/send-otp', 'Register::sendOtp');
$routes->post('auth/register', 'Register::create');
$routes->post('auth/verify-email', 'Auth::verifyEmail');
$routes->post('auth/send-verification', 'Auth::sendVerificationCode');
$routes->post('auth/resend-code', 'Auth::resendCode');
$routes->post('auth/forgot-password', 'Auth::forgotPassword');
$routes->post('auth/reset-password', 'Auth::resetPassword');
$routes->post('auth/upgrade', 'SubscriptionController::upgrade');

$routes->get('user/purchases', 'UserController::getPurchases');
$routes->get('user/profile', 'UserController::getProfile');
$routes->get('user/history', 'UserController::getHistory');
$routes->post('user/reverify', 'UserController::reVerifyUser');
$routes->get('user/earnings', 'UserController::getUploaderEarnings');
$routes->post('user/withdrawal/request', 'UserController::requestWithdrawal');
$routes->get('user/withdrawal/history', 'UserController::getWithdrawals');
$routes->get('user/payout/info', 'UserController::getPayoutInfo');
$routes->post('user/payout/pin', 'UserController::savePayoutPin');
$routes->post('user/payout/account/add', 'UserController::addPayoutAccount');
$routes->delete('user/payout/account/delete/(:num)', 'UserController::deletePayoutAccount/$1');
$routes->post('user/profile-image', 'UserController::uploadProfileImage');
$routes->get('user/departments', 'AdminController::listDepartments');

$routes->get('user/sessions', 'Auth::getSessions');
$routes->post('user/sessions/trust/(:num)', 'Auth::trustSession/$1');
$routes->delete('user/sessions/revoke/(:num)', 'Auth::revokeSession/$1');

$routes->get('user/notifications', 'NotificationController::index');
$routes->post('user/notification/read/(:num)', 'NotificationController::markAsRead/$1');
$routes->post('user/notifications/read-all', 'NotificationController::markAllAsRead');
$routes->delete('user/notification/delete/(:num)', 'NotificationController::delete/$1');

$routes->get('courses', 'CourseController::index');
$routes->get('courses/recent', 'CourseController::recent');
$routes->get('courses/all', 'CourseController::all');
$routes->get('departments', 'AdminController::listDepartments');
$routes->get('course/(:num)', 'CourseController::show/$1');
$routes->get('resource/(:num)', 'CourseController::resourceDetail/$1');
$routes->get('book/(:num)', 'CourseController::resourceDetail/$1');
$routes->post('resource/(:num)/purchase', 'CourseController::purchaseResource/$1');
$routes->post('book/(:num)/purchase', 'CourseController::purchaseResource/$1');
$routes->post('resource/(:num)/open', 'CourseController::openMaterial/$1');
$routes->post('book/(:num)/open', 'CourseController::openMaterial/$1');
$routes->get('book/(:num)/read', 'CourseController::readBook/$1');
$routes->get('transactions/my', 'CourseController::myTransactions');
$routes->post('upload/resource', 'Upload::create');
$routes->post('upload/book', 'Upload::create');
$routes->get('upload/my', 'Upload::listMyResources');
$routes->delete('upload/delete/(:num)', 'Upload::deleteMyResource/$1');
$routes->get('admin/resources/pending', 'AdminController::listPendingResources');
$routes->get('admin/books/pending', 'AdminController::listPendingResources');
$routes->get('admin/resources/all', 'AdminController::listAllResources');
$routes->get('admin/books/all', 'AdminController::listAllResources');
$routes->post('admin/resource/approve/(:num)', 'AdminController::approveResource/$1');
$routes->post('admin/book/approve/(:num)', 'AdminController::approveResource/$1');
$routes->delete('admin/resource/delete/(:num)', 'AdminController::deleteResource/$1');
$routes->delete('admin/book/delete/(:num)', 'AdminController::deleteResource/$1');

$routes->get('admin/users', 'AdminController::listUsers');
$routes->post('admin/user/toggle-status/(:num)', 'AdminController::toggleUserStatus/$1');
$routes->post('admin/user/reset-password/(:num)', 'AdminController::resetUserPassword/$1');

$routes->get('admin/sections', 'AdminController::listSections');
$routes->post('admin/section/add', 'AdminController::addSection');
$routes->put('admin/section/update/(:num)', 'AdminController::updateSection/$1');
$routes->delete('admin/section/delete/(:num)', 'AdminController::deleteSection/$1');

$routes->post('admin/course/add', 'AdminController::addCourse');
$routes->delete('admin/course/delete/(:num)', 'AdminController::deleteCourse/$1');

$routes->get('admin/departments', 'AdminController::listDepartments');
$routes->post('admin/department/add', 'AdminController::addDepartment');
$routes->delete('admin/department/delete/(:num)', 'AdminController::deleteDepartment/$1');

$routes->get('admin/users/unverified', 'AdminController::listUnverifiedUsers');
$routes->post('admin/user/verify/(:num)', 'AdminController::verifyUser/$1');
$routes->delete('admin/user/reject/(:num)', 'AdminController::deleteUser/$1');
