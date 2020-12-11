<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ScheduleController;

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

Route::apiResource('schedules', ScheduleController::class);

Route::match(array('GET','POST'), '/search/person', 'App\Http\Controllers\ApiSearchController@person')->name('api.search.person');

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
