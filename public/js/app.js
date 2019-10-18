var globals = {
    active: {
        group: undefined,
        program: 1
    },
    user: {id: 'fernando.bevilacqua'}
};

var members = {
    'fernando.bevilacqua': {id: 'fernando.bevilacqua', name: 'Fernando Bevilacqua', email: 'fernando.bevilacqua@uffs.edu.br'},
    'marco.spohn': {id: 'marco.spohn', name: 'Marco Aurelio Spohn', email: 'marco.spohn@uffs.edu.br'}
};

var programs = {
    1: {id: 1, name: 'Ciência da Computação', responsible: ['fernando.bevilacqua']},
    2: {id: 2, name: 'Matemática', responsible: ['fernando.bevilacqua']},
};

var courses = [
    {id: 1, code: 'GCS011', name: 'Meio ambiente, economia e sociedade', program: 1, group: 1, weekDay: 8, period: 2, members: ['marco.spohn']},
    {id: 2, code: 'AAS011', name: 'Algoritmos e Programação', program: 1,  group: 1, weekDay: 8, period: 2, members: ['fernando.bevilacqua']},
    {id: 3, code: 'BAS011', name: 'Programação I', program: 1, group: 2, weekDay: 8, period: 2, members: ['fernando.bevilacqua']},
    {id: 4, code: 'CAS011', name: 'Programação II', program: 1, group: 2, weekDay: 8, period: 2, members: ['fernando.bevilacqua']},
    {id: 5, code: 'MAS011', name: 'Matemática C', program: 2, group: 2, weekDay: 8, period: 2, members: ['fernando.bevilacqua']},
];

var weekDays = [
    {id: 1, name: ""},
    {id: 2, name: "Segunda-feira"},
    {id: 3, name: "Terça-feira"},
    {id: 4, name: "Quarta-feira"},
    {id: 5, name: "Quinta-feira"},
    {id: 6, name: "Sexta-feira"},
    {id: 7, name: "Sábado"},
    {id: 8, name: "N/A"}
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
            '<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#modal-add-course" data-group="' + group.id + '">member</button>' +
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
        max_rows: 7,
        min_rows: 7,
        widget_margins: [5, 5],
        resize: {
            enabled: false
        },
        collision: {
            wait_for_mouseup: true
        },
        draggable: {
            handle: 'header',

            start: function (e, ui) {
                console.log('START position: ' + ui.position.top + ' ' + ui.position.left);
            },

            drag: function (e, ui) {
                console.log('DRAG offset: ' + ui.pointer.diff_top + ' ' + ui.pointer.diff_left);
            },

            stop: function (e, ui) {
                var data = ui.$helper.context.dataset;
                var course = getCourseById(data.course);

                if(course == null) {
                    console.error('Unable to load course info: ' + data.course);
                    return;
                }

                course.period = data.row | 0;
                course.weekDay = data.col | 0;

                checkConstraintsByCourse(course);
                console.debug('Course updated: ', course); // TODO: commit changes
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

function findScheduleClashesByCourse(course) {
    var clashes = [];
    var candidates = findCoursesByWeekDayAndPeriod(course.weekDay, course.period);

    candidates.forEach(function(c) {
        if(c.id == course.id) {
            // We found the course that started the search
            return;
        }

        var hasMemberOverlap = false;

        course.members.forEach(function(member) {
            console.log(c.members);
            if(c.members.includes(member)) {
                hasMemberOverlap = true;
            }
        });

        if(hasMemberOverlap) {
            clashes.push(c);
        }
    });

    return clashes;
}

function findWorkingImpedimentsByCourse(course) {
    return [];
}

function checkConstraintsByCourse(course) {
    var clashes = findScheduleClashesByCourse(course);
    var impediments = findWorkingImpedimentsByCourse(course);

    if(clashes.length > 0) {
        // TODO: alert about clashes
        console.log('CLASHES FOUND:', clashes);
    }

    if(impediments.length > 0) {
        // TODO: alert about impediments
        console.log('WORKING IMPEDIMENTS FOUND:', impediments);
    }
}

function findCoursesByWeekDayAndPeriod(weekDay, period) {
    var items = [];

    courses.forEach(function(course) {
        if(course.weekDay == weekDay && course.period == period)  {
            items.push(course);
        }
    });

    return items;
}

function getCourseById(id) {
    var item = null;

    courses.forEach(function(course) {
        if(course.id == id) {
            item = course;
        }
    });

    return item;
}

function getGroupById(id) {
    var item = null;

    groups.forEach(function(group) {
        if(group.id == id) {
            item = group;
        }
    });

    return item;
}

function findCoursesByGroupId(groupId) {
    var items = [];
    
    courses.forEach(function(course) {
        if(course.group == groupId) {
            items.push(course);
        }
    });

    return items;
}

function handleAddMember() {
    var name = $('#modal-member-name').val();
    var email = $('#modal-member-email').val();
    var emailParts = email.split('@');
    var emailUser = emailParts[0];

    members[emailUser] = {id: emailUser, name: name, email: email};
    console.log('Member added:', emailUser, members[emailUser]);

    $('#modal-add-member').modal('hide');
}

function getNextCourseId() {
    var highest = 0;

    courses.forEach(function(course) {
        if(course.id > highest) {
            highest = course.id;
        }
    });

    return highest + 1;
}

function getNextGroupId() {
    var highest = 0;

    groups.forEach(function(group) {
        if(group.id > highest) {
            highest = group.id;
        }
    });

    return highest + 1;
}

function addCourse(courseObj) {
    var group = getGroupById(courseObj.group);

    if(!group) {
        console.error('Provided course has invalid group. Course: ', courseObj);
    }

    if(!group.grid) {
        console.warn('Empty grid for group: ' + courseObj.group);
    }

    courses.push(courseObj);
    group.grid.add_widget('<li class="new" data-course="' + courseObj.id + '"><header>|||</header>' + courseObj.name + '</li>', 1, 1, 8, 2);

    console.log('Course added: ', courses[courses.length - 1]);
}

function addGroup(groupObj) {
    groupObj.grid = createGrid('container', groupObj, weekDays, periods);
    groups.push(groupObj);
    console.log('Group added: ', groups[groups.length - 1]);
}

function handleAddCourse() {
    var selectedMembers = [];

    $('#modal-course-members input:checked').each(function(i, el) {
        selectedMembers.push($(el).val());
    });

    var newId = getNextCourseId();
    var name = $('#modal-course-name').val();

    addCourse({
        id: newId,
        code: 'GCS011',
        name: name,
        group: globals.active.group,
        weekDay: 7,
        period: 1,
        members: selectedMembers
    });

    $('#modal-add-course').modal('hide');
    globals.active.group = undefined;
}


function handleAddGroup() {
    var name = $('#modal-group-name').val();
    
    addGroup({
        id: getNextGroupId(),
        name: name
    });

    $('#modal-add-group').modal('hide');
}

function loadProgram(programId) {
    console.log('LOAD program: ', programId);

    if(!programs[programId]) {
        console.error('Unable to load program with id=' + programId);
        return;
    }

    globals.active.program = programId;

    var c = store.get('something');
    if(c) {
        console.log('Restoring data from database', c);
    }

    $('#container').empty();

    groups.forEach(function(group) {
        var courses = findCoursesByGroupId(group.id);
        group.grid = createGrid('container', group, weekDays, periods);

        courses.forEach(function(course) {
            group.grid.add_widget(
                '<li class="new" data-course="' + course.id + '">' +
                    '<header>|||</header>' +
                    course.name +
                    '<br />' +
                    course.members.join(', ') +
                '</li>',
                1,
                1,
                course.weekDay,
                course.period);
        });
    });

    buildDropdownProgramSelection();
}

function handleSelectProgram(e) {
    var anchor = $(e.currentTarget);
    var programId = anchor.data('program');

    if(programId == globals.active.program) {
        return;
    }

    loadProgram(programId);
}

function buildDropdownProgramSelection() {
    $('#dropdownMenuProgramSelector').empty();

    for(p in programs) {
        var program = programs[p];

        if(program.id == globals.active.program) {
            $('#buttonProgramSelector').html(program.name);
            continue;
        }

        $('#dropdownMenuProgramSelector').append('<a class="dropdown-item" href="javascript:void(0);" data-program="' + program.id + '">' + program.name + '</a>');
    }
    
    $('#dropdownMenuProgramSelector a').click(handleSelectProgram);
}

$(function () {
    var programId = 1; // TODO: get this from a proper place
    loadProgram(programId);

    $('#modal-add-course button.submit').click(handleAddCourse);
    $('#modal-add-group button.submit').click(handleAddGroup);

    $('#modal-add-course').on('show.bs.modal', function (event) {
        var groupId = $(event.relatedTarget).data('group');
        var text = '';

        globals.active.group = groupId;
        console.log(globals.active.group);        

        for(memberId in members) {
            var member = members[memberId];
            var key = 'member-'+ memberId;

            text += 
                '<input class="form-check-input" type="checkbox" value="' + member.id + '" id="' + key + '">' +
                '<label class="form-check-label" for="' + key + '">'+ member.name + ' (' + member.email + ')</label>';
        }

        $('#modal-course-members').html(text);
    });

    buildDropdownProgramSelection();

    setInterval(function() {
        // Store current user
        store.set('something', courses);
        console.debug('Saving data...');
    }, 2000);

});