<?php

function loadFile($path) {
	if(!file_exists($path)) {
		throw new Error('Unable to open file');
	}
	$data = file_get_contents($path);
	return $data;
}

function loadDataFromProgram($programId, $name) {
	$programId = $programId + 0;
	$path = dirname(__FILE__) . '/data/programs/'.$programId.'/' . $name . '.json';
	
	if(!file_exists($path)) {
		throw new Error('Unable to load data from program with id=' . $programId);
	}
	
	$data = loadFile($path);
	return json_decode($data);
}

function loadData($name, $assoc = false) {
	$path = dirname(__FILE__) . '/data/' . $name . '.json';
	
	if(!file_exists($path)) {
		throw new Error('Unable to load data with name=' . $name);
	}

	$data = loadFile($path);
	return json_decode($data, $assoc);
}

// Get request params
$aMethod = isset($_REQUEST['method']) ? $_REQUEST['method'] : '';
$aProgramId = isset($_REQUEST['program']) ? (int)$_REQUEST['program'] : 0;
$aReturn = array('success' => true, 'method' => $aMethod, 'time' => time());

try {
	switch ($aMethod) {
		case 'programs':
			$aReturn['data'] = loadData('programs');
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

			$aReturn['data'] = $course;
			break;

        case 'ping':
            $aReturn['data'] = 'pong';
			break;

		case 'load':
			$programs = loadData('programs', true);

			if(!isset($programs[$aProgramId])) {
				throw Error('Unknown program with id=' . $aProgramId);
			}

			$aReturn['data'] = array(
				'program'      => $aProgramId,
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