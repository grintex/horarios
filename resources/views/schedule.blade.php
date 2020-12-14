@extends('layouts.main')

@section('content')
    <div class="container-fluid">
        <div class="row">
            <div class="col-3 px-1 bg-dark position-fixed" id="sidebar">
                <div class="col-3" id="sidebar-summary" class="align-middle"></div>
                <div class="nav flex-column flex-nowrap vh-100 overflow-auto text-white p-2 pt-5">
                    <div>
                        <p class="font-weight-bold float-left">Docentes</p>
                    </div>
                    <table class="table table-dark" id="involedPersonnel">
                        <thead>
                            <tr>
                            <th scope="col">Nome</th>
                            <th scope="col">CCR</th>
                            <th scope="col">Créditos</th>
                            <th scope="col">Semana</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="col-9 offset-3" id="main">
                <div class="row meta-block">
                    <div class="col-lg-6">
                        <div class="card text-white bg-dark border-secondary">
                            <div class="card-header">
                                Curso
                            </div>
                            <div class="card-body">
                                <div class="dropdown" id="programSelector">
                                    <button class="btn btn-outline-light dropdown-toggle" type="button" id="buttonProgramSelector" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{ $program_name }}</button>
                                    <div class="dropdown-menu" aria-labelledby="buttonProgramSelector" id="dropdownMenuProgramSelector">
                                        @foreach ($relations as $user)
                                            <a class="dropdown-item dropdown-link" href="javascript:void(0);" data-url="oi/ola/test" data-program="{{ $user->uid }}">{{ str_replace('Coordenacao do Curso de ', '', $user->name) }}</a>
                                        @endforeach
                                    </div>
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
                                    <button class="btn btn-outline-light dropdown-toggle" type="button" id="buttonPeriodSelector" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{ $schedule->period }}</button>
                                    <div class="dropdown-menu" aria-labelledby="buttonPeriodSelector" id="dropdownMenuPeriodSelector">
                                        @foreach ($periods as $info)
                                            <a class="dropdown-item dropdown-link" href="javascript:void(0);" data-url="oi/ola/test/period" data-period="{{ $info->period }}">{{ $info->period }}</a>
                                        @endforeach                                        
                                    </div>
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
                                    <button class="btn btn-outline-light dropdown-toggle" type="button" id="buttonRevisionSelector" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{{ $rev_name }}</button>
                                    <div class="dropdown-menu" aria-labelledby="buttonRevisionSelector" id="dropdownMenuRevisionSelector">
                                        @foreach ($revisions as $schedule)
                                            <a class="dropdown-item dropdown-link" href="javascript:void(0);" data-url="oi/ola/test/schedule" data-schedule-id="{{ $schedule->id }}">{{ sprintf("REV%03d", $schedule->revision) }} - {{ $schedule->updated_at }}</a>
                                        @endforeach                                        
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
                        <button type="button" class="btn btn-out-dashed btn-huge btn-dark" data-toggle="modal" data-target="#modal-group">
                            <ion-icon name="add-circle-outline" class=""></ion-icon>
                            Adicionar uma fase nova
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <div class="modal fade" id="modal-course" tabindex="-1" role="dialog" aria-labelledby="modal-course-title" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modal-course-title">Informação de CCR</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="modal-course-form">
                        <input type="hidden" id="modal-course-id" value="">

                        <div class="form-group">
                            <label for="modal-course-name" class="font-weight-bold color-main">Nome</label>
                            <input type="text" class="form-control autocomplete" id="modal-course-name" data-url="{{ route('api.search.course') }}" autocomplete="off" placeholder="Ex.: GEX006 ou Geometria">
                        </div>

                        <div class="form-row">
                            <div class="form-group col-md-6">
                                <label for="modal-course-code" class="font-weight-bold color-main">Código</label>
                                <input type="text" class="form-control" id="modal-course-code" placeholder="Ex.: GEX602">
                            </div>
                            <div class="form-group col-md-6">
                                <label for="modal-course-credits" class="font-weight-bold color-main">Créditos</label>
                                <input type="text" class="form-control" id="modal-course-credits" placeholder="Ex.: 2" oninput="this.value=this.value.replace(/(?![0-9])./gmi,'')">
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="font-weight-bold color-main">Docentes responsáveis</label>
                        </div>

                        <div class="input-group mb-3">
                            <input type="text" class="form-control autocomplete" data-url="{{ route('api.search.person') }}" autocomplete="off" placeholder="Ex.: Fulano Silva" aria-describedby="courseSearch">
                            <div class="input-group-append">
                                <span class="input-group-text" id="courseSearch"><ion-icon name="search-outline"></ion-icon></span>
                            </div>
                        </div>

                        <div class="form-group" style="height: 200px; overflow: scroll;">
                            <div id="modal-course-members">
                                <ion-icon name="ion-loading-c"></ion-icon>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-light" data-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-success submit">Salvar</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="modal-group" tabindex="-1" role="dialog" aria-labelledby="model-group-title" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="model-group-title">Fase</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form id="modal-group-form">
                        <input type="hidden" id="modal-group-id" value="">
                        <div class="form-group">
                            <label for="modal-group-name">Nome</label>
                            <input type="text" class="form-control" id="modal-group-name" placeholder="Ex.: Noturno - 10a fase">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-light" data-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-success submit">Salvar</button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="modal-confirm" tabindex="-1" role="dialog" aria-labelledby="modal-confirm-title" aria-hidden="true">
        <input type="hidden" id="modal-confirm-element-type" />
        <input type="hidden" id="modal-confirm-element-id" />

        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modal-confirm-title">Confirma?</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body" id="modal-confirm-text">Texto</div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-light" data-dismiss="modal">Não</button>
                    <button type="button" class="btn btn-success submit">Sim</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        var HORARIOS_PAGE_DATA = @json($json_page_data, JSON_PRETTY_PRINT | JSON_NUMERIC_CHECK );
    </script>
@stop