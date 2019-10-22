var Horarios = {};

Horarios.App = function() {
    this.ENDPOINT_URL = './api/v0/?';
    
    this.data = {
        program: null,
        members: {},
        programs: {}
    };
    
    this.active = {
        groupId: undefined,
        programId: 1,
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

        $('#modal-course button.submit').click(function(e) { self.handleModalCourseSubmit(e) });
        $('#modal-group button.submit').click(function(e) { self.handleModalGroupSubmit(e); });
    
        $('#modal-course').on('show.bs.modal', function (event) {
            var groupId = $(event.relatedTarget).data('group');
            var courseId = $(event.relatedTarget).data('course');
            var course = self.getCourseById(courseId);
            var text = '';

            self.active.groupId = groupId;
            console.log('group:', self.active.groupId, 'course: ', courseId);

            $('#modal-course-name').val(course ? course.name : '');
            $('#modal-course-id').val(course ? course.id : '');

            for(memberId in self.data.members) {
                var member = self.data.members[memberId];
                var key = 'member-'+ memberId;
                var checked = course && course.members.includes(memberId) ? 'checked="checked"' : '';

                text += 
                    '<input class="form-check-input" type="checkbox" value="' + member.id + '" id="' + key + '" ' + checked + '>' +
                    '<label class="form-check-label" for="' + key + '">'+ member.name + ' (' + member.email + ')</label>';
            }
    
            $('#modal-course-members').html(text);
        });
    };

    this.handleSelectProgram = function(e) {
        var anchor = $(e.currentTarget);
        var programId = anchor.data('program');

        if(programId == this.active.programId) {
            console.log('Skipping program selection because ids are not different.');
            return;
        }
    
        this.loadProgram(programId);
    }

    this.buildDropdownProgramSelection = function() {
        var self = this;

        $('#dropdownMenuProgramSelector').empty();
    
        for(p in self.data.programs) {
            var program = self.data.programs[p];
    
            if(program.id == this.active.programId) {
                $('#buttonProgramSelector').html(program.name);
                continue;
            }
    
            $('#dropdownMenuProgramSelector').append('<a class="dropdown-item" href="javascript:void(0);" data-program="' + program.id + '">' + program.name + '</a>');
        }
        
        $('#dropdownMenuProgramSelector a').click(function(e) {
            console.log(e);
            self.handleSelectProgram(e);
        });
    };

    this.loadProgram = function(programId) {
        console.log('Loading program with id=', programId);
        this.api({method: 'program', program: programId}, function(data) {
            console.log('Program loaded:', data);
            this.data.program = data;
            this.selectProgram(programId);
        }, this);
    };

    this.restoreDataFromLocalStorage = function(prgramId) {
        var c = store.get('something');
        
        if(c) {
            // TODO: restore data from database
        }
    };

    this.selectProgram = function(programId) {
        var self = this;

        this.active.programId = programId;
        console.debug('Program selected: ', programId);
    
        this.restoreDataFromLocalStorage();
    
        $('#container').empty();
    
        this.data.program.groups.forEach(function(group) {
            var courses = self.findCoursesByGroupId(group.id);
            group.grid = self.createGrid('container', group);

            courses.forEach(function(course) {
                group.grid.add_widget(
                    '<li class="new" data-course="' + course.id + '">' +
                        '<header>|||</header>' +
                        '<a href="javascript:void(0);" class="btn btn-primary" data-toggle="modal" data-target="#modal-course" data-course="' + course.id + '">[c]</a>' +
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

    this.init = function(context) {
        var programId = 1; // TODO: select this from URL

        if(!context) {
            console.error('Invalid context data. Unable to init.');
            return;
        }

        this.data.programs = context.programs;
        this.data.members = context.members;

        console.log('List of programs updated:', this.data.programs);
        console.log('List of members updated:', this.data.members);

        this.buildFinalUI();
        this.loadProgram(programId);
    };

    this.load = function() {
        this.api({method: 'context'}, function(data) {
            this.init(data);
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

        this.api({method: 'updatecourse', program: this.active.programId, course: course}, function(data) {
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
                '<button type="button" class="btn btn-primary" data-toggle="modal" data-target="#modal-course" data-group="' + group.id + '">member</button>' +
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
    
        this.data.program.courses.forEach(function(course) {
            if(course.weekDay == weekDay && course.period == period)  {
                items.push(course);
            }
        });
    
        return items;
    }
    
    this.getCourseById = function(id) {
        var item = null;
    
        this.data.program.courses.forEach(function(course) {
            if(course.id == id) {
                item = course;
            }
        });
    
        return item;
    }
    
    this.getGroupById = function(id) {
        var item = null;
    
        this.data.program.groups.forEach(function(group) {
            if(group.id == id) {
                item = group;
            }
        });
    
        return item;
    }
    
    this.findCoursesByGroupId = function(groupId) {
        var items = [];
        
        this.data.program.courses.forEach(function(course) {
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
    
        this.data.members[emailUser] = {id: emailUser, name: name, email: email};
        console.log('Member added:', emailUser, members[emailUser]);
    
        $('#modal-add-member').modal('hide');
    }
    
    this.getNextCourseId = function() {
        var highest = 0;
    
        this.data.program.courses.forEach(function(course) {
            if(course.id > highest) {
                highest = course.id;
            }
        });
    
        return highest + 1;
    }
    
    this.getNextGroupId = function() {
        var highest = 0;
    
        this.data.program.groups.forEach(function(group) {
            if(group.id > highest) {
                highest = group.id;
            }
        });
    
        return highest + 1;
    }
    
    this.addOrUpdateCourse = function(courseObj) {
        var isUpdate = courseObj.id;
        var group = this.getGroupById(courseObj.group);
    
        if(!group) {
            console.error('Provided course has invalid group. Course: ', courseObj);
        }
    
        if(!group.grid) {
            console.warn('Empty grid for group: ' + courseObj.group);
        }
    
        if(isUpdate) {
            // Update
            var course = this.getCourseById(courseObj.id);

            // TODO: improve this pile of crap
            for(var p in courseObj) {
                course[p] = courseObj[p];
            }

            this.updateCourse(course);
            
        } else {
            // Creating a new course
            courseObj.id = this.getNextCourseId();
            this.data.program.courses.push(courseObj);
            group.grid.add_widget('<li class="new" data-course="' + courseObj.id + '"><header>|||</header>' + courseObj.name + '</li>', 1, 1, 8, 2);
        
            console.log('Course added: ', courseObj);
        }
    }
    
    this.addGroup = function(groupObj) {
        groupObj.grid = this.createGrid('container', groupObj);
        this.data.program.groups.push(groupObj);
        
        console.log('Group added: ', groupObj);
    }
    
    this.handleModalCourseSubmit = function() {
        var selectedMembers = [];
    
        $('#modal-course-members input:checked').each(function(i, el) {
            selectedMembers.push($(el).val());
        });
    
        var id = $('#modal-course-id').val();
        var name = $('#modal-course-name').val();
    
        this.addOrUpdateCourse({
            id: id,
            code: 'GCS011',
            name: name,
            group: this.active.groupId,
            weekDay: 7,
            period: 1,
            members: selectedMembers
        });
    
        $('#modal-course').modal('hide');
        this.active.groupId = undefined;
    }
    
    this.handleModalGroupSubmit = function() {
        var name = $('#modal-group-name').val();
        
        this.addGroup({
            id: this.getNextGroupId(),
            name: name
        });
    
        $('#modal-group').modal('hide');
    }
};

// TODO: move this to API endpoint
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

// TODO: move this to API endpoint
var periods = [
    {id: 1, name: "Manha1"},
    {id: 2, name: "Manha2"},
    {id: 3, name: "Tarde1"},
    {id: 4, name: "Tarde2"},
    {id: 5, name: "Noite1"},
    {id: 6, name: "Noite2"}
];

$(function () {
    var app = new Horarios.App();
    app.boot();

    // TODO: move this into App class.
    setInterval(function() {
        // TODO: call store.set('horarios.data', app.data);
    }, 2000);
});

