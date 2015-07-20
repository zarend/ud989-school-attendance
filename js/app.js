$(function() {
    var Model = (function() {
        var Model = function() {
            this.names = [
                'Slappy the Frog',
                'Lilly the Lizard',
                'Paulrus the Walrus',
                'Gregory the Goat',
                'Adam the Anaconda'
            ];
            this.numDays = 12;
            if (!localStorage.attendance) {
                this.genRandomAttendance(this);
            }
            this.attendance = JSON.parse(localStorage.attendance);
            
            this.missedDays = {};
            this.calcAllMissedDays();
        };

        Model.prototype.getNames = function() {
            return this.names;
        }

        Model.prototype.calcAllMissedDays = function() {
            var self = this;
            self.names.forEach(function(nextName) {
                self.calcMissedDays(nextName);
            });
        }

        Model.prototype.calcMissedDays = function(name) {
            numMissed = 0;
            this.attendance[name].forEach(function(attended) {
                if (!attended) {
                    numMissed++;
                }
            });
            this.missedDays[name] = numMissed;
        }

        Model.prototype.genRandomAttendance = function() {
            var self = this;
            self.attendance = {};
            self.names.forEach(function(name) {
                self.attendance[name] = [];

                var i;
                for (i = 1; i <= self.numDays; i++) {
                    self.attendance[name].push(getRandom());
                }
            });

            localStorage.attendance = JSON.stringify(self.attendance);
        }

        function getRandom() {
            return Math.random() >= 0.5;
        }

        return Model;
    })();

    var View = (function() {
        var View = function() {
            this.$allMissed = $('tbody .missed-col');
            this.$allCheckboxes = $('tbody input');
            this.nameColumns = $('tbody .name-col');
            this.$tableHead = $('#tableHead')[0];
            this.$tableBody = $('#tableBody')[0];
        }

        View.prototype.render = function() {
            var self = this;
            self.$tableHead.innerHTML = createTableHead(model.numDays);

            var students = ''
            var name;
            for (name in model.attendance) {
                students += createStudentRow(name);
            }

            self.$tableBody.innerHTML = students;

            self.$allCheckboxes = $('tbody input');

            self.$allCheckboxes.each(function(idx) {
                var name = model.names[Math.floor(idx / model.numDays)];
                var col = idx % model.numDays;
                var $checkBox = self.$allCheckboxes[idx];
                (function(name, col) {
                    $checkBox.addEventListener('click', function() {
                        $checkBox.checked = model.attendance[name][col];
                    });
                })(name, col);
            });

            self.updateChecked();
        }

        View.prototype.updateChecked = function() {
            var self = this;

            self.$allCheckboxes.each(function(idx) {
                var name = model.names[Math.floor(idx / model.numDays)];
                var col = idx % model.numDays;
                var $checkBox = self.$allCheckboxes[idx];
                (function(name, col) {
                    $checkBox.checked = model.attendance[name][col];
                })(name, col);
            });
        }

        var createTableHead = function(numDays) {
            var html = '<tr>\
                <th class="name-col">Student Name</th>';
            var col;
            for (col = 1; col <= numDays; col++) {
                html += '<th>' + col + '</th>';
            }
            html += '<th class="missed-col">Days Missed-col</th>'
            return html;
        }

        var createStudentRow = function(name) {
            var html = '<tr class="student">\
               <td class="name-col">' + name + '</td>';
            var col;
            for (col = 1; col <= model.numDays; col++) {
                html += '<td class="attend-col"><input type="checkbox"></td>';
            }
            html += '<td class="missed-col">' + model.missedDays[name] + '</td>';
            return html;
        }

        return View;
    })();

    var Controller = (function() {
        var Controller = function() {
            var self = this;

            console.log('hello from Controller constructor');
            self.$allCheckboxes = $('tbody input');

            self.addClickHandlers();
            this.updateMissedDays();
        }

        Controller.prototype.updateMissedDays = function() {
            $missedDays = $('tbody .missed-col');
            var i;
            for (i = 0; i < $missedDays.length; i++) {
                var thing = $missedDays[i];
                thing.innerHTML = model.missedDays[model.names[i]];
            }
        }

        Controller.prototype.addClickHandlers = function() {
            var self = this;
            var names = model.getNames();
            var numDays = model.numDays;

            self.$allCheckboxes.each(function(idx) {
                var name = names[Math.floor(idx / numDays)];
                var col = idx % numDays;
                var checkBox = self.$allCheckboxes[idx];
                (function(name, col) {
                    checkBox.addEventListener('click', function() {
                        console.log('clicked on ' + name, col);
                        model.attendance[name][col] = !model.attendance[name][col];
                        checkBox.checked = model.attendance[name][col];
                        model.calcMissedDays(name);
                        view.updateChecked();
                        self.updateMissedDays();
                    });   
                })(name, col);
            });
        }

        return Controller;
    })();

    model = new Model();
    view = new View();
    view.render();
    
    handleOnLoad = function() {
        controller = new Controller();
    }
}());
