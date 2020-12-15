<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Schedule;
use App\Http\Controllers\ScheduleController;

class SchedulesController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    protected function redirectToMostRecentScheduleUserOwns(User $user) {
        $schedule = $user->schedules->last();

        if(!$schedule) {
            // TODO: show page informing user has no schedules.
            return abort(404);
        }

        return $this->redirectToSchedule($user, $schedule);
    }

    protected function redirectToSchedule(User $user, Schedule $schedule) {
        $params = [
            'uid' => $user->uid,
            'period' => $schedule->period,
            'schedule' => $schedule->id
        ];

        return redirect()->route('schedule.show', $params);
    }

    /**
     *
     * @return \Illuminate\Http\Response
     */
    public function redir($uid, $period = null)
    {
        $user = User::where('uid', $uid)->first();

        if (!$user) {
            return abort(404);
        }
        
        if($period == null) {
            return $this->redirectToMostRecentScheduleUserOwns($user);
        }

        $schedule = Schedule::where('period', $period)->first();

        if(!$schedule) {
            // TODO: inform user has no schedules in informed period
            return abort(404);
        }

        return $this->redirectToSchedule($user, $schedule);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show(Request $request, $uid)
    {
        $user = User::where('uid', $uid)->first();

        if (!$user) {
            return abort(404);
        }

        return view('schedules', [
            'owner' => $user,
            'schedules' => $user->schedules
        ]);
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $user = $request->user();

        return view('schedules', [
            'owner' => $user,
            'schedules' => $user->schedules
        ]);
    }
}
