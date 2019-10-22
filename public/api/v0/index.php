<?php

function loadFile($path) {
	if(!file_exists($path)) {
		throw new Error('Unable to open file: ' . $path);
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

function updateItem($programId, $name, $dataAssoc) {
	$items = loadDataFromProgram($programId, $name);
	$item = json_decode(json_encode($dataAssoc));

	$programId = $programId + 0;
	$path = dirname(__FILE__) . '/data/programs/'.$programId.'/'. $name .'.json';
	$found = false;

	foreach($items as $key => $existingItem) {
		if($existingItem->id == $item->id) {
			$items[$key] = $item;
			$found = true;
		}
	}

	if(!$found) {
		$items[] = $item;
	}

	$ok = file_put_contents($path, json_encode($items, JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT));

	if($ok === false) {
		throw new Error('Error saving ' . $name . ' data for program with id=' . $programId);
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

		case 'updategroup':
			$group = isset($_REQUEST['group']) ? $_REQUEST['group'] : false;

			if($group === false) {
				throw Error('Invalid group info');
			}

			updateItem($aProgramId, 'groups', $group);
			break;

		case 'updatecourse':
			$course = isset($_REQUEST['course']) ? $_REQUEST['course'] : false;

			if($course === false) {
				throw Error('Invalid course info');
			}

			updateItem($aProgramId, 'courses', $course);
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
			$aReturn = array('failure' => true, 'message' => 'Unknow method "' . $aMethod . '"');
			break;
	}
} catch(Exception $e) {
	$aReturn = array('success' => false, 'failure' => true, 'message' => $e->getMessage());
}

header("Content-Type: application/json; charset=utf-8");
echo json_encode($aReturn, JSON_NUMERIC_CHECK | JSON_PRETTY_PRINT);