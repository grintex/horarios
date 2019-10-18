var Horarios = {};

Horarios.App = function() {
    this.ENDPOINT_URL = './api/v0/?';
    
    this.data = {
        courses: []
    };
    
    this.active = {
        group: undefined,
        program: 1,
        user: {id: 'fernando.bevilacqua'}
    };

    this.boot = function() {
        this.buildInitialUI();
        this.load();
    };

    this.buildInitialUI = function() {
        this.buildModals();
    };

    this.buildFinalUI = function() {
        this.buildDropdownProgramSelection();
    };

    this.buildModals = function() {
        var self = this;

        $('#modal-add-course button.submit').click(function(e) { self.handleAddCourse(e) });
        $('#modal-add-group button.submit').click(function(e) { self.handleAddGroup(e); });
    
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
    };

    this.handleSelectProgram = function(e) {
        var anchor = $(e.currentTarget);
        var programId = anchor.data('program');
    
        if(programId == globals.active.program) {
            return;
        }
    
        this.selectProgram(programId);
    }

    this.buildDropdownProgramSelection = function() {
        var self = this;

        $('#dropdownMenuProgramSelector').empty();
    
        for(p in programs) {
            var program = programs[p];
    
            if(program.id == globals.active.program) {
                $('#buttonProgramSelector').html(program.name);
                continue;
            }
    
            $('#dropdownMenuProgramSelector').append('<a class="dropdown-item" href="javascript:void(0);" data-program="' + program.id + '">' + program.name + '</a>');
        }
        
        $('#dropdownMenuProgramSelector a').click(function(e) {
            self.handleSelectProgram(e);
        });
    };

    this.selectProgram = function(programId) {
        var self = this;

        console.debug('Program selected: ', programId);

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
            var courses = self.findCoursesByGroupId(group.id);
            group.grid = self.createGrid('container', group);
    
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

        this.buildDropdownProgramSelection();
    };

    this.init = function() {
        var programId = 1;

        this.buildFinalUI();
        this.selectProgram(programId);
    };

    this.load = function() {
        this.api({method: 'programs'}, function(data) {
            this.init();
        }, this);
    };

    this.api = function(params, callback, context) {
        var jqxhr = $.getJSON(this.ENDPOINT_URL, params);

        jqxhr.done(function(response) {
            console.debug('Response received:', response);

            if(response.success) {
                callback.call(context, response.data);
            } else {
                console.error('Endpoint error:', response.message);
            }
        });
        
        jqxhr.fail(function(e) {
            console.error('Ajax fail', e);
        });
    };

    this.onCourseMoved = function(data) {
        var course = this.getCourseById(data.course);

        if(course == null) {
            console.error('Unable to load course info: ' + data.course);
            return;
        }

        course.period = data.row | 0;
        course.weekDay = data.col | 0;

        this.checkConstraintsByCourse(course);
        this.updateCourse(course);
    };

    this.updateCourse = function(course) {
        console.log('Updating course', course);

        this.api({method: 'updatecourse', course: course}, function(data) {
            console.log('Course updated successfuly!', data);
        }, this);
    };

    this.loadCourses = function() {
        console.log('Loading courses', this.active.program);

        this.api({method: 'courses', program: this.active.program}, function(data) {
            console.log('Returned', data);
        }, this);
    };

    this.createGrid = function(containerId, group) {
        var self = this;
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
                    console.debug('START position: ' + ui.position.top + ' ' + ui.position.left);
                },
    
                drag: function (e, ui) {
                    console.debug('DRAG offset: ' + ui.pointer.diff_top + ' ' + ui.pointer.diff_left);
                },
    
                stop: function (e, ui) {
                    var data = ui.$helper.context.dataset;
                    self.onCourseMoved(data);
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
    
    this.findScheduleClashesByCourse = function(course) {
        var clashes = [];
        var candidates = this.findCoursesByWeekDayAndPeriod(course.weekDay, course.period);
    
        candidates.forEach(function(c) {
            if(c.id == course.id) {
                // We found the course that started the search
                return;
            }
    
            var hasMemberOverlap = false;
    
            course.members.forEach(function(member) {
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
    
    this.findWorkingImpedimentsByCourse = function(course) {
        // TODO: implement this
        return [];
    }
    
    this.checkConstraintsByCourse = function(course) {
        var clashes = this.findScheduleClashesByCourse(course);
        var impediments = this.findWorkingImpedimentsByCourse(course);
    
        if(clashes.length > 0) {
            // TODO: alert about clashes
            console.log('CLASHES FOUND:', clashes);
        }
    
        if(impediments.length > 0) {
            // TODO: alert about impediments
            console.log('WORKING IMPEDIMENTS FOUND:', impediments);
        }
    }
    
    this.findCoursesByWeekDayAndPeriod = function(weekDay, period) {
        var items = [];
    
        courses.forEach(function(course) {
            if(course.weekDay == weekDay && course.period == period)  {
                items.push(course);
            }
        });
    
        return items;
    }
    
    this.getCourseById = function(id) {
        var item = null;
    
        courses.forEach(function(course) {
            if(course.id == id) {
                item = course;
            }
        });
    
        return item;
    }
    
    this.getGroupById = function(id) {
        var item = null;
    
        groups.forEach(function(group) {
            if(group.id == id) {
                item = group;
            }
        });
    
        return item;
    }
    
    this.findCoursesByGroupId = function(groupId) {
        var items = [];
        
        courses.forEach(function(course) {
            if(course.group == groupId) {
                items.push(course);
            }
        });
    
        return items;
    }
    
    this.handleAddMember = function() {
        var name = $('#modal-member-name').val();
        var email = $('#modal-member-email').val();
        var emailParts = email.split('@');
        var emailUser = emailParts[0];
    
        members[emailUser] = {id: emailUser, name: name, email: email};
        console.log('Member added:', emailUser, members[emailUser]);
    
        $('#modal-add-member').modal('hide');
    }
    
    this.getNextCourseId = function() {
        var highest = 0;
    
        courses.forEach(function(course) {
            if(course.id > highest) {
                highest = course.id;
            }
        });
    
        return highest + 1;
    }
    
    this.getNextGroupId = function() {
        var highest = 0;
    
        groups.forEach(function(group) {
            if(group.id > highest) {
                highest = group.id;
            }
        });
    
        return highest + 1;
    }
    
    this.addCourse = function(courseObj) {
        var group = this.getGroupById(courseObj.group);
    
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
    
    this.addGroup = function(groupObj) {
        groupObj.grid = this.createGrid('container', groupObj);
        groups.push(groupObj);
        console.log('Group added: ', groups[groups.length - 1]);
    }
    
    this.handleAddCourse = function() {
        var selectedMembers = [];
    
        $('#modal-course-members input:checked').each(function(i, el) {
            selectedMembers.push($(el).val());
        });
    
        var newId = this.getNextCourseId();
        var name = $('#modal-course-name').val();
    
        this.addCourse({
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
    
    this.handleAddGroup = function() {
        var name = $('#modal-group-name').val();
        
        this.addGroup({
            id: this.getNextGroupId(),
            name: name
        });
    
        $('#modal-add-group').modal('hide');
    }
};

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

$(function () {
    var app = new Horarios.App();
    app.boot();

    setInterval(function() {
        // Store current user
        store.set('something', courses);
        console.debug('Saving data...');
    }, 2000);
});

