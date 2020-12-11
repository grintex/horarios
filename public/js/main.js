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
        user: {id: 'fernando.bevilacqua'},
        readOnly: false
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

            if(course) {
                // We have existing course info for this modal. Let's update
                // all global controls with the selected course (which takes
                // precedence from everything else)
                self.active.groupId = course.group;
            }

            console.log('group:', self.active.groupId, 'course: ', courseId);

            $('#modal-course-name').val(course ? course.name : '');
            $('#modal-course-id').val(course ? course.id : '');

            for(memberId in {}) {
                var member = self.data.members[memberId];
                var key = 'member-'+ memberId;
                var checked = course && course.members.includes(memberId) ? 'checked="checked"' : '';

                text += 
                    '<input class="form-check-input" type="checkbox" value="' + member.id + '" id="' + key + '" ' + checked + '>' +
                    '<label class="form-check-label" for="' + key + '">'+ member.name + ' (' + member.email + ')</label>' +
                    '<a href="#"><img src="/examples/images/avatar/1.jpg" class="avatar" alt="Avatar"> Michael Holz</a>';
            }
    
            $('#modal-course-members').html(text);
        });

        $('#modal-group').on('show.bs.modal', function (event) {
            var groupId = $(event.relatedTarget).data('group');
            var group = self.getGroupById(groupId);

            $('#modal-group-id').val(group ? group.id : '');
            $('#modal-group-name').val(group ? group.name : '');
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
            group.grid = self.createGroupBlock('groups-content', group);

            courses.forEach(function(course) {
                group.grid.add_widget(
                    self.generateCourseGridNodeHTML(course),
                    1,
                    course.slots || 1,
                    course.weekDay,
                    course.period);
            });
        });

        this.buildDropdownProgramSelection();
        this.checkProgramConstraints();
        this.refreshInvoledPersonnelSidebar(this.findInvolvedPersonnel());
    };

    this.objToArray = function(obj) {
        var list = [];

        for(var p in obj) {
            list.push(obj[p]);
        }

        return list;
    };

    this.findInvolvedPersonnel = function() {
        var self = this;
        var personnel = {};

        this.data.program.groups.forEach(function(group) {
            var courses = self.findCoursesByGroupId(group.id);
            
            courses.forEach(function(course) {
                course.members.forEach(function(person) {
                    if(personnel[person] === undefined) {
                        personnel[person] = {id: person, weekDays: [], programs: [], periods: [], courses: []};
                    }
                    personnel[person].weekDays.push(course.weekDay);
                    personnel[person].programs.push(course.program);
                    personnel[person].periods.push(course.period);
                    personnel[person].courses.push(course);
                });
            });
        });

        return this.objToArray(personnel);
    };

    this.findUniqueCourses = function(courses, fromProgramId) {
        var unique = {};

        courses.forEach(function(course) {
            if(fromProgramId === undefined || fromProgramId == course.program) {
                unique[course.name] = course;
            }
        });

        return this.objToArray(unique);
    };

    // Source: https://gist.github.com/codeguy/6684588#gistcomment-2624012
    this.stringToSlug = function(str) {
        str = str.replace(/^\s+|\s+$/g, ''); // trim
        str = str.toLowerCase();
      
        // remove accents, swap ñ for n, etc
        var from = "àáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
        var to   = "aaaaaeeeeiiiioooouuuunc------";
    
        for (var i=0, l=from.length ; i<l ; i++) {
            str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
        }
    
        str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
            .replace(/\s+/g, '-') // collapse whitespace and replace by -
            .replace(/-+/g, '-'); // collapse dashes
    
        return str;
    };

    this.createWeekScheduleChart = function(person) {
        var content = '';

        ['S', 'T', 'Q', 'Q', 'S', 'S'].forEach(function(weekDay, idx) {
            var weekDayOccurrences = person.weekDays.filter(function(v){ return v === (idx + 2); }).length;

            content += '<div style="width: 12%; height: 100%; position: relative; margin-right: 3%; float: left;">' +
                        '<div style="position: absolute; bottom: 35%; width: 100%; height: ' + (1 + 64 * (weekDayOccurrences / 6.0)) + '%; background: #00BC80;">' + (weekDayOccurrences != 0 ? '<p style="font-size: 0.8em; position: absolute; top: -30px; left: 20%; color: #afafaf;">' + weekDayOccurrences  + '</p>': '') + '</div>' +
                        '<div style="position: absolute; left: 30%; bottom: 0; color: #8f8f8f;">' + weekDay + '</div>' +
                    '</div>';
        });
 
        return '<div style="width: 100%; height: 100px;">' + content + '</div>';
    };

    this.refreshInvoledPersonnelSidebar = function(personnel) {
        var self = this;
        var content = '';

        personnel.forEach(function(person) {
            var courses = self.findUniqueCourses(person.courses);
            var ch = courses.length * 4; // TODO: get ch from course
            var id = 'row-ip-' + self.stringToSlug(person.id);

            content += '<tr id="' + id + '" class="person">' +
                            '<td>' + person.id +'</td>' +
                            '<td><strong>' + courses.length + '</strong> <span class="text-muted">ccr</span></td>' + 
                            '<td>' + ch + ' <span class="text-muted">cr</span></td>' + 
                        '</tr>';

            content += '<tr id="' + id + '-distribution">' +
                            '<td colspan="3" class="weekdays-distribution">'+ self.createWeekScheduleChart(person) + '</td>' +
                        '</tr>';

            content += '<tr class="separator"><td colspan="3"></td></tr>';
        });

        $('#involedPersonnel tbody').empty().append(content);
    };

    this.checkProgramConstraints = function() {
        var self = this;

        this.clearConstraintHighlights();

        this.data.program.groups.forEach(function(group) {
            var courses = self.findCoursesByGroupId(group.id);
            
            courses.forEach(function(course) {
                self.checkConstraintsByCourse(course);
            });
        });
    };

    this.init = function(context) {
        var programId = 1; // TODO: select this from URL

        if(!context) {
            console.error('Invalid context data. Unable to init.');
            return;
        }

        this.data.programs = context.programs;

        console.log('List of programs updated:', this.data.programs);

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

        this.commitCourse(course);
        this.checkProgramConstraints();
    };

    this.commitCourse = function(course) {
        console.log('Commiting course', course);

        this.api({method: 'updatecourse', program: this.active.programId, course: course}, function(data) {
            console.log('Course commited successfuly!', data);
        }, this);
    };

    this.commitGroup = function(group) {
        console.log('Commiting group', group);

        // TODO: improve this
        var bareGroup = {
            id: group.id,
            name: group.name,
            grid: null
        };

        this.api({method: 'updategroup', program: this.active.programId, group: bareGroup}, function(data) {
            console.log('Group commited successfuly!', data);
        }, this);
    };

    this.loadCourses = function() {
        console.log('Loading courses', this.active.program);

        this.api({method: 'courses', program: this.active.program}, function(data) {
            console.log('Returned', data);
        }, this);
    };

    this.createGroupBlock = function(containerId, group) {
        var self = this;
        var num = group.id;
        var key = 'group-' + num;

        $('#' + containerId).append(
            '<div id="' + key + '" class="row justify-content-center section" style="' + (group.hidden ? 'display:none;' : '') + '">' +
                '<div class="col-lg-12 schedule-block">' +
                    '<div class="card text-white status-meta">' +
                        '<div class="card-header alert alert-secondary">' +
                            '<h2 class="float-left"><i class="icon ion-md-today"></i> ' + group.name + ' ' + (this.active.readOnly ? '' : '<a href="javascript:void(0);" data-group="'+ group.id +'" data-toggle="modal" data-target="#modal-group"><i class="icon ion-md-create edit"></i></a>') + '</h2>' +
                            (this.active.readOnly ? '' : '<button type="button" class="btn btn-outline-success ml-md-3 float-right" data-toggle="modal" data-target="#modal-course" data-group="' + group.id + '"><i class="icon ion-md-add-circle"></i> Adicionar CCR</button>') +
                        '</div>' +
                        '<div class="card-body">' +
                            '<div class="gridster"><ul></ul></div>'+
                        '</div>' +
                        //'<div class="card-footer text-muted"></div>' +
                    '</div>' +
                '</div>' +
            '</div>'
        );
    
        var g = $('#' + key +' div.gridster ul').gridster({
            widget_base_dimensions: ['auto', 80],
            autogenerate_stylesheet: true,
            shift_widgets_up: false,
            shift_larger_widgets_down: false,
            min_cols: 7,
            max_cols: 7,
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
            g.add_widget(this.generateGridNodeHTML(periods[i].name, {}, false), 1, 1, 1, i + 1);
        }

        g.add_widget(this.generateGridNodeHTML('', {}, false), 1, 1, 1, 1);

        for(var j = 0; j < weekDays.length; j++) {
            g.add_widget(this.generateGridNodeHTML(weekDays[j].name, {}, false), 1, 1, 1, 1);
        }

        return g;
    }
    
    this.generateGridNodeHTML = function(content, data, clickable) {
        var complement = '';
        var shouldClick = clickable == undefined ? true : clickable;
        var attributes = data || {};

        for(var a in attributes) {
            complement += 'data-' + a + '="' + attributes[a] + '" ';
        }

        return '<li class="new ' + (shouldClick ? '' : 'fixed' ) + ' ' + (this.active.readOnly ? 'readonly' : '') + '" ' + complement + '><header></header>' + (content || '') + '</li>';
    };


    this.generateCourseGridNodeHTML = function(course) {
        var content = 
            '<div class="course-node" id="course-node-' + course.id + '">' +
                '<div class="header ' + (this.active.readOnly ? 'readonly' : '') +'">' +
                    '<div class="btn-group">' +
                        '<button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" data-display="static" aria-haspopup="true" aria-expanded="false">' +
                            '<i class="fa fa-options"></i>' +
                        '</button>' +
                        '<div class="dropdown-menu dropdown-menu-lg-right">' +
                            '<button class="dropdown-item" type="button" data-toggle="modal" data-target="#modal-course" data-course="' + course.id + '"><i class="icon ion-md-create edit"></i> Editar</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' + 
                '<div class="side">' + 
                    '' +
                '</div>' +
                '<div class="content">' + 
                    '<strong>' + course.name + '</strong>' +
                    '<br />' +
                    '<small>' + course.members.join(', ') + '</small>' +
                '</div>' +                 
            '</div>';
        
        return this.generateGridNodeHTML(content, {course: course.id}, true);
    };

    this.findScheduleClashesByCourse = function(course) {
        var clashes = [];
        var candidates = this.findCoursesByWeekDayAndPeriod(course.weekDay, course.period);
    
        candidates.forEach(function(c) {
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
    };
    
    this.isLateNightCourse = function(course) {
        return course.period == 7;
    };

    this.isEarlyMorningCourse = function(course) {
        return course.period == 2;
    };

    this.getFirstWorkingDay = function() {
        return weekDays[0];
    };

    this.getLastWorkingDay = function() {
        return weekDays[weekDays.length - 1];
    };

    this.getFirstWorkingPeriod = function() {
        return periods[0].id;
    };

    this.getLastWorkingPeriod = function() {
        return periods[periods.length - 1].id;
    };

    this.isWorkingDay = function(weekDay) {
        var firstWorkingDay = this.getFirstWorkingDay().id;
        var lastWorkingDay = this.getLastWorkingDay().id;

        return weekDay >= firstWorkingDay && weekDay <= lastWorkingDay;
    };

    this.findWorkingImpedimentsByCourse = function(course) {
        var problems = [];
        var candidates = [];
        var nextDay = course.weekDay + 1;
        var previousDay = course.weekDay - 1;

        if(this.isEarlyMorningCourse(course) && this.isWorkingDay(previousDay)) {
            candidates = this.findCoursesByWeekDayAndPeriod(previousDay, this.getLastWorkingPeriod());

        } else if(this.isLateNightCourse(course) && this.isWorkingDay(nextDay)) {
            candidates = this.findCoursesByWeekDayAndPeriod(nextDay, this.getFirstWorkingPeriod());
        }
    
        candidates.forEach(function(c) {
            var hasMemberOverlap = false;
    
            course.members.forEach(function(member) {
                if(c.members.includes(member)) {
                    hasMemberOverlap = true;
                }
            });
    
            if(hasMemberOverlap) {
                problems.push(c);
            }
        });
    
        return problems;
    }

    this.highlightScheduleClashes = function(clashes) {
        var self = this;
        var personInvoledInClash = {};
        
        if(!clashes || clashes.length == 0) {
            return;
        }

        clashes.forEach(function(course) {
            $('#course-node-' + course.id).addClass('clash');

            course.members.forEach(function(member) {
                if(personInvoledInClash[member] === undefined) {
                    personInvoledInClash[member] = 0;
                }
                personInvoledInClash[member]++;
            });
        });

        for(var member in personInvoledInClash) {
            if(personInvoledInClash[member] > 1) {
                var el = $('#row-ip-' + self.stringToSlug(member));

                if(!el.hasClass('clash')) {
                    el.addClass('clash');
                }
            }
        }
    };

    this.highlightWorkingImpediments = function(course, impediments) {
        var self = this;
        var personInvoledInImpediments = {};

        if(!impediments || impediments.length == 0) {
            return;
        }

        impediments.forEach(function(courseSuffering) {
            $('#course-node-' + course.id).addClass('impediment');

            courseSuffering.members.forEach(function(member) {
                if(course.members.indexOf(member) != -1) {
                    personInvoledInImpediments[member] = true;
                }
            });
        });

        for(var member in personInvoledInImpediments) {
            var el = $('#row-ip-' + self.stringToSlug(member));

            if(!el.hasClass('impediment')) {
                el.addClass('impediment');
            }
        }

        // highlight the offending course as well
        $('#course-node-' + course.id).addClass('impediment');
    };

    this.clearConstraintHighlights = function() {
        $('.course-node').each(function(i, el) {
            $(el).find('div.side').empty();
            $(el).removeClass('clash impediment');
        });

        $('#involedPersonnel tbody tr').each(function(i, el) {
            $(el).removeClass('clash impediment');
        });
    };

    this.checkConstraintsByCourse = function(course) {
        var clashes = this.findScheduleClashesByCourse(course);
        var isSelfClash = clashes.length == 1 && clashes[0].id == course.id;
        var impediments = this.findWorkingImpedimentsByCourse(course);
    
        if(clashes.length > 0 && !isSelfClash) {
            this.highlightScheduleClashes(clashes);
        }
    
        if(impediments.length > 0) {
            this.highlightWorkingImpediments(course, impediments);
        }
    }
    
    this.findCoursesByWeekDayAndPeriod = function(weekDay, period) {
        var self = this;
        var items = [];
    
        this.data.program.courses.forEach(function(course) {
            if(course.weekDay == weekDay && self.courseHasPeriodOverlap(course, period))  {
                items.push(course);
            }
        });
    
        return items;
    }

    this.courseHasPeriodOverlap = function(course, period) {
        var slots = course.slots || 1;
        var offset = slots - 1;
        
        offset = offset < 0 ? 0 : offset;
        
        var upperLimit = course.period + offset;

        return course.period == period || (period >= course.period && period <= upperLimit);
    };
    
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
        console.log(courseObj);
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

            console.log('Course updated: ', courseObj);
        } else {
            // Creating a new course
            courseObj.id = this.getNextCourseId();
            this.data.program.courses.push(courseObj);
            group.grid.add_widget(this.generateCourseGridNodeHTML(courseObj), 1, 1, 7, 2); // TODO: find best position
        
            console.log('Course added: ', courseObj);
        }

        this.commitCourse(course);
    }
    
    this.addOrUpdateGroup = function(groupObj) {
        var isUpdate = groupObj.id;

        if(isUpdate) {
            // Update
            var group = this.getGroupById(groupObj.id);

            // TODO: improve this pile of crap
            for(var p in groupObj) {
                group[p] = groupObj[p];
            }

            console.log('Group updated: ', groupObj);

        } else {
            // Creating a new group
            groupObj.id = this.getNextGroupId();
            groupObj.grid = this.createGroupBlock('groups-content', groupObj);

            this.data.program.groups.push(groupObj);
        
            console.log('Group added: ', groupObj);
        }

        this.commitGroup(group);
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
        var id = $('#modal-group-id').val();
        var name = $('#modal-group-name').val();
        
        this.addOrUpdateGroup({
            id: id,
            name: name
        });
    
        $('#modal-group').modal('hide');
    };

    this.findById = function(collection, id) {
        var item = null;

        if(!collection) {
            return null;
        }
        
        collection.forEach(function(i) {
            if(i.id == id) {
                item = i;
            }
        });

        return item;
    };
};

// TODO: move this to API endpoint
var weekDays = [
    {id: 2, name: "Segunda-feira"},
    {id: 3, name: "Terça-feira"},
    {id: 4, name: "Quarta-feira"},
    {id: 5, name: "Quinta-feira"},
    {id: 6, name: "Sexta-feira"},
    {id: 7, name: "Sábado"},
];

// TODO: move this to API endpoint
var periods = [
    {id: 2, name:"07:30", label: "Manha1"},
    {id: 3, name:"10:20", label: "Manha2"},
    {id: 4, name:"13:30", label: "Tarde1"},
    {id: 5, name:"16:00", label: "Tarde2"},
    {id: 6, name:"19:10", label: "Noite1"},
    {id: 7, name:"21:00", label: "Noite2"}
];

$(function () {
    var app = new Horarios.App();
    app.boot();

    $('.basicAutoComplete')
        .autoComplete({
            formatResult: function(item) {
                var format = { id: 0, text: item.name, html: item.name };

                if(item.complement != '') {
                    format.html += ', <small>' + item.complement + '</small>';
                }

                return format;
            }
        })
        .on('autocomplete.select', function(event, item) {
            console.log('Item selected:', window.location.href + item.url, item);
        });

    // TODO: move this into App class.
    setInterval(function() {
        // TODO: call store.set('horarios.data', app.data);
    }, 2000);
});
