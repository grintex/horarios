<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\ApiScheduleController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Specific schedule
Route::get('schedule/{uid}/{period}/{schedule}', 'App\Http\Controllers\ScheduleController@show')->name('schedule.show');
Route::get('schedule/create', 'App\Http\Controllers\ScheduleController@create')->name('schedule.create');

// Schedules
Route::get('schedules', 'App\Http\Controllers\SchedulesController@index')->name('schedules');
Route::get('schedules/{uid}', 'App\Http\Controllers\SchedulesController@show')->name('schedules.user');
Route::get('schedules/{uid}/{period}', 'App\Http\Controllers\SchedulesController@redir');

// Forced logout
Route::post('logout/force', 'App\Http\Controllers\ForcedLogoutController@logout')->name('logout.forced');

Route::get('/', function () {
    return view('welcome');
});

Route::middleware(['auth:sanctum', 'verified'])->get('/dashboard', function () {
    return abort(404);
})->name('dashboard');
