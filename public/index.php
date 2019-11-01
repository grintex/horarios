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
    <link rel="stylesheet" href="./css/gridster.css" media="screen">
    <link rel="stylesheet" href="./css/app.css" media="screen">
</head>

<body>
    <header class="bg-dark">
        <div class="container">
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                <a class="navbar-brand" href="./"><i class="icon ion-md-stopwatch"></i> Organizador de Horários</a>
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarText">
                    <ul class="navbar-nav mr-auto">
                        <li class="nav-item">
                            <a class="btn btn-outline-light ml-md-3" href="./logout">Sair</a>
                        </li>
                    </ul>
                    <span class="navbar-text">
                        <?php echo ucwords(strtolower($user->name)) . ' (' . $user->username . ')'; ?>
                    </span>
                </div>
            </nav>
        </div>
    </header>

    <div id="groups" class="container-fluid">
        <div class="row" id="groups-header">
            <div class="col-lg-12">
                <div class="card text-white bg-dark border-secondary status-meta">
                    <div class="card-header text-right">
                        <div class="dropdown" id="programSelector">
                            <button class="btn btn-outline-light dropdown-toggle" type="button" id="buttonProgramSelector" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
                            <div class="dropdown-menu" aria-labelledby="buttonProgramSelector" id="dropdownMenuProgramSelector"></div>
                        </div>
                    </div>
                    <div class="card-body"></div>
                </div>
            </div>
        </div>

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

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    <script src="./js/3rdparty/jquery.dsmorse-gridster.with-extras.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="./js/3rdparty/bootstrap.bundle.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="./js/3rdparty/store.everything.min.js" type="text/javascript" charset="utf-8"></script>
    <script src="./js/app.js" type="text/javascript" charset="utf-8"></script>

</body>

</html>