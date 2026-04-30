<?php

use App\Http\Controllers\LandingController;
use Illuminate\Support\Facades\Route;

Route::get('/', [LandingController::class, 'index'])->name('home');

Route::get('/admin/login', fn () => view('admin.login'))->name('admin.login');
Route::prefix('admin')->group(function () {
    Route::get('/{any?}', fn () => view('admin.app'))->where('any', '.*')->name('admin.app');
});
