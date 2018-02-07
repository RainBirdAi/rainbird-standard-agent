angular.module('datePicker', [])
		.directive('datePicker', [function() {
			return {
				link: function (scope, element) {

					scope.inputValue = '';
					scope.answers = [];

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
								});
							scope.$apply();
						}
					}

					scope.showDatePicker = true;

					scope.dateAdded = function() {
						if (!!~scope.inputValue.search(/\d{4}-\d{2}-\d{2}/)) {
							if (scope.plural) {
								if (!~scope.answers.indexOf(scope.inputValue)) {
									scope.answers.push(scope.inputValue);
								} else {
									scope.answers.splice(scope.answers.indexOf(scope.inputValue), 1);
								}

								scope.inputValue = '';
								$(scope.input).datepicker('update', '');
							} else {
								scope.answers = [scope.inputValue];
								$(scope.input).datepicker('update', scope.inputValue);
							}
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
				'	<input id="semanticdatepicker" class="search semanticInputOverride" type="text" placeholder="YYYY-MM-DD" ng-model="inputValue" ng-change="dateAdded()" >\n' +
				'<label class="hoverOverLightElement fa fa-calendar ui label calendar-label"></label>' +
				'</div>'
			};
		}]);
