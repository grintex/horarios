var members = {
    'fernando.bevilacqua': {id: 'fernando.bevilacqua', name: 'Fernando Bevilacqua', email: 'fernando.bevilacqua@uffs.edu.br'},
    'marco.spohn': {id: 'marco.spohn', name: 'Marco Aurelio Spohn', email: 'marco.spohn@uffs.edu.br'}
}

var courses = [
    {id: 'GCS011', name: 'Meio ambiente, economia e sociedade', group: 4, members: ['marco.spohn']},
    {id: 'AAS011', name: 'Algoritmos e Programação', group: 4, members: ['fernando.bevilacqua']},
];

var weekDays = [
    {id: 0, name: ""},
    {id: 1, name: "Segunda-feira"},
    {id: 2, name: "Terça-feira"},
    {id: 3, name: "Quarta-feira"},
    {id: 4, name: "Quinta-feira"},
    {id: 5, name: "Sexta-feira"},
    {id: 6, name: "Sábado"},
    {id: 7, name: "N/A"}
];

var periods = [
    {id: 1, name: "Manha1"},
    {id: 2, name: "Manha2"},
    {id: 3, name: "Tarde1"},
    {id: 4, name: "Tarde2"},
    {id: 5, name: "Noite1"},
    {id: 6, name: "Noite2"}
];

var groups = [
    {id: 1, name: 'Vespertino - 2ª Fase', grid: null},
    {id: 2, name: 'Vespertino - 4ª Fase', grid: null},
    {id: 3, name: 'Vespertino - 6ª Fase', grid: null},
    {id: 4, name: 'Vespertino - 8ª Fase', grid: null},
    {id: 5, name: 'Noturno - 1ª Fase', grid: null},
    {id: 6, name: 'Noturno - 3ª Fase', grid: null},
    {id: 7, name: 'Noturno - 5ª Fase', grid: null},
    {id: 8, name: 'Noturno - 7ª Fase', grid: null},
    {id: 9, name: 'Noturno - 9ª Fase', grid: null}
];

function createGrid(containerId, group, weekDays, periods) {
    var num = group.id;
    var key = 'group-' + num;

    $('#' + containerId).append(
        '<div id="' + key + '">' +
            '<h2>' + group.name + '</h2>' +
            '<div class="gridster"><ul></ul></div>' +
        '</div>'
    );

    var g = $('#' + key +' div.gridster ul').gridster({
        widget_base_dimensions: ['auto', 50],
        autogenerate_stylesheet: true,
        shift_widgets_up: false,
        shift_larger_widgets_down: false,
        min_cols: 8,
        max_cols: 8,
        widget_margins: [5, 5],
        resize: {
            enabled: false
        },
        collision: {
            wait_for_mouseup: true
        },
        draggable: {
            handle: 'header',
            start: function (e, ui, $widget) {
                console.log('START position: ' + ui.position.top + ' ' + ui.position.left);
            },

            drag: function (e, ui, $widget) {
                console.log('DRAG offset: ' + ui.pointer.diff_top + ' ' + ui.pointer.diff_left);
            },

            stop: function (e, ui, $widget) {
                console.log('STOP position: ' + ui.position.top + ' ' + ui.position.left);
            }
        }
    }).data('gridster');

    for(var i = 0; i < periods.length; i++) {
        g.add_widget('<li class="new"><header style="pointer-events: none;">|||</header>' + periods[i].name + '</li>', 1, 1, 1, i + 2);
    }

    for(var j = 0; j < weekDays.length; j++) {
        g.add_widget('<li class="new"><header style="pointer-events: none;">|||</header>' + weekDays[j].name + '</li>', 1, 1, j + 1, 1);
    }

    return g;
}


$(function () {
    for(var i = 0; i < groups.length; i++) {
        groups[i].grid = createGrid('container', groups[i], weekDays, periods);
    }    
});