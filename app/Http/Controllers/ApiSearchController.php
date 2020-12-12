<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Utils\Sanitizer;
use stdClass;

class ApiSearchController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct() {}

    /**
     * 
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $pdo = DB::connection()->getPdo();
        
        return ['test' => 'dd'];
    }

    /**
     * 
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function person(Request $request)
    {
        $term = $request->get('q', '');
        $like = '%' . Sanitizer::clean($term) .'%';

        $personnel = DB::connection('index')->table('professors')
                        ->whereRaw('indexed_content LIKE ?', [$like])
                        ->limit(7)
                        ->get();

        $result = [];

        foreach($personnel as $person) {
            $name = Sanitizer::clean($person->name);

            $item = new stdClass();
            $item = new stdClass();
            $item->name = ucwords($name);
            $item->complement = $person->uid;
            $item->type = 'person';

            $result[$person->uid] = $item;
        }

        return array_values($result);
    }

    /**
     * 
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function course(Request $request)
    {
        $term = $request->get('q', '');
        $like = '%' . Sanitizer::clean($term) .'%';

        $courses = DB::connection('index')->table('courses')
                        ->whereRaw('indexed_content LIKE ?', [$like])
                        ->limit(7)
                        ->get();

        $result = [];

        foreach($courses as $course) {
            $item = new stdClass();
            $item->name = $course->cod_ccr . ' - '. $course->nome_ccr;
            $item->complement = $course->cr_ccr . 'CR ' . $course->ch_ccr . 'h' . ', ' . $course->desc_matriz;
            $item->type = 'course';
            
            $result[$course->cod_ccr] = $item;
        }

        return array_values($result);
    }
}