<?php

require_once(dirname(__FILE__) . '/../../vendor/autoload.php');

session_start();
unset($_SESSION);
session_destroy();

header('Location: ../');
exit();