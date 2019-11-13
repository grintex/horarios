<?php

require_once(__DIR__ . '/../../vendor/autoload.php');

session_start();

$shouldRedirect = false;
$error = '';

if(isset($_SESSION['authenticated']) && $_SESSION['authenticated']) {
    $shouldRedirect = true;
}

if(!$shouldRedirect && count($_REQUEST) > 0) {
    $params = array(
        'user' => isset($_REQUEST['user']) ? $_REQUEST['user'] : '',
        'password' => isset($_REQUEST['password']) ? $_REQUEST['password'] : ''
    );

    $auth = new \CCUFFS\Auth\AuthIdUFFS();
    $info = $auth->login($params);

    if($info === null) {
        $error = '<strong>Oops!</strong> Você informou um idUFFS ou uma senha inválidos.';

    } else {
        $_SESSION['authenticated'] = true;
        $_SESSION['user'] = $info;
        $shouldRedirect = true;
    }
}

if($shouldRedirect) {
    header('Location: ../');
    exit();
}

?>

<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>Horários - Login com idUFFS</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body>
<!-- partial:index.partial.html -->
<div class="login-page">
  <div class="form">
    <form class="register-form">
      <input type="text" placeholder="name"/>
      <input type="password" placeholder="password"/>
      <input type="text" placeholder="email address"/>
      <button>create</button>
      <p class="message">Already registered? <a href="#">Sign In</a></p>
    </form>
    <form class="login-form" method="post" action="<?php echo $_SERVER['PHP_SELF']; ?>">
      <input type="text" name="user" placeholder="Seu idUFFS, ex. fulano.detal"/>
      <input type="password" name="password" placeholder="Sua senha"/>
      <button>Entrar</button>
    </form>
  </div>
  <?php if(!empty($error)) { ?><p class="message"><?php echo $error ?></p><?php } ?>
</div>
<!-- partial -->

</body>
</html>