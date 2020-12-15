<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>Horarios | Grintex</title>

        <!-- Styles -->
        <style>
            /*! normalize.css v8.0.1 | MIT License | github.com/necolas/normalize.css */html{line-height:1.15;-webkit-text-size-adjust:100%}body{margin:0}a{background-color:transparent}[hidden]{display:none}html{font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;line-height:1.5}*,:after,:before{box-sizing:border-box;border:0 solid #e2e8f0}a{color:inherit;text-decoration:inherit}svg,video{display:block;vertical-align:middle}video{max-width:100%;height:auto}.bg-white{--bg-opacity:1;background-color:#fff;background-color:rgba(255,255,255,var(--bg-opacity))}.bg-gray-100{--bg-opacity:1;background-color:#f7fafc;background-color:rgba(247,250,252,var(--bg-opacity))}.border-gray-200{--border-opacity:1;border-color:#edf2f7;border-color:rgba(237,242,247,var(--border-opacity))}.border-t{border-top-width:1px}.flex{display:flex}.grid{display:grid}.hidden{display:none}.items-center{align-items:center}.justify-center{justify-content:center}.font-semibold{font-weight:600}.h-5{height:1.25rem}.h-8{height:2rem}.h-16{height:4rem}.text-sm{font-size:.875rem}.text-lg{font-size:1.125rem}.leading-7{line-height:1.75rem}.mx-auto{margin-left:auto;margin-right:auto}.ml-1{margin-left:.25rem}.mt-2{margin-top:.5rem}.mr-2{margin-right:.5rem}.ml-2{margin-left:.5rem}.mt-4{margin-top:1rem}.ml-4{margin-left:1rem}.mt-8{margin-top:2rem}.ml-12{margin-left:3rem}.-mt-px{margin-top:-1px}.max-w-6xl{max-width:72rem}.min-h-screen{min-height:100vh}.overflow-hidden{overflow:hidden}.p-6{padding:1.5rem}.py-4{padding-top:1rem;padding-bottom:1rem}.px-6{padding-left:1.5rem;padding-right:1.5rem}.pt-8{padding-top:2rem}.fixed{position:fixed}.relative{position:relative}.top-0{top:0}.right-0{right:0}.shadow{box-shadow:0 1px 3px 0 rgba(0,0,0,.1),0 1px 2px 0 rgba(0,0,0,.06)}.text-center{text-align:center}.text-gray-200{--text-opacity:1;color:#edf2f7;color:rgba(237,242,247,var(--text-opacity))}.text-gray-300{--text-opacity:1;color:#e2e8f0;color:rgba(226,232,240,var(--text-opacity))}.text-gray-400{--text-opacity:1;color:#cbd5e0;color:rgba(203,213,224,var(--text-opacity))}.text-gray-500{--text-opacity:1;color:#a0aec0;color:rgba(160,174,192,var(--text-opacity))}.text-gray-600{--text-opacity:1;color:#718096;color:rgba(113,128,150,var(--text-opacity))}.text-gray-700{--text-opacity:1;color:#4a5568;color:rgba(74,85,104,var(--text-opacity))}.text-gray-900{--text-opacity:1;color:#1a202c;color:rgba(26,32,44,var(--text-opacity))}.underline{text-decoration:underline}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.w-5{width:1.25rem}.w-8{width:2rem}.w-auto{width:auto}.grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}@media (min-width:640px){.sm\:rounded-lg{border-radius:.5rem}.sm\:block{display:block}.sm\:items-center{align-items:center}.sm\:justify-start{justify-content:flex-start}.sm\:justify-between{justify-content:space-between}.sm\:h-20{height:5rem}.sm\:ml-0{margin-left:0}.sm\:px-6{padding-left:1.5rem;padding-right:1.5rem}.sm\:pt-0{padding-top:0}.sm\:text-left{text-align:left}.sm\:text-right{text-align:right}}@media (min-width:768px){.md\:border-t-0{border-top-width:0}.md\:border-l{border-left-width:1px}.md\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (min-width:1024px){.lg\:px-8{padding-left:2rem;padding-right:2rem}}@media (prefers-color-scheme:dark){.dark\:bg-gray-800{--bg-opacity:1;background-color:#2d3748;background-color:rgba(45,55,72,var(--bg-opacity))}.dark\:bg-gray-900{--bg-opacity:1;background-color:#1a202c;background-color:rgba(26,32,44,var(--bg-opacity))}.dark\:border-gray-700{--border-opacity:1;border-color:#4a5568;border-color:rgba(74,85,104,var(--border-opacity))}.dark\:text-white{--text-opacity:1;color:#fff;color:rgba(255,255,255,var(--text-opacity))}.dark\:text-gray-400{--text-opacity:1;color:#cbd5e0;color:rgba(203,213,224,var(--text-opacity))}}
        </style>

        <link rel="stylesheet" href="{{ asset('css/bootstrap.min.css') }}" media="screen">
        <link rel="stylesheet" href="{{ asset('css/ionicons.min.css') }}" media="screen">
        <link rel="stylesheet" href="{{ asset('js/3rdparty/jquery.dsmorse-gridster.min.css') }}" type="text/css">
        <link rel="stylesheet" href="{{ asset('css/gridster.css') }}" media="screen">
        <link rel="stylesheet" href="{{ asset('css/main.css') }}" media="screen">
    </head>
    <body>
    <header class="bg-dark">
        <div class="container-fluid">
            <nav class="navbar navbar-dark bg-dark">
                <div class="col-sm-1"></div>
                <div class="col-sm-2 brand">
                    <img src="{{ asset('img/logo/grintex-logo-white-transparent.png') }}" title="Grintex" />
                </div>
                <div class="col-sm-2 text-left">
                    <a class="navbar-text" href="{{ route('schedules') }}"><ion-icon name="calendar-clear-outline" class="color-main align-middle"></ion-icon> Inicial</a>
                </div>
                <div class="col-sm-6 text-right">
                    <span class="navbar-text user-info">
                        <strong>{{ Auth::user()->name }}</strong><br />
                        <span>{{ Auth::user()->uid }}</span>
                    </span>
                </div>
                <div class="col-sm-1">
                    <div class="user-area dropdown float-left">
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <img class="user-avatar rounded-circle" src="{{ Auth::user()->profile_photo_url }}" alt="User Avatar">
                        </a>
                        <div class="user-menu dropdown-menu">
                            <a class="nav-link" href="https://id.uffs.edu.br"><i class="icon ion-md-contact"></i>Meu perfil</a>
                            <form method="POST" action="{{ route('logout') }}">
                                @csrf
                                <a class="nav-link" href="{{ route('logout') }}"
                                                    onclick="event.preventDefault();
                                                                this.closest('form').submit();">
                                    <i class="icon ion-md-log-out"></i>
                                    {{ __('Sair') }}
                                </a>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    </header>

    @yield('content')

    <footer class="" style="display: none;">
        <div class="container">
            <div class="row align-items-top text-center text-md-left">
                <div class="col-4 text-md-left">
                    <h3>Sobre</h3>
                    <p class="small">Esse site foi criado pelo <a href="https://grintex.uffs.cc">Grupo de Inovação Tecnológica Experimental (GRINTEX)</a> da <a href="http://uffs.edu.br" target="_blank">Universidade Federal da Fronteira Sul</a>, campus Chapecó/SC. Ele é coordenado por membros do curso de <a href="https://cc.uffs.edu.br">Ciência da Computação</a> com participação de várias entidades, como a Secretaria Especial de Tecnologia da Informação (SETI).</p>
                </div>

                <div class="col-2"></div>

                <div class="col-3">
                    <h3>Country B</h3>
                    <p>Street Address 100<br>Contact Name</p>
                    <p>+13 827 312 5002</p>
                    <p><a href="https://www.froala.com">countryb@amazing.com</a></p>
                </div>

                <div class="col-3">
                    <h3>Country B</h3>
                    <p>Street Address 100<br>Contact Name</p>
                    <p>+13 827 312 5002</p>
                    <p><a href="https://www.froala.com">countryb@amazing.com</a></p>
                    <p><a href="https://www.froala.com">countryb@amazing.com</a></p>
                    <p><a href="https://www.froala.com">countryb@amazing.com</a></p>
                </div>
            </div>
        </div>
    </footer>

    <script src="https://unpkg.com/ionicons@5.2.3/dist/ionicons.js"></script>
    
    <script src="{{ asset('js/3rdparty/jquery.min.js') }}"></script>
    <script src="{{ asset('js/3rdparty/jquery.dsmorse-gridster.with-extras.min.js') }}" ></script>
    <script src="{{ asset('js/3rdparty/bootstrap.bundle.min.js') }}"></script>
    <script src="{{ asset('js/3rdparty/bootstrap-autocomplete.min.js') }}"></script>
    <script src="{{ asset('js/3rdparty/store.everything.min.js') }}"></script>
    <script src="{{ asset('js/main.js') }}"></script>
    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
