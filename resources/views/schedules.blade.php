@extends('layouts.main')

@section('content')
    <div class="container">
        <div class="row">
            <div class="col-12 px-1 bg-dark">
                <div class="card text-white bg-dark border-secondary">
                    <div class="card-header">
                        Meus horários
                        <a href="{{ route('schedule.create') }}" class="btn btn-success float-right"><ion-icon name="add-circle-outline"></ion-icon> Novo horário</a>
                    </div>
                    <div class="card-body">
                        @if (count($schedules) == 0)
                            <div class="text-center">
                                <p class="text-secondary"><ion-icon name="sad-outline" style="font-size: 128px;"></ion-icon></p>
                                <p class="font-weight-bold">Oops!</p>
                                <p class="text-muted">Você ainda não criou um horário. <br />Como vamos ter aulas desse jeito?</p>
                            </div>
                        @else
                            <table class="table table-dark" id="involedPersonnel">
                                <thead>
                                    <tr>
                                        <th scope="col">Id</th>
                                        <th scope="col">Revisão</th>
                                        <th scope="col">Periodo</th>
                                        <th scope="col">Criação</th>
                                        <th scope="col">Última atualização</th>
                                        <th scope="col">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($schedules as $schedule)
                                        <tr>
                                            <td class="text-muted">{{ $schedule->id }}</td>
                                            <td><a href="{{ route('schedule.show', [$schedule->user->uid, $schedule->period, $schedule->id]) }}">{{ $schedule->revision > 0 ? sprintf('REV%03d', $schedule->revision) : 'Rascunho' }}</a></td>
                                            <td>{{ $schedule->period }}</td>
                                            <td>{{ $schedule->created_at }}</td>
                                            <td>{{ $schedule->updated_at }}</td>
                                            <td>
                                                <a href="{{ route('schedule.show', [$schedule->user->uid, $schedule->period, $schedule->id]) }}"><ion-icon name="create-outline"></ion-icon> Editar</a>
                                                <a class="ml-2" href="{{ route('schedule.show', [$schedule->user->uid, $schedule->period, $schedule->id]) }}"><ion-icon name="browsers-outline"></ion-icon> Visualizar</a>
                                            </td>
                                        </tr>
                                    @endforeach  
                                </tbody>
                            </table>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
@stop