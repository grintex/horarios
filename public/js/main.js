var Horarios = {};

Horarios.App = function() {
    this.ENDPOINT_URL = undefined;
    this.APP_BASE_URL = undefined;

    this.relationsContraints = {};
    
    this.data = {
        dirty: false,
        program: null,
        schedule: null
    };
    
    this.active = {
        groupId: undefined,
        course: undefined,
        programId: undefined,
        readOnly: false
    };

    this.tickers = [];

    this.boot = function(data) {
        this.buildInitialUI();
        this.initAutocomplete();
        this.initTicker();
        this.initAutoSave();
        this.initRelationsConstraints();
        this.init(data);
    };

    this.initTicker = function() {
        var self = this;

        setInterval(function() {
            self.tick();
        }, 500);
    };

    this.tick = function() {
        var self = this;

        this.tickers.forEach(function(ticker) {
            var now = self.now();

            if(!ticker.callback) {
                return;
            }

            if(now - ticker.timeLastCall >= ticker.intervalTimeMs) {
                ticker.timeLastCall = now;
                ticker.callback.call(ticker.callbackThis, ticker.callbackParams);
            }
        });
    };

    this.addTicker = function(intervalTimeMs, callback, params, callbackThis) {
        this.tickers.push({
            intervalTimeMs: intervalTimeMs,
            timeLastCall: this.now(),
            callback: callback,
            callbackParams: params,
            callbackThis: callbackThis || this
        });
    };

    this.now = function() {
        return (new Date()).getTime();
    };

    this.initRelationsConstraints = function() {
        this.relationsContraints = {
            loading: false,
            ready: false,
            pendingCourseChecks: [],
            contenders: {}
        }
        
        this.addTicker(1000, this.ensureRelationsConstraintsDataIsUptoDate);
        this.addTicker(100, this.runScheduledRelationsConstraintsCourseCheck, 30);
    };

    this.ensureRelationsConstraintsDataIsUptoDate = function() {
        var self = this;
        var context = this.relationsContraints;

        if(!context.ready && !context.loading) {
            context.loading = true;

            axios.get(this.ENDPOINT_URL + '/schedules/' + this.data.schedule.id + '/relations').then(res => {
                var changed = self.fillRelationsContraintsData(res.data);
                context.loading = false;
                context.ready = true;

                if(changed) {
                    self.buildInvoledRelationsSidebar();
                    self.checkRelationsConstraints();
                    self.runScheduledRelationsConstraintsCourseCheck(10000);
                }
            }).catch(err => {
                console.log(err);
                context.loading = false;
                context.ready = false;
            });
        }
    };

    this.runScheduledRelationsConstraintsCourseCheck = function(allowedChecks) {
        var self = this;
        var performedChecks = 0;

        this.relationsContraints.pendingCourseChecks.forEach(function(course) {
            if(allowedChecks-- <= 0) {
                return;
            }

            var check = self.checkConstraintsByCourse(course);
            self.highlightConstraintsCheckByCourse(course, check);
            self.refreshInvoledRelationsSidebar(course, check);
            performedChecks++;            
        });

        if(performedChecks <= 0) {
            return;
        }

        this.relationsContraints.pendingCourseChecks.splice(0, performedChecks);
    };

    this.refreshInvoledRelationsSidebar = function(course, check) {
        var contenderId = course.contenderId;
        var statusId = 'row-ir-' + this.stringToSlug(contenderId) + '-status';
        var statusEl = $('#' + statusId);

        if(check.clashes.length > 0) {
            statusEl.addClass('clash');
        }
    };

    this.buildInvoledRelationsSidebar = function() {
        var content = '';

        for(var userId in this.relationsContraints.contenders) {
            var contender = this.relationsContraints.contenders[userId];

            var id = 'row-ir-' + this.stringToSlug(userId);

            content += '<tr id="' + id + '" class="contender">' +
                            '<td>' + 
                                '<span class="contender-handle-icon"><ion-icon name="chevron-forward-circle-outline"></ion-icon></span> ' +
                                '<span class="align-top">' + contender.schedule.user.uid + '</span>' +
                            '</td>' +
                            '<td>' + contender.schedule.period + ' (' + contender.schedule.revision + ')</td>' + 
                            '<td id="' + id + '-status">?</td>' + 
                        '</tr>';

            content += '<tr class="separator"><td colspan="3"></td></tr>';
        }

        $('#involedRelations tbody').empty().append(content);

        this.refreshSidebarSummary();
    };

    this.checkRelationsConstraints = function() {
        var pendingCourseChecks = [];

        for(var id in this.relationsContraints.contenders) {
            var contender = this.relationsContraints.contenders[id];

            contender.courses.forEach(function(course) {
                course.contenderId = id ;
            });

            pendingCourseChecks = pendingCourseChecks.concat(contender.courses);
        }

        this.relationsContraints.pendingCourseChecks = pendingCourseChecks;
    };

    this.fillRelationsContraintsData = function(data) {
        var self = this;
        var changed = false;

        if(data.length == 0) {
            return;
        }

        data.forEach(function(entry) {
            var contender = self.relationsContraints.contenders[entry.id];

            if(contender && contender.schedule.updated_at == entry.updated_at) {
                // Nothing to update, we already have the most up-to-date data.
                return;
            }

            contender = {
                schedule: entry,
                courses: JSON.parse(entry.courses),
                groups: JSON.parse(entry.groups)
            };

            self.relationsContraints.contenders[entry.id] = contender;
            changed = true;
        });

        return changed;
    };

    this.initAutoSave = function() {
        this.addTicker(500, this.save);
    };

    this.getSaveableData = function() {
        var payload = {
            courses: this.data.program.courses,
            groups: [],
        }

        for(var p in this.data.program.groups) {
            var group = this.data.program.groups[p];

            if(group.hidden) {
                continue;
            }

            payload.groups.push({
                id: group.id,
                name: group.name
            });
        }

        return payload;
    };

    this.setSavingStatus = function(value) {
        var el = $('#save-status');

        el.fadeOut();

        if (typeof value === 'string' || value instanceof String) {
            el.html('<ion-icon name="alert-circle-outline" class="text-danger"></ion-icon> <small>' + value + '</small>').fadeIn();
            return;
        }

        if(value) {
            el.html('<ion-icon name="refresh-outline" class="spin"></ion-icon> <small>Salvando</small>').fadeIn();
        } else {
            el.html('<ion-icon name="checkmark-circle-outline"></ion-icon><small> Conteúdo salvo!</small>').fadeIn();
        }
    };

    this.save = function(force) {
        var self = this;

        if(!this.data.dirty && !force) {
            return;
        }

        var payload = this.getSaveableData();
        console.log('Saving data', payload);

        this.setSavingStatus(true);

        axios.put(this.ENDPOINT_URL + '/schedules/' + this.data.schedule.id, payload).then(res => {
            console.log(res);
            this.setSavingStatus(false);
        }).catch(err => {
            console.log(err);
            this.setSavingStatus('Erro ao salvar!');
        });

        this.data.dirty = false;
    };

    this.initAutocomplete = function() {
        var self = this;
        var config = {
            formatResult: this.autocompleteFormatResult
        };

        $('.autocomplete').autoComplete(config).on('autocomplete.select', function(event, item) { self.autocompelteSelect(event, item); });  
    };

    this.autocompleteFormatResult = function(item) {
        var format = { id: 0, text: item.name, html: item.name };

        if(item.complement != '') {
            format.html += ', <small>' + item.complement + '</small>';
        }

        return format;
    };

    this.autocompelteSelect = function(event, item) {
        if(item.type == 'person') {
            // We are editing the course's modal.
            // Let's add this person to the list of course responsibles.
            this.refreshModalCourseMembers([item.memberId], true);
            event.currentTarget.value = '';

        } else if (item.type == 'course') {
            $('#modal-course-code').val(item.code);
            $('#modal-course-credits').val(item.credits);
        }
        console.log('Item selected:', window.location.href + item.url, item);
    };

    this.buildInitialUI = function() {
        this.buildModals();
    };

    this.buildModals = function() {
        var self = this;

        $('#modal-course button.submit').on('click', function(e) { self.handleModalCourseSubmit(e); });
        $('#modal-group button.submit').on('click', function(e) { self.handleModalGroupSubmit(e); });
        $('#modal-confirm button.submit').on('click', function(e) { self.handleModalConfirmSubmit(e); });
    
        $('#modal-course').on('show.bs.modal', function (event) {
            var groupId = $(event.relatedTarget).data('group');
            var courseId = $(event.relatedTarget).data('course');
            var course = self.getCourseById(courseId);

            self.active.groupId = groupId;

            if(course) {
                // We have existing course info for this modal. Let's update
                // all global controls with the selected course (which takes
                // precedence from everything else)
                self.active.groupId = course.group;
                self.active.course = course;
            }

            console.log('group:', self.active.groupId, 'course: ', courseId);

            $('#modal-course-name').val(course ? course.name : '');
            $('#modal-course-code').val(course ? course.code : '');
            $('#modal-course-credits').val(course ? (course.credits || 4) : '');
            $('#modal-course-slots').val(course ? (course.slots || 1) : '');
            $('#modal-course-id').val(course ? course.id : '');

            if(!course) {
                $('#modal-course-members').html('Ninguém responsável ainda.');
                return;
            }

            self.refreshModalCourseMembers(course.members);
        });

        $('#modal-group').on('show.bs.modal', function (event) {
            var group = {
                id: '',
                name: '',
            }

            var groupId = $(event.relatedTarget).data('group');
            
            if(groupId) {
                group = self.getGroupById(groupId);
            }

            $('#modal-group-id').val(group ? group.id : '');
            $('#modal-group-name').val(group ? group.name : '');
        });

        $('#modal-confirm').on('show.bs.modal', function (event) {
            var el = $(event.relatedTarget);
            var title = el.data('title');
            var text = el.data('text');

            $('#modal-confirm-element-action').val(el.data('element-action'));
            $('#modal-confirm-element-id').val(el.data('element-id'));
            $('#modal-confirm-title').html(title);
            $('#modal-confirm-text').html(text);
        });
    };

    this.refreshModalCourseMembers = function(members, append) {
        var self = this;

        if(!members || members.length == 0) {
            return;
        }

        var nonExistingMembers = [];

        members.forEach(function(member) {
            var key = self.stringToSlug('modal-member-'+ member);
            var el = document.getElementById(key);
            if(!el) {
                nonExistingMembers.push(member);
                return;
            }
            $(el).fadeOut(200).fadeIn(200).fadeOut(200).fadeIn(200);
        });

        if(nonExistingMembers.length == 0) {
            return;
        }

        var text = '';

        nonExistingMembers.forEach(function(member) {
            var key = self.stringToSlug('modal-member-'+ member);

            text += 
                '<div class="mt-3" id="' + key + '"> ' + 
                    '<ion-icon name="chevron-forward-circle-outline"></ion-icon> ' + 
                    '<span data-member-id="' + member + '" class="member">' + member + '</span>' + 
                    '<a href="javascript:void(0);" class="float-right pr-2" data-click-remove="#' + key + '"><ion-icon name="trash-outline"></ion-icon></ion-icon> <small>Remover</small></a>' +
                '</div>';
        });

        if(append) {
            $('#modal-course-members').append(text);
        } else {
            $('#modal-course-members').html(text);
        }

        $('#modal-course-members [data-click-remove]').each(function(i, el) {
            $(el).off();
            $(el).click(function() {
                var queryToRemove = $(this).data('click-remove');
                console.log(queryToRemove);
                $(queryToRemove).fadeOut().remove();
            })
        })
    };

    this.buildSelectableDropdownLinks = function() {
        var self = this;

        $('a.dropdown-link').off().on('click', function(e) {
            var el = $(e.currentTarget);
            var url = el.data('url');
            
            if(!url) {
                return;
            }

            self.gotoURLFromAppBase(url);
        });
    };

    this.gotoURLFromAppBase = function(url) {
        var completeURL = this.APP_BASE_URL + '/' + url;
        console.log('gotoURL', url, completeURL);
        window.location.href = completeURL;
    };

    this.restoreDataFromLocalStorage = function(prgramId) {
        var c = store.get('something');
        
        if(c) {
            // TODO: restore data from database
        }
    };

    this.selectProgram = function(programId) {
        this.active.programId = programId;
        console.debug('Program selected: ', programId);
    
        this.restoreDataFromLocalStorage();
    
        this.refreshGroupsContent();
        this.buildSelectableDropdownLinks();
        this.checkProgramConstraints();
        this.refreshInvoledPersonnelSidebar(this.findInvolvedPersonnel());
        this.setSavingStatus(false);
    };

    this.refreshGroupsContent = function() {
        var self = this;

        $('#groups-content').empty();

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

    this.createWeekScheduleChart = function(person, simplified) {
        var content = '';

        ['S', 'T', 'Q', 'Q', 'S', 'S'].forEach(function(weekDay, idx) {
            var weekDayOccurrences = person.weekDays.filter(function(v){ return v === (idx + 2); }).length;

            content += '<div style="width: 12%; height: 100%; position: relative; margin-right: 3%; float: left;">' +
                        '<div style="position: absolute; bottom: 35%; width: 100%; height: ' + (1 + 64 * (weekDayOccurrences / 6.0)) + '%; background: #' + (weekDayOccurrences > 0 ? '00BC80' : '545454') + ';">' + (weekDayOccurrences != 0 ? '<p style="font-size: 0.8em; position: absolute; top: -30px; left: 20%; color: #afafaf;">' + (simplified ? '' : weekDayOccurrences)  + '</p>': '') + '</div>' +
                        '<div style="position: absolute; left: 30%; bottom: 0; color: #8f8f8f;">' + (simplified ? '' : weekDay) + '</div>' +
                    '</div>';
        });
 
        return '<div style="width: 100%; height: ' + (simplified ? 30 : 100) + 'px;">' + content + '</div>';
    };

    this.refreshInvoledPersonnelSidebar = function(personnel) {
        var self = this;
        var content = '';

        personnel.forEach(function(person) {
            var courses = self.findUniqueCourses(person.courses);
            var ch = courses.length * 4; // TODO: get ch from course
            var id = 'row-ip-' + self.stringToSlug(person.id);

            content += '<tr id="' + id + '" class="person">' +
                            '<td>' + 
                                '<span class="personel-handle-icon"><ion-icon name="chevron-forward-circle-outline"></ion-icon></span> ' +
                                '<span class="align-top">' + person.id + '</span>' +
                            '</td>' +
                            '<td><strong>' + courses.length + '</strong> <span class="text-muted">ccr</span></td>' + 
                            '<td>' + ch + ' <span class="text-muted">cr</span></td>' + 
                            '<td>'+ self.createWeekScheduleChart(person, true) + '</td>' +
                        '</tr>';

            content += '<tr id="' + id + '-distribution" style="display: none;">' +
                            '<td colspan="4" class="weekdays-distribution">'+ self.createWeekScheduleChart(person) + '</td>' +
                        '</tr>';

            content += '<tr class="separator"><td colspan="4"></td></tr>';
        });

        $('#involedPersonnel tbody').empty().append(content);
        $('#involedPersonnel tr.person').each(function(i, el) {
            $(el).click(function() {
                var key = $(el).attr('id') + '-distribution';
                $('#' + key).fadeToggle();
            });
        });

        this.refreshSidebarSummary();
    };

    this.refreshSidebarSummary = function() {
        var persons = 0;
        var clashes = 0;
        var impediments = 0;

        $('#involedPersonnel tr.person').each(function(i, el) {
            persons++;

            if($(el).hasClass('clash')) {
                clashes++;
            }

            if($(el).hasClass('impediment')) {
                impediments++;
            }
        });

        var text = '';
        
        text += '<span class="float-left mt-1 text-muted" id="save-status"></span>';
        text += '<ion-icon name="people-outline" alt="Quantidade de docentes participando desse horário"></ion-icon> <span>' + persons + '</span>';

        if(clashes > 0) {
            text += '<ion-icon name="alert-circle" class="clash-text" title="Há conflito de horário"></ion-icon> <span class="clash-text">' + clashes + '</span>';
        }

        if(impediments > 0) {
            text += '<ion-icon name="information-circle-outline" class="impediment-text" title="Há uma violação de rocomendação, ex.: trabalhar à noite e de manhã."></ion-icon> <span class="impediment-text">' + impediments + '</span>';
        }

        $('#sidebar-summary').html(text);
    }

    this.checkProgramConstraints = function() {
        var self = this;

        this.clearConstraintHighlights();

        this.data.program.groups.forEach(function(group) {
            var courses = self.findCoursesByGroupId(group.id);
            
            courses.forEach(function(course) {
                var check = self.checkConstraintsByCourse(course);
                self.highlightConstraintsCheckByCourse(course, check);
            });
        });

        this.refreshSidebarSummary();
        this.checkRelationsConstraints();
    };

    this.init = function(data) {
        this.ENDPOINT_URL = data.apiBaseEndpointUrl;
        this.APP_BASE_URL = data.appBaseUrl;

        this.data.program = data.program;
        this.data.schedule = data.schedule;
        this.active.readOnly = data.readOnly;
        this.active.programId = data.programId;

        this.selectProgram(data.programId);
    };

    this.onCourseMoved = function(data) {
        var course = this.getCourseById(data.course);

        if(course == null) {
            console.error('Unable to load course info: ' + data.course);
            return;
        }

        course.period = data.row | 0;
        course.weekDay = data.col | 0;

        this.data.dirty = true;
        this.checkProgramConstraints();
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
                            '<h2 class="float-left">' +
                                '<span id="name-group-' + group.id + '">' + group.name + '</span> ' +
                                (this.active.readOnly ? '' : '<a href="javascript:void(0);" class="btn-simple" title="Apagar essa fase" data-title="Apagar fase?" data-text="A fase e todas as informações referentes a ela serão apagadas também. Você tem certeza que deseja apagar a fase \''+ group.name +'\'?" data-element-action="remove-group" data-element-id="'+ group.id +'" data-toggle="modal" data-target="#modal-confirm"><ion-icon name="trash-outline"></ion-icon></a>') +
                                (this.active.readOnly ? '' : '<a href="javascript:void(0);" class="btn-simple" title="Editar o nome dessa fase" data-group="'+ group.id +'" data-toggle="modal" data-target="#modal-group"><ion-icon name="create-outline"></ion-icon></a>') +
                            '</h2>' +
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
                    //console.debug('START position: ' + ui.position.top + ' ' + ui.position.left);
                },
    
                drag: function (e, ui) {
                    //console.debug('DRAG offset: ' + ui.pointer.diff_top + ' ' + ui.pointer.diff_left);
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
                        '<button class="dropdown-item" type="button" data-toggle="modal" data-target="#modal-course" data-course="' + course.id + '"><i class="icon ion-md-create edit pr-2"></i> Editar</button>' +
                        '<button class="dropdown-item" type="button" data-title="Confirmação" data-text="Você quer mesmo remover \''+ course.name +'\'?" data-element-action="remove-course" data-element-id="'+ course.id +'" data-toggle="modal" data-target="#modal-confirm"><i class="icon ion-md-trash edit pr-2"></i> Remover</button>' +
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
            var courseNodeEl = $('#course-node-' + course.id);
            
            courseNodeEl.addClass('clash');

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

    this.highlightConstraintsCheckByCourse = function(course, constraintsCheck) {
        var clashes = constraintsCheck.clashes;
        var isSelfClash = clashes.length == 1 && clashes[0].id == course.id;
        var impediments = constraintsCheck.impediments;
    
        if(clashes.length > 0 && !isSelfClash) {
            this.highlightScheduleClashes(clashes);
        }
    
        if(impediments.length > 0) {
            this.highlightWorkingImpediments(course, impediments);
        }
    }

    this.checkConstraintsByCourse = function(course) {
        var clashes = this.findScheduleClashesByCourse(course);
        var impediments = this.findWorkingImpedimentsByCourse(course);
    
        return {
            clashes: clashes,
            impediments: impediments
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

    this.removeGroupById = function(id) {
        var groups = this.data.program.groups;

        for(var i = 0; i < groups.length; i++) {
            if(groups[i].id == id) {
                groups.splice(i, 1);
                return true;
            }
        }
   
        return false;
    }

    this.removeCourseById = function(id) {
        var courses = this.data.program.courses;

        for(var i = 0; i < courses.length; i++) {
            if(courses[i].id == id) {
                var group = this.getGroupById(courses[i].group);
                group.grid.remove_widget($('li[data-course=' + id + ']'));
                courses.splice(i, 1);
                return true;
            }
        }
   
        return false;
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
        var isUpdate = courseObj.id;
        var group = this.getGroupById(courseObj.group);
    
        if(!group) {
            console.error('Provided course has invalid group. Course: ', courseObj);
            return;
        }
    
        if(!group.grid) {
            console.warn('Empty grid for group: ' + courseObj.group);
        }
    
        if(isUpdate) {
            // Update
            var course = this.getCourseById(courseObj.id);
            var hardRefresh = false;

            // TODO: improve this pile of crap
            for(var p in courseObj) {
                var isDifferent = course[p] != courseObj[p];

                if(p == 'slots' && isDifferent) {
                    hardRefresh = true;
                }

                course[p] = courseObj[p];
            }

            if(hardRefresh) {
                this.refreshGroupsContent();
            } else {
                this.refreshCourseWidgetHtmlContent(course);
            }

            console.log('Course updated: ', courseObj, course);

        } else {
            // Creating a new course
            courseObj.id = this.getNextCourseId();
            courseObj.weekDay = 7;
            courseObj.period = periods[0].id;

            this.data.program.courses.push(courseObj);
            group.grid.add_widget(this.generateCourseGridNodeHTML(courseObj), 1, 1, 7, 2); // TODO: find best position
        
            var query = '#course-node-' + courseObj.id;
            $(query).addClass('brand-new');
            setTimeout(function() { $(query).removeClass('brand-new'); }, 1000);

            console.log('Course added: ', courseObj);
        }

        this.checkProgramConstraints();
        this.data.dirty = true;
    }

    this.refreshCourseWidgetHtmlContent = function(course) {
        var node = $('li[data-course=' + course.id + ']');
        node.html(this.generateCourseGridNodeHTML(course));
    };
    
    this.addOrUpdateGroup = function(groupObj) {
        var isUpdate = groupObj.id;

        groupObj.name = this.stripTags(groupObj.name);

        if(isUpdate) {
            // Update
            var group = this.getGroupById(groupObj.id);

            // TODO: improve this pile of crap
            for(var p in groupObj) {
                group[p] = groupObj[p];
            }

            $('#name-group-' + group.id).html(group.name);
            console.log('Group updated: ', groupObj);

        } else {
            // Creating a new group
            groupObj.id = this.getNextGroupId();
            groupObj.grid = this.createGroupBlock('groups-content', groupObj);

            this.data.program.groups.push(groupObj);
        
            console.log('Group added: ', groupObj);
        }
        
        this.data.dirty = true;
    }

    this.stripTags = function(str) {
        return str.replace(/(<([^>]+)>)/gi, '');
    };
    
    this.handleModalCourseSubmit = function() {
        var selectedMembers = [];
    
        $('#modal-course-members .member').each(function(i, el) {
            selectedMembers.push($(el).data('member-id'));
        });
    
        var id = $('#modal-course-id').val();
        var name = $('#modal-course-name').val();
        var code = $('#modal-course-code').val() || 'GCS011';
        var credits = $('#modal-course-credits').val() || 4;
        var slots = $('#modal-course-slots').val() || 1;

        if(!name) {
            // TODO: show some warning?
            console.warn('Empty name is not allowed');
            return;
        }

        slots = slots <= 0 || slots >= periods.length ? 1 : slots;
        credits = credits <= 0 ? 1 : credits;
    
        this.addOrUpdateCourse({
            id: id,
            code: code,
            name: name,
            credits: credits | 0,
            slots: slots | 0,
            group: this.active.groupId,
            members: selectedMembers
        });
    
        $('#modal-course').modal('hide');
        this.active.groupId = undefined;

        this.refreshInvoledPersonnelSidebar(this.findInvolvedPersonnel());
        this.checkProgramConstraints();
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

    this.handleModalConfirmSubmit = function() {
        var id = $('#modal-confirm-element-id').val();
        var action = $('#modal-confirm-element-action').val();
        
        if(action == 'remove-group') {
            this.removeGroupById(id);
            this.data.dirty = true;
            $('#group-' + id).fadeOut();
        }

        if(action == 'remove-course') {
            this.removeCourseById(id);
            this.data.dirty = true;
        }

        console.log('Modal confirm', action, id);
        $('#modal-confirm').modal('hide');
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
    if(!window.HORARIOS_PAGE_DATA) {
        return;
    }
    
    var app = new Horarios.App();
    app.boot(HORARIOS_PAGE_DATA);
});
