<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Schedule;
use App\Utils\Sanitizer;
use Illuminate\Support\Facades\DB;

class ApiScheduleDataController extends Controller
{
    public function __construct()
    {
    }

    /**
     * 
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function groups($id)
    {
        $schedule = Schedule::where('id', $id)->first();

        if(!$schedule) {
            abort(404);
        }

        $data = json_decode($schedule->groups);
        return response()->json($data);
    }

    protected function findMembersInfo(array $courses)
    {
        $members = [];
        foreach($courses as $course) {
            $names = array_fill_keys($course['members'], true);
            $members = array_merge($members, $names);
        }

        $personnel = DB::connection('uffs-personnel')->table('personnel')
                        ->whereIn('uid', array_keys($members))
                        ->get();

        $result = [];

        foreach($personnel as $person) {
            $name = Sanitizer::clean($person->name);

            $item = new \stdClass();
            $item->name = ucwords($name);
            $item->email = $person->email;

            $result[$person->uid] = $item;
        }

        return $result;
    }

    /**
     * 
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function members($id)
    {
        $schedule = Schedule::where('id', $id)->first();

        if(!$schedule) {
            abort(404);
        }

        $courses = json_decode($schedule->courses, true);

        if(!$courses) {
            abort(500);
        }

        $result = $this->findMembersInfo($courses);
        return response()->json($result);
    }

    /**
     * 
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function schedule($id)
    {
        $schedule = Schedule::where('id', $id)->first();

        if(!$schedule) {
            abort(404);
        }

        $data = json_decode($schedule->courses);
        return response()->json($data);
    }

    protected function getGroupNameById($groupId, $groups) {
        $name = '';

        if(!is_array($groups)) {
            return '';
        }

        foreach($groups as $group) {
            if($group->id == $groupId) {
                $name = $group->name;
                break;
            }
        }

        return $name;
    }

    /**
     * 
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function evaluations($id)
    {
        $schedule = Schedule::where('id', $id)->first();

        if(!$schedule) {
            abort(404);
        }

        $courses = json_decode($schedule->courses, true);
        $groups = json_decode($schedule->groups);

        if(!$courses) {
            abort(500);
        }

        $members = $this->findMembersInfo($courses);
        $result = [];

        foreach($courses as $course) {
            foreach($course['members'] as $member) {
                $complement = count($course['members']) > 1 ? ' ('.$member.')' : '';
                $item = new \stdClass();
                $item->course = $course['name'] . $complement . ' - ' . $this->getGroupNameById($course['group'], $groups);
                $item->name = $members[$member]->name;
                $item->email = $members[$member]->email;
    
                $result[] = $item;
            }
        }

        return response()->json($result);
    }    
}
