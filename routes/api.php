<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiScheduleController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('schedules/{id}/relations', 'App\Http\Controllers\ApiScheduleController@relations')->name('api.schedules.relations');
Route::put('schedules/{id}', 'App\Http\Controllers\ApiScheduleController@update')->name('api.schedules.update');

Route::match(array('GET','POST'), '/search/person', 'App\Http\Controllers\ApiSearchController@person')->name('api.search.person');
Route::match(array('GET','POST'), '/search/course', 'App\Http\Controllers\ApiSearchController@course')->name('api.search.course');

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
