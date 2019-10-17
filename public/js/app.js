var members = {
    'fernando.bevilacqua': {id: 'fernando.bevilacqua', name: 'Fernando Bevilacqua', email: 'fernando.bevilacqua@uffs.edu.br'},
    'marco.spohn': {id: 'marco.spohn', name: 'Marco Aurelio Spohn', email: 'marco.spohn@uffs.edu.br'}
}

var courses = [
    {id: 'GCS011', name: 'Meio ambiente, economia e sociedade', group: 4, members: ['marco.spohn']},
    {id: 'AAS011', name: 'Algoritmos e Programação', group: 4, members: ['fernando.bevilacqua']},
];

var weekDays = [
    {id: 0, name: "N/A"},
    {id: 1, name: "Segunda-feira"},
    {id: 2, name: "Terça-feira"},
    {id: 3, name: "Quarta-feira"},
    {id: 4, name: "Quinta-feira"},
    {id: 5, name: "Sexta-feira"},
    {id: 6, name: "Sábado-feira"}
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

function createGroupGrid(containerId, num) {
    var key = 'group-' + num;

    $('#' + containerId).append(
        '<div id="' + key + '">' +
            '<h2>' + key + '</h2>' +
            '<div class="gridster">' +
                '<ul>' +
                '</ul>' +
            '</div>' +
        '</div>'
    );

    var g = $('#' + key +' div.gridster ul').gridster({
        widget_base_dimensions: ['auto', 50],
        autogenerate_stylesheet: true,
        shift_widgets_up: false,
        shift_larger_widgets_down: false,
        min_cols: 7,
        max_cols: 7,
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
                e.preventDefault();
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
    
    g.add_widget('<li class="new"><header style="pointer-events: none;">|||</header>dddd</li>', 1, 1, 1, 1);
    g.add_widget('<li class="new"><header style="pointer-events: none;">|||</header>dddd</li>', 1, 1, 1, 2);
    g.add_widget('<li class="new"><header>|||</header>22</li>', 1, 1, 1, 3);
    g.add_widget('<li class="new"><header>|||</header>33</li>', 1, 1, 1, 4);
    g.add_widget('<li class="new"><header>|||</header>44</li>', 1, 1, 1, 5);
    g.add_widget('<li class="new"><header>|||</header>55</li>', 1, 1, 1, 6);

    return g;
}


$(function () {
    for(var i = 0; i < 2; i++) {
        groups[i].grid = createGroupGrid('container', i);
        
        var day = weekDays[d];

        items = '';
        for(var d = 0; d < weekDays.length; d++) {
            items += '<';
        }
/*
            var day = weekDays[d];
            for(var p = 0; p < periods.length; p++) {
                var period = periods[p];
                items += '<li data-row="1" data-col="1" data-sizex="1" data-sizey="1">' + + '</li>';
            }
        }*/
/*
        

        $('#container').append(
            '<div id="group-' + group.id + '" class="gridster">' +
                '<h2>Demo ' + group.id + '</h2>' +
                '<div class="gridster">' +
                    '<ul>' +
                        '<li data-row="1" data-col="1" data-sizex="1" data-sizey="1">0</li>' +
                        '<li data-row="1" data-col="3" data-sizex="1" data-sizey="1">1</li>' +
                    '</ul>' +
                '</div>' +
            '</div>'
        );
    }



    gridster[1] = $("#demo-2 ul").gridster({
        namespace: '#demo-2',
        widget_base_dimensions: [200, 110],
        widget_margins: [10, 10]
    }).data('gridster');
*/

    }    
});