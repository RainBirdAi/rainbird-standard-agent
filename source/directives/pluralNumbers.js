angular.module('pluralNumbers', [])
		.directive('pluralNumbers', [function() {
			return {
				link: function (scope, element) {

					//SETTINGS
					scope.forceUniqueNumbers = true; //set to false to allow the front end to send an array like ['10', '10'].
					//END SETTINGS

					scope.inputValue = '';
					scope.answers = [];

					element.on('keydown', function(e) {
						if (e.key == ' ') {
							e.preventDefault();
							addNumberToAnswers();
						} else if (e.key == 'Backspace') {
							if (scope.inputValue.length > 0) {
									//perform backspace action
									scope.inputValue = scope.inputValue.substring(0, scope.inputValue.length -1);
									scope.answers.currentValue = scope.inputValue;
							} else {
								scope.answers.splice(scope.answers.length-1, 1);
								scope.answers.currentValue = '';
								e.preventDefault();
							}
							scope.$apply();
						} else if (!~['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', 'ArrowLeft', 'ArrowRight'].indexOf(e.key)) {
							e.preventDefault();
						}

					});

					function addNumberToAnswers() {
						scope.inputValue = scope.inputValue.replace(/\s/, '');
						scope.inputValue = scope.inputValue.match(/(0*)(\d+)/)[2];
						if (scope.forceUniqueNumbers && !~scope.answers.indexOf(scope.inputValue) && !!~scope.inputValue.search(/\d/)) {
							scope.answers.push(scope.inputValue);
						} else if (!scope.forceUniqueNumbers && !!~scope.inputValue.search(/\d/)) {
							scope.answers.push(scope.inputValue);
						}
						scope.inputValue = '';
						scope.answers.currentValue = '';
						scope.$apply();
					}

					scope.deleteNumber = function (index) {
						scope.answers.splice(index, 1);
					};

					//Div disguises itself as an input, when clicking on the div, focus the nested tiny input box
					scope.input = element[0].children[0].children[0];
					element.on('mousedown', function(e) {
						scope.input.focus();
						e.preventDefault();
					});

					scope.numberChange = function(e) {
						scope.answers.currentValue = scope.inputValue;
					};

					scope.addNumberPressed = function(e) {
						addNumberToAnswers();
					}
				},
				restrict: 'E',
				scope: {
					answers: '=',
					plural: '='
				},
				template:
					'<div class="ui input selection search numberInputSemantic" >' +
							'<a ng-repeat="answer in answers track by $index" class="ui label transition visible" data-value="worst colour a">' +
							'{{answer}}<i class="delete icon" ng-click="deleteNumber($index)"></i>' +
							'</a>' +
					'	<input ng-change="numberChange()" class="search semanticInputOverride" type="text" placeholder="number" ng-model="inputValue" >' +
					'<label class="hoverOverLightElement fa fa-plus ui label plusButton" ng-click="addNumberPressed()"></label>' +
					'</div>'
			};
		}]);

