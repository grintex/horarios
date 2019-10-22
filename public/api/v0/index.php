<?php

function loadFile($path) {
	if(!file_exists($path)) {
		throw new Error('Unable to open file: ' + $path);
	}

	$data = file_get_contents($path);
	return $data;
}

function loadDataFromProgram($programId, $name) {
	$programId = $programId + 0;
	$path = dirname(__FILE__) . '/data/programs/'.$programId.'/' . $name . '.json';
	$data = loadFile($path);
	return json_decode($data);
}

function loadData($name, $assoc = false) {
	$path = dirname(__FILE__) . '/data/' . $name . '.json';
	$data = loadFile($path);
	return json_decode($data, $assoc);
}

function updateCourse($programId, $courseAssoc) {
	$courses = loadDataFromProgram($programId, 'courses');
	$course = json_decode(json_encode($courseAssoc));

	$programId = $programId + 0;
	$path = dirname(__FILE__) . '/data/programs/'.$programId.'/courses.json';

	foreach($courses as $key => $existingCourse) {
		if($existingCourse->id == $course->id) {
			$courses[$key] = $course;
		}
	}

	$ok = file_put_contents($path, json_encode($courses, JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT));

	if($ok === false) {
		throw new Error('Error saving course data for program with id=' + $programId);
	}
}

// Get request params
$aMethod = isset($_REQUEST['method']) ? $_REQUEST['method'] : '';
$aProgramId = isset($_REQUEST['program']) ? (int)$_REQUEST['program'] : 0;
$aReturn = array('success' => true, 'method' => $aMethod, 'time' => time());

try {
	switch ($aMethod) {
		case 'context':
			$aReturn['data'] = array(
				'programs' => loadData('programs'),
				'members'  => loadData('members')
			);
			break;

		case 'programs':
			$aReturn['data'] = loadData('programs');
			break;

		case 'courses':
			$aReturn['data'] = loadDataFromProgram($aProgramId, 'courses');
			break;
			
		case 'readgroups':
			break;

		case 'updategroups':
			break;

		case 'updatecourse':
			$course = isset($_REQUEST['course']) ? $_REQUEST['course'] : false;

			if($course === false) {
				throw Error('Invalid course info');
			}

			updateCourse($aProgramId, $course);
			break;

        case 'ping':
            $aReturn['data'] = 'pong';
			break;

		case 'program':
			$programs = loadData('programs', true);

			if(!isset($programs[$aProgramId])) {
				throw new Error('Unknown program with id=' . $aProgramId);
			}

			$aReturn['data'] = array(
				'id'           => $aProgramId,
				'name'         => $programs[$aProgramId]['name'],
				'responsible'  => $programs[$aProgramId]['responsible'],
				'courses'      => loadDataFromProgram($aProgramId, 'courses'),
				'groups'       => loadDataFromProgram($aProgramId, 'groups')
			);
            break;

		default:
			$aReturn = array('failure' => true, 'message' => 'Unknow method');
			break;
	}
} catch(Exception $e) {
	$aReturn = array('success' => false, 'failure' => true, 'message' => $e->getMessage());
}

header("Content-Type: application/json; charset=utf-8");
echo json_encode($aReturn, JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT);