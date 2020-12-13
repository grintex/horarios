<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Schedule;

class ScheduleController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum']);
    }


    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show($uid, $period, $schedule_id)
    {
        $user = User::where('uid', $uid)->first();

        if (!$user) return abort(404);

        $schedule = Schedule::where('id', $schedule_id)->where('period', $period)->first();

        if (!$schedule) return abort(404);

        $courses = json_decode($schedule->courses);
        $rev_name = 'RASCUNHO (em construção)';

        if($schedule->locked && $schedule->revision > 0) {
            $rev_name =  sprintf('REV%03d - %s', $schedule->revision, $schedule->updated_at);
        }

        $json_page_data = [
            'courses' => $courses,
            'schedule' => $schedule
        ];

        return view('schedule', [
            'schedule' => $schedule,
            'program_name' => str_replace('Coordenacao do Curso de ', '', $user->name),
            'rev_name' => $rev_name,
            'relations' => $this->findScheduleRelations($schedule),
            'revisions' => $this->findScheduleRevisions($schedule),
            'periods' => $this->findPeriods($user),
            'json_page_data' => $json_page_data
        ]);
    }

    protected function findScheduleRelations(Schedule $schedule)
    {
        $users = User::where('uid', 'like', $schedule->relations)->get();
        return $users;
    }

    protected function findScheduleRevisions(Schedule $schedule)
    {
        $schedules = Schedule::where('user_id', $schedule->user->id)
                                ->where('period', $schedule->period)
                                ->where('revision', '>', 0)
                                ->where('locked', 1)
                                ->get();

        return $schedules;
    }

    protected function findPeriods(User $user)
    {
        $periods = Schedule::where('user_id', $user->id)->groupBy('period')->orderByDesc('period')->get(['period']);
        return $periods;
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
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
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
