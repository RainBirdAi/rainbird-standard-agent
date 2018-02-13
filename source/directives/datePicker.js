angular.module('datePicker', [])
		.directive('datePicker', [function() {
			return {
				link: function (scope, element) {

					scope.inputValue = '';
					scope.answers = [];
					scope.pickerVisible = false;

					element.on('keydown', function(e) {
						if (e.key == 'Backspace') {

							if (scope.inputValue.length == 0) {
								scope.answers.splice(scope.answers.length-1, 1);
								e.preventDefault();
							}
							scope.$apply();
						} else if (!~['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', 'ArrowLeft', 'ArrowRight'].indexOf(e.key)) {
							e.preventDefault();
						}
					});

					element.on('keyup', function(e) {
						if (scope.inputValue.length == 10) {
							scope.dateAdded();
						}
					});

					scope.deleteAnswer = function (index) {
						scope.answers.splice(index, 1);
						$(scope.input).datepicker('update', '');
					};

					scope.input = element[0].children[0].children[0];
					element.on('mousedown', function(e) {
						openDatePicker();
						scope.input.focus();
					});

					var made = false;
					function openDatePicker () {
						if (!made) {
							made = true;
							$(scope.input).datepicker(
								{
									autoclose: !scope.plural,
									orientation: "bottom right",
									format: 'yyyy-mm-dd',
									beforeShowDay: function (date){
										var dateString = date.getFullYear() + '-' +
												(date.getMonth()[1] ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' +
												(date.getDate() < 10 ? '0' + date.getDate() : date.getDate());

										if (!!~scope.answers.indexOf(dateString)) {
											return {classes: 'active', enabled: true};
										}
									},
									keyboardNavigation: false
								}).on('changeDate', function(e) { scope.dateAdded(e.date);});
							scope.$apply();
						}
					}

					scope.showDatePicker = true;

					scope.dateAdded = function(date) {
						var keyboard = date === undefined;
						if(date) {
							date = date.getFullYear() + '-' +
									(date.getMonth()[1] ? (date.getMonth() + 1) : '0' + (date.getMonth() + 1)) + '-' +
									(date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
						} else {
							date = scope.inputValue;
						}
						if (!!~date.search(/\d{4}-\d{2}-\d{2}/) && date.length === 10) {
							if (scope.plural) {
								if (!~scope.answers.indexOf(date)) {
									scope.answers.push(date);
								} else if (!keyboard) {
									scope.answers.splice(scope.answers.indexOf(date), 1);
								}

								scope.inputValue = '';
								$(scope.input).datepicker('update', '');
							} else {
								scope.answers = [date];
								$(scope.input).datepicker('update', date);
							}
						}
						scope.$apply();
					};

					scope.toggle = function(event) {
						event.stopPropagation();
						if ($('.datepicker-dropdown').length) {
							$(scope.input).datepicker('hide');
						} else {
							$(scope.input).datepicker('show');
						}
					}
				},
				restrict: 'E',
				scope: {
					answers: '=answers',
					plural: '='
				},
				template:
				'<div class="ui input selection search datePickerSemantic" >' +

				'<a ng-if="plural" ng-repeat="answer in answers track by $index" class="ui label transition visible" >' +
				'{{answer}}<i class="delete icon" ng-click="deleteAnswer($index)"></i>' +
				'</a>' +
				'	<input id="semanticdatepicker" class="search semanticInputOverride" type="text" placeholder="YYYY-MM-DD" ng-model="inputValue" >\n' +
				'<label class="hoverOverLightElement fa fa-calendar ui label calendar-label" ng-mousedown="toggle($event)"></label>' +
				'</div>'
			};
		}]);
