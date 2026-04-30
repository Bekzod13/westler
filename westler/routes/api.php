<?php

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminCompanyController;
use App\Http\Controllers\Admin\AdminGroupController;
use App\Http\Controllers\Admin\AdminGroupItemController;
use App\Http\Controllers\Admin\AdminHeroController;
use App\Http\Controllers\Admin\AdminLanguageController;
use App\Http\Controllers\Admin\AdminMediaController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminPartnerController;
use App\Http\Controllers\Admin\AdminServiceController;
use App\Http\Controllers\Admin\AdminTranslationController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\PublicController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API (no auth)
|--------------------------------------------------------------------------
*/
Route::prefix('public')->group(function () {
    Route::get('banners', [PublicController::class, 'banners']);
    Route::get('languages', [PublicController::class, 'languages']);
    Route::get('site', [PublicController::class, 'site']);
    Route::get('partners', [PublicController::class, 'partners']);
    Route::get('companies', [PublicController::class, 'companies']);
    Route::get('services', [PublicController::class, 'services']);
    Route::get('groups', [PublicController::class, 'groups']);
    Route::post('orders', [PublicController::class, 'createOrder']);
});

/*
|--------------------------------------------------------------------------
| Admin Auth (no auth required)
|--------------------------------------------------------------------------
*/
Route::post('admin/auth/login', [AdminAuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Admin API (auth:sanctum)
|--------------------------------------------------------------------------
*/
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    // Users
    Route::get('users', [AdminUserController::class, 'index']);
    Route::get('users/{id}', [AdminUserController::class, 'show']);
    Route::post('users', [AdminUserController::class, 'store']);
    Route::patch('users/{id}', [AdminUserController::class, 'update']);
    Route::delete('users/{id}', [AdminUserController::class, 'destroy']);

    // Languages
    Route::get('languages', [AdminLanguageController::class, 'index']);
    Route::get('languages/{id}', [AdminLanguageController::class, 'show']);
    Route::post('languages', [AdminLanguageController::class, 'store']);
    Route::patch('languages/{id}', [AdminLanguageController::class, 'update']);
    Route::delete('languages/{id}', [AdminLanguageController::class, 'destroy']);

    // Heroes
    Route::get('heroes', [AdminHeroController::class, 'index']);
    Route::get('heroes/{id}', [AdminHeroController::class, 'show']);
    Route::post('heroes', [AdminHeroController::class, 'store']);
    Route::patch('heroes/{id}', [AdminHeroController::class, 'update']);
    Route::delete('heroes/{id}', [AdminHeroController::class, 'destroy']);

    // Companies (singleton)
    Route::get('companies', [AdminCompanyController::class, 'show']);
    Route::patch('companies', [AdminCompanyController::class, 'update']);

    // Services
    Route::get('services', [AdminServiceController::class, 'index']);
    Route::get('services/{id}', [AdminServiceController::class, 'show']);
    Route::post('services', [AdminServiceController::class, 'store']);
    Route::patch('services/{id}', [AdminServiceController::class, 'update']);
    Route::delete('services/{id}', [AdminServiceController::class, 'destroy']);

    // Partners
    Route::get('partners', [AdminPartnerController::class, 'index']);
    Route::get('partners/{id}', [AdminPartnerController::class, 'show']);
    Route::post('partners', [AdminPartnerController::class, 'store']);
    Route::patch('partners/{id}', [AdminPartnerController::class, 'update']);
    Route::delete('partners/{id}', [AdminPartnerController::class, 'destroy']);

    // Groups
    Route::get('groups', [AdminGroupController::class, 'index']);
    Route::get('groups/{id}', [AdminGroupController::class, 'show']);
    Route::post('groups', [AdminGroupController::class, 'store']);
    Route::patch('groups/{id}', [AdminGroupController::class, 'update']);
    Route::delete('groups/{id}', [AdminGroupController::class, 'destroy']);

    // Group Items
    Route::get('groups/{groupId}/items', [AdminGroupItemController::class, 'index']);
    Route::get('groups/{groupId}/items/{itemId}', [AdminGroupItemController::class, 'show']);
    Route::post('groups/{groupId}/items', [AdminGroupItemController::class, 'store']);
    Route::patch('groups/{groupId}/items/{itemId}', [AdminGroupItemController::class, 'update']);
    Route::delete('groups/{groupId}/items/{itemId}', [AdminGroupItemController::class, 'destroy']);

    // Translations
    Route::get('translations', [AdminTranslationController::class, 'index']);
    Route::get('translations/{id}', [AdminTranslationController::class, 'show']);
    Route::patch('translations/{id}', [AdminTranslationController::class, 'update']);
    Route::delete('translations/{id}', [AdminTranslationController::class, 'destroy']);

    // Media
    Route::post('media/upload', [AdminMediaController::class, 'upload']);

    // Orders
    Route::get('orders', [AdminOrderController::class, 'index']);
    Route::delete('orders/{id}', [AdminOrderController::class, 'destroy']);
});
