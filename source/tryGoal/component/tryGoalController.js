angular.module('rbApp.tryGoal')
.controller('TryGoalController', ['$scope', 'agentMemory', '$compile', '$stateParams', 'config', 'GoalAPI', 'ConfigAPI', 'ApiConfig', '$state', '$location', '$filter', 'focusElementById', '$rootScope', '$timeout',
function($scope, agentMemory, $compile, $stateParams, config, GoalAPI, ConfigAPI, ApiConfig, $state, $location, $filter, focusElementById, $rootScope, $timeout) {

    var contextId;
    var sessionId;
    $scope.config = config;
    $scope.otherOption = {value: '(other - not listed)'};
    $scope.yolandaUrl = ApiConfig.getConfig().url;
    $scope.tryGoal = agentMemory.tryGoal;

    $scope.updateAlias = function() {
        sessionId = null;
    };

    $scope.$on('tryGoal', function(event, args) {
        $('#tryGoalModal').modal('show');
        $scope.display = 'thinking';

        // get goal info
        ConfigAPI.getGoalInfo({goalid: args.goalid, id: $stateParams.id}, function(goalInfo) {
            $scope.goalInfo = goalInfo;
            $scope.runGoal(goalInfo);
        });
    });

    $scope.getGoalInfo = function (goalId) {
        $scope.display = 'thinking';

        // get goal info
        ConfigAPI.getGoalInfo({goalid: goalId, id: $stateParams.id}, function(goalInfo) {
            $scope.goalInfo = goalInfo;
            $scope.runGoal(goalInfo);
        });
    };

    $scope.postMessage = function(message) {
        parent.postMessage(message, '*');
    };

    $scope.runGoal = function(goalInfo) {
        var requiresInitData = false;
        $scope.init = {};
        $rootScope.apiOutput = new Array();
        sessionId = null;
        contextId = goalInfo.contextId;

        if (goalInfo.objectInstance === 'user provided') {
            $scope.objectPrompt =  goalInfo.object;
            $scope.subjectPrompt = null;
            requiresInitData = true;
        } else if (goalInfo.subjectInstance === 'user provided') {
            $scope.subjectPrompt = goalInfo.subject;
            $scope.objectPrompt = null;
            requiresInitData = true;
        }
        else {
            $scope.init.subjectInstance = goalInfo.subjectInstance;
            $scope.init.objectInstance = goalInfo.objectInstance;
        }

        if (requiresInitData) {
            $scope.display = 'init data';
        }
        else {
            $scope.startGoalContext();
        }
    };

    function handleError(err) {
        $scope.errorMessage = (err && err.message) ? err.message :
            'Unfortunately Rainbird has been unable to process the goal against the current Knowledge Map.';
        $scope.display = 'error';
    }

    $scope.startGoalContext = function() {
        $scope.display = 'thinking';

        ConfigAPI.getSessionId({ id: $stateParams.id, contextid: contextId}, function(response) {
            sessionId = response.sessionId;

            // Proceed unless the user has since pressed the reset button.
            if ($scope.display !== 'init data'){
                $scope.queryGoal();
            }

        }, function (err) {
            handleError(err.data);
        });
    };

    $scope.$watch('apiOutput', function() {
        
        if (agentMemory.tryGoal) {
            var displayText = JSON.stringify($rootScope.apiOutput, null, 1);
            
            var lines = displayText.split('\n');
            lines.splice(0,1);
            if (lines.length > 0) {
                lines.splice(lines.length - 1,1);
            }
            $rootScope.apiOutputDisplay = lines.join('\n');
        }
        $timeout(function() {
            var logPanel = document.querySelector('#scroll-content');
            logPanel.scrollTop = logPanel.scrollHeight;
        }, 150);
        
    }, true);

    $scope.toggleSplitScreen = function() {
        $scope.$parent.splitScreen = !$scope.$parent.splitScreen;
    };

    $scope.toggleQuestionContext = function () {
        $scope.$parent.displayQuestionContext = !$scope.$parent.displayQuestionContext;
    }

    $scope.queryGoal = function() {
        var goalInfo = {
            id: $stateParams.id,
            sessionId: sessionId,
            object: $scope.goalInfo.objectInstance == 'user provided' ? $scope.init.objectInstance : $scope.goalInfo.objectInstance,
            subject:  $scope.goalInfo.subjectInstance == 'user provided' ? $scope.init.subjectInstance : $scope.goalInfo.subjectInstance,
            relationship: ($scope.goalInfo.relationship ? $scope.goalInfo.relationship : $scope.goalInfo.rel)
        };

        $scope.postMessage(goalInfo);

        GoalAPI.queryGoal(goalInfo, function (response) {
            $scope.showError = false;
            $scope.processResponse(response);
        }, validateAndHandleError);
    };

    function currentSession(id) {
        return id === sessionId;
    }

    function validateAndHandleError(err) {
        if (err && err.config && err.config.data && (!currentSession(err.config.data.sessionId))) {
            return;
        }

        handleError(err.data);
    }

    function formatObjectDateInQuestion(response) {
        if (response.question.objectType === 'date') {
            response.question.prompt = response.question.prompt.replace(response.question.object,
                $filter('rbDateOutputFormat')(response.question.object));
        }
    }

    $scope.processResponse = function (response) {
        if (!currentSession(response.sid)) {
            return;
        }

        $scope.postMessage(response);
        
        if (response.question && response.question.allowUnknown) {
            focusElementById('mainAgent');
        }

        response.questions = [];

        if (response.question) {
            if (config.uiSettings.questionGrouping && response.extraQuestions) {
				response.questions = response.extraQuestions;
			}
			response.question.answer = {selection: [], cf: 100};
            response.questions.splice(0, 0, response.question);
            response.questions.forEach(function (question) {

            	if (question.type == 'Second Form Object') {
            		question.knownAnswers.forEach(function(knownFact) {
            			question.concepts.forEach(function(concInst) {
							if (knownFact.object == concInst.value) {
								concInst.disabled = true;
							}
						})
					});
					question.concepts && question.concepts.forEach(function (concInst) {
						if (concInst.invalidResponse) {
							concInst.disabled = true;
						}
					});
				} else if (question.type == 'Second Form Subject') {
					question.knownAnswers.forEach(function(knownFact) {
						question.concepts.forEach(function(concInst) {
							if (knownFact.subject == concInst.value) {
								concInst.disabled = true;
							}
						})
					});
					question.concepts && question.concepts.forEach(function (concInst) {
						if (concInst.invalidResponse) {
							concInst.disabled = true;
						}
					});
				}

                question.answer = {selection: [], cf: 100};
                question.pluralInputCounter = 1;
                question.disabledConceptOptions = [];
                question.conceptOptions = [];
				question.concepts && question.concepts.forEach(function(concept) {
                	question.conceptOptions.push(concept.value);
                	if (concept.disabled) {
                		question.disabledConceptOptions.push(concept.value);
					}
				})
            });


            $scope.response = response;
        }

        if (response.question) {
            if (response.question.type === 'First Form') {
                $scope.display = 'firstForm';
                formatObjectDateInQuestion(response);
            } else {
                $scope.display = 'secondForm';
            }

        } else if (response.result && angular.isArray(response.result) && response.result.length > 0) {
            $scope.goalResults = [];
            $scope.response = {};
            response.result.forEach(function(element) {
                var resultText = ($scope.goalInfo.goalText ? $scope.goalInfo.goalText : $scope.goalInfo.text);

                var metaData = element.objectMetadata ? element.objectMetadata : '';

                resultText = resultText.replace(/%O/g, element.object);
                resultText = resultText.replace(/%R/g, element.relationship);
                resultText = resultText.replace(/%S/g, element.subject);
                resultText = resultText.replace(/%C/g, element.certainty);

                if ($scope.config.showEvidence) {
                    $scope.goalResults.push({text: resultText, cf: element.certainty, meta: metaData, factID: element.factID });
                } else {
                    $scope.goalResults.push({text: resultText, cf: element.certainty, meta: metaData});
                }
            });
            $scope.display = 'result';

            if ($scope.tryGoal){
                focusElementById('reset');
            } else {
                focusElementById('done');
            }

        } else if (angular.isArray(response.result)) {
            $scope.display = 'end';
        } else {
            handleError(response);
        }

    };

    $scope.enterPressed = function() {
		if ($scope.display === 'init data') {
			if ($scope.init.objectInstance || $scope.init.subjectInstance) {
				$scope.startGoalContext();
			}
		} else {
			if ($scope.response && $scope.response.questions) {
				var disableEnter = $scope.response.questions.some(function(question) {
					return question.dataType === 'string';
				});


			}
			if (!disableEnter && !$scope.disableContinue()) {
				$scope.respond();
			}
		}
    };

    $scope.selectConcept = function (value, index, question) {
        if (question.answer.selection[index] === value || value === '') {
            delete question.answer.selection[index];
        } else {
            question.answer.selection[index] = value;
        }
    };

    $scope.respond = function() {
        var formatObjectByDataType = function(dataType, usersAnswer) {
            if (dataType == 'date') {
                return usersAnswer.getTime ? usersAnswer.getTime() : new Date(usersAnswer).getTime();
            } else if (dataType == 'truth') {
                return usersAnswer == 'yes';
            } else {
                return usersAnswer;
            }
        };

        var hasValue = function(value) {
            return value == false || value == 0 || value;
        };

        $scope.display = 'thinking';

        var responseObject = [];
        $scope.response.questions.forEach(function(question) {

            if (question.type == 'First Form') {
                var temp = {
                    subject: question.subject,
                    object: question.object,
                    relationship: question.relationship,
                    cf: question.answer.cf
                };
                if (question.answer.selection.length) {
                    temp.answer = question.answer.selection[0];
                } else {
                    temp.unanswered = true;
                }
                responseObject.push(temp);
            } else { //Second form
				if (question.answer.selection.currentValue || question.answer.selection.currentValue === 0) {  //currentValue is used by some plural inputs where having it's value in the selection array is awkward.
					question.answer.selection.push(question.answer.selection.currentValue);
					delete question.answer.selection.currentValue;
				}
				if (typeof (question.answer.selection) == 'string') {
					question.answer.selection = [question.answer.selection];
				}

                if ($scope.containsAnswer(question.answer.selection)) {
                    question.answer.selection.forEach(function (userSelection) {
                        if (!hasValue(userSelection)) {
                            return;
                        }
                        if (userSelection == $scope.otherOption.value) {
                            userSelection = question.answer.otherValue;
                        }
                        responseObject.push({
                            subject: question.type == 'Second Form Subject' ? userSelection : question.subject,
                            object: question.type == 'Second Form Object' ? formatObjectByDataType(question.dataType, userSelection) : question.object,
                            relationship: question.relationship,
                            cf: question.answer.cf
                        });
                    });
                } else if (question.knownAnswers.length == 0) {  //no answer
                    responseObject.push({
                        subject: question.type == 'Second Form Subject' ? '' : question.subject,
                        object: question.type == 'Second Form Object' ? '' : question.object,
                        relationship: question.relationship,
                        cf: question.answer.cf,
                        unanswered: true
                    });
                }
            }

            question.knownAnswers && question.knownAnswers.forEach(function(knownAnswer) {
                responseObject.push({
                    subject: knownAnswer.subject,
                    object: knownAnswer.object,
                    relationship: knownAnswer.relationship.name,
                    cf: knownAnswer.cf
                });
            });

        });

        //THIS IS CRITICAL FOR EC
        $scope.postMessage({
            id: $stateParams.id,
            sessionId: sessionId,
            answers: responseObject
        });

        GoalAPI.response({
            id: $stateParams.id,
            sessionId: sessionId,
            answers: responseObject
        },
        function(result) {
            $scope.processResponse(result);
        }, validateAndHandleError);
    };

    $scope.back = function() {
        $scope.display = 'thinking';
        GoalAPI.back({ sessionId: sessionId },function(result) {
            if (alreadyDisplayingQuestion(result.question)){
                //Likely to already be at the opening question, so perform a 'reset'.
                $scope.runGoal($scope.goalInfo);
            } else {
                $scope.processResponse(result);
            }
        }, validateAndHandleError);
    };

    function alreadyDisplayingQuestion(question){
        return question && (question.prompt === $scope.response.question.prompt) &&
            (question.type === $scope.response.question.type);
    }

    $scope.done = function() {
        $scope.postMessage('Done');
        $('#tryGoalModal').modal('hide');
    };

    $scope.datePicker = (function () {
        var method = {};
        method.instances = [];

        method.open = function ($event, instance) {
            $event.preventDefault();
            $event.stopPropagation();

            method.instances[instance] = !method.instances[instance];
        };

        method.options = {
            startingDay: 1,
            showWeeks: false
        };

        return method;
    }());

    $scope.exit = function() {
        $scope.postMessage('Reset');
        $state.go('main.goalList', null, {
            location: 'replace'
        });
    };

    $scope.conceptIsKnownAnswer = function (concept) {
        var found = false;
        $scope.response.question.knownAnswers.forEach(function(knownAnswer) {
            if ((concept === knownAnswer.subject && $scope.response.question.type === 'Second Form Subject') ||
                (concept === knownAnswer.object && $scope.response.question.type === 'Second Form Object')) {
                found = true;
            }
        });
        return found;
    };

    $scope.displayContinueOrSkip = function () {
        var skip = true;
        $scope.response.questions.forEach(function(question) {
            if (!question.allowUnknown || (question.knownAnswers && question.knownAnswers.length > 0) || ($scope.containsAnswer(question.answer.selection))) {
                skip = false;
            }
        });
        return skip ? 'Skip' : 'Continue';
    };

    $scope.disableContinue = function () {
        var disabled = false;
        $scope.response.questions.forEach(function(question) {
            if (!disabled && !question.allowUnknown &&
                ((question.knownAnswers && question.knownAnswers.length == 0) || question.knownAnswers == undefined) &&
                (!$scope.containsAnswer(question.answer.selection))) {
                disabled = true;
            }
        });
        return disabled;
    };

    $scope.containsAnswer = function(answers){
        var ret = false;
        if (answers.currentValue || answers.currentValue === 0) {
        	return true;
		}
        for (var i = 0; i < answers.length; i++){
            if ($scope.hasValue(answers[i])){
                ret = true;
            }
        }
        return ret;
    };

    $scope.hasValue = function (value){
        return value !== '' && value !== undefined;
    };

    function runAgentGoal(){
        if ($stateParams.goalInfo != null) {
            $scope.display = 'thinking';
            $scope.goalInfo = $stateParams.goalInfo;
            $scope.runGoal($scope.goalInfo);
        } else {
            $state.go('main.goalList', null, {
                location: 'replace'
            });
        }
    }

    function init(){
        if ($stateParams.hasOwnProperty('goalInfo')) {
            runAgentGoal();
        }
    }

    $scope.unidirectionalPluralFalse = function (question){
        if ($scope.unidirectionalPluralFalseEnabled){
            return !question.plural && question.subject;
        } else {
            //Bidirectional plural false
            return !question.plural;
        }
    };

    $scope.generateQuestionId = function (relationship) {
        return 'qinput_' + relationship.replace(/[^A-Za-z0-9\-_\.]/g, '_');
    };

    init();
}])
		.directive('stringToNumber', function() {
			return {
				require: 'ngModel',
				link: function(scope, element, attrs, ngModel) {
					ngModel.$parsers.push(function(value) {
						return '' + value;
					});
					ngModel.$formatters.push(function(value) {
						return parseFloat(value);
					});
				}
			};
		});
