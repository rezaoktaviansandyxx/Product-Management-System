<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductAttachmentController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SupplierController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/', function (Request $request) {
    return response()->json([
        'message' => 'Product Management API',
        'version' => '1.0.0'
    ]);
});

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/roles', [RoleController::class, 'index']);

// Route::get('/products/export', [ProductController::class, 'export']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Audit Logs
    Route::apiResource('audit-logs', AuditLogController::class);

    // Categories
    Route::post('/categories/import', [CategoryController::class, 'import']);
    Route::get('/categories/export', [CategoryController::class, 'export']);
    Route::get('/categories/deleted', [CategoryController::class, 'deleted']);
    Route::apiResource('categories', CategoryController::class);
    Route::post('/categories/{category}/restore', [CategoryController::class, 'restore'])
        ->withTrashed();

    // Suppliers
    Route::post('/suppliers/import', [SupplierController::class, 'import']);
    Route::get('/suppliers/export', [SupplierController::class, 'export']);
    Route::get('/suppliers/deleted', [SupplierController::class, 'deleted']);
    Route::apiResource('suppliers', SupplierController::class);
    Route::post('/suppliers/{supplier}/restore', [SupplierController::class, 'restore'])
        ->withTrashed();

    // Products
    Route::post('/products/import', [ProductController::class, 'import']);
    Route::get('/products/export', [ProductController::class, 'export']);
    Route::get('/products/deleted', [ProductController::class, 'deleted']);
    Route::apiResource('products', ProductController::class);
    Route::post('/products/{product}/restore', [ProductController::class, 'restore'])
        ->withTrashed();

    // Product Attachments
    Route::get('/products/{product}/attachments', [ProductAttachmentController::class, 'index']);
    Route::post('/products/{product}/attachments', [ProductAttachmentController::class, 'store']);
    Route::get('/products/{product}/attachments/{attachment}', [ProductAttachmentController::class, 'show']);
    Route::delete('/products/{product}/attachments/{attachment}', [ProductAttachmentController::class, 'destroy']);
    Route::get('/products/{product}/attachments/{attachment}/download', [ProductAttachmentController::class, 'download']);

    // Roles
    Route::post('/roles/import', [RoleController::class, 'import']);
    Route::get('/roles/export', [RoleController::class, 'export']);
    Route::get('/roles/deleted', [RoleController::class, 'deleted']);
    Route::get('/roles/{role}', [RoleController::class, 'show']);
    Route::post('/roles', [RoleController::class, 'store']);
    Route::put('/roles/{role}', [RoleController::class, 'update']);
    Route::delete('/roles/{role}', [RoleController::class, 'destroy']);
    Route::post('/roles/{role}/restore', [RoleController::class, 'restore'])
        ->withTrashed();
});

Route::middleware(['auth:sanctum', 'role:Administrator'])->group(function () {
    // Routes untuk admin
    Route::get('/users', function () {
        return User::with('role')->get();
    });

    Route::post('/users', [AuthController::class, 'createUser']);
    Route::put('/users/{user}', [AuthController::class, 'updateUser']);
    Route::delete('/users/{user}', [AuthController::class, 'deleteUser']);
    Route::post('/users/{user}/restore', [AuthController::class, 'restoreUser'])->withTrashed();
});
