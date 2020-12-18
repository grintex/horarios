<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Schedule;

class ApiScheduleController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function relations(Request $request, $id)
    {
        $schedule = Schedule::where('id', $id)->first();

        if(!$schedule) {
            abort(404);
        }

        $user_ids = User::where([
            ['uid', 'like', $schedule->relations],
            ['id', '<>', $schedule->user->id],
        
        ])->get()->map(function($user) {
            return $user->id;
        });

        $schedules = Schedule::whereIn('user_id', $user_ids)->with('user')->get();

        return $schedules;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $schedule = Schedule::where('id', $id)->first();

        if(!$schedule) {
            abort(404);
        }

        if($request->user()->id != $schedule->user_id) {
            abort(404);
        }

        // TODO: check the security of this
        $schedule->courses = $request->input('courses', '[]');
        $schedule->groups = $request->input('groups', '[]');

        $schedule->save();
    }
}
