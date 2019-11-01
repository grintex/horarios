<?php

session_start();

if (!isset($_SESSION['authenticated']) || !$_SESSION['authenticated']) {
    header('Location: ./login/');
    exit();
}

$user = isset($_SESSION['user']) ? $_SESSION['user'] : (object) array('name' => '?', 'username' => '?');

?>

<!DOCTYPE html>

<head>
    <meta charset="utf-8">
    <title>Organizador de Horários - UFFS</title>

    <!-- Estilos lindos da aplicação -->
    <link rel="stylesheet" href="./css/bootstrap.min.css" media="screen">
    <link rel="stylesheet" href="./css/ionicons.min.css" media="screen">
    <link rel="stylesheet" href="./js/3rdparty/jquery.dsmorse-gridster.min.css" type="text/css">
    <link rel="stylesheet" href="./css/gridster.css?20191101" media="screen">
    <link rel="stylesheet" href="./css/app.css?20191101" media="screen">
</head>

<body>
    <header class="bg-dark">
        <div class="container">
            <nav class="navbar navbar-dark bg-dark">
                <div class="col-sm-4">
                    <a class="navbar-brand" href="./"><i class="icon ion-md-stopwatch"></i> Organizador de Horários</a>
                </div>
                <div class="col-sm-7 text-right">
                    <span class="navbar-text">
                        <?php echo ucwords(strtolower($user->name)) . '<br /><small>' . $user->username . '</small>'; ?>
                    </span>
                </div>
                <div class="col-sm-1">
                    <div class="user-area dropdown float-right">
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <img class="user-avatar rounded-circle" src="https://colorlib.com/polygon/sufee/images/admin.jpg" alt="User Avatar">
                        </a>
                        <div class="user-menu dropdown-menu">
                            <a class="nav-link" href="#"><i class="fa fa- user"></i>My Profile</a>
                            <a class="nav-link" href="#"><i class="fa fa- user"></i>Notifications <span class="count">13</span></a>
                            <a class="nav-link" href="#"><i class="fa fa -cog"></i>Settings</a>
                            <a class="nav-link" href="#"><i class="fa fa-power -off"></i>Logout</a>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    </header>

    <div class="container">
        <div class="row meta-block">
            <div class="col-lg-6">
                <div class="card text-white bg-dark border-secondary">
                    <div class="card-header">
                        Curso
                    </div>
                    <div class="card-body">
                        <div class="dropdown" id="programSelector">
                            <button class="btn btn-outline-light dropdown-toggle" type="button" id="buttonProgramSelector" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
                            <div class="dropdown-menu" aria-labelledby="buttonProgramSelector" id="dropdownMenuProgramSelector"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-2">
                <div class="card text-white bg-dark border-secondary">
                    <div class="card-header">
                        Período
                    </div>
                    <div class="card-body">
                        <div class="dropdown" id="periodSelector">
                            <button class="btn btn-outline-light dropdown-toggle" type="button" id="buttonPeriodSelector" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">2020.1</button>
                            <div class="dropdown-menu" aria-labelledby="buttonPeriodSelector" id="dropdownMenuPeriodSelector"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card text-white bg-dark border-secondary">
                    <div class="card-header">
                        Revisão
                    </div>
                    <div class="card-body">
                        <div class="dropdown" id="revisionSelector">
                            <button class="btn btn-outline-light dropdown-toggle" type="button" id="buttonRevisionSelector" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">REV001 - 01/11/2019 14:28</button>
                            <div class="dropdown-menu" aria-labelledby="buttonRevisionSelector" id="dropdownMenuRevisionSelector"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="groups" class="container-fluid">
        <div class="row" id="groups-header"></div>
        <div id="groups-content"></div>

        <div id="groups-footer">
            <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#modal-group">group</button>
        </div>
    </div>

    <!-- Modals -->
    <div class="modal fade" id="modal-course" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLongTitle">Add course</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="modal-course-form">
                        <input type="hidden" id="modal-course-id" value="">

                        <div class="form-group">
                            <label for="modal-course-name">CCR</label>
                            <input type="text" class="form-control" id="modal-course-name" placeholder="1234 Main St">
                        </div>

                        <div class="form-group">
                            <label>Docentes responsáveis</label>
                        </div>

                        <div class="form-group" style="height: 200px; overflow: scroll;">
                            <div class="form-check" id="modal-course-members">
                                Loading...
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary submit">Save changes</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="modal-group" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLongTitle">Add group</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="modal-group-form">
                        <input type="hidden" id="modal-group-id" value="">
                        <div class="form-group">
                            <label for="modal-group-name">Nome</label>
                            <input type="text" class="form-control" id="modal-group-name" placeholder="1234 Main St">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary submit">Save changes</button>
                </div>
            </div>
        </div>
    </div>

    <footer class="fdb-block footer-large bg-dark">
        <div class="container">
            <div class="row align-items-top text-center text-md-left">
                <div class="col-3 text-md-left">
                    <h3><strong>About Us</strong></h3>
                    <p>Far far away, behind the word mountains, far from the countries Vokalia and Consonantia, there live the blind texts.</p>
                </div>

                <div class="col-3"></div>

                <div class="col-3">
                    <h3><strong>Country B</strong></h3>
                    <p>Street Address 100<br>Contact Name</p>
                    <p>+13 827 312 5002</p>
                    <p><a href="https://www.froala.com">countryb@amazing.com</a></p>
                </div>

                <div class="col-3">
                    <h3><strong>Country B</strong></h3>
                    <p>Street Address 100<br>Contact Name</p>
                    <p>+13 827 312 5002</p>
                    <p><a href="https://www.froala.com">countryb@amazing.com</a></p>
                </div>
            </div>

            <div class="row mt-5">
                <div class="col text-center text-muted">
                    © 2018 Froala. All Rights Reserved
                </div>
            </div>
        </div>
    </footer>

    <script src="./js/3rdparty/jquery.min.js"></script>
    <script src="./js/3rdparty/jquery.dsmorse-gridster.with-extras.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="./js/3rdparty/bootstrap.bundle.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="./js/3rdparty/store.everything.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="./js/app.js" type="text/javascript" charset="utf-8"></script>

</body>

</html>