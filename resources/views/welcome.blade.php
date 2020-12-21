@extends('layouts.main')

@section('content')
    <section class="fdb-block">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-12">
              <img alt="image" class="img-fluid rounded-0" src="{{ asset('img/undraw_online_calendar_kvu2.svg') }}">
            </div>
          </div>
        </div>
    </section>

    <section class="mb-5">
        <div class="container mt-5">
          <div class="row align-items-center">
            <div class="col-12 pb-5 pb-md-0">
              <h2>Organizador de horários</h2>
              <p class="text-muted">Essa é uma ferramenta online para ajudar com a criação e organização de horários nos cursos da <a href="https://www.uffs.edu.br">Universidade Federal da Fronteira Sul</a>. Esse sistema foi idealizado para ajudar a evitar choques de horários entre docentes de um mesmo curso e de outros cursos. </p>
              <p class="text-muted">O sistema foi desenvolvido pelo grupo <a href="https://grintex.uffs.cc">Grupo de Inovação Tecnológica Experimental</a> da Universidade Federal da Fronteira Sul, campus Chapecó. A ideia desse projeto surgiu no curso de Ciência da Computação e foi proposta no Forum de Gestão de Coordenadores de Curso do campus.</p>
              <p class="text-muted"><strong>IMPORTATE:</strong> esse site é completamente experimental e ainda está em desenvolvimento. </p>
            </div>
          </div>
        </div>
    </section>
@stop