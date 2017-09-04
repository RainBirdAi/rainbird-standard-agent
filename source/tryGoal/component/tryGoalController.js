angular.module('rbApp.tryGoal')
.controller('TryGoalController', ['$scope', 'agentMemory', '$compile', '$stateParams', 'config', 'GoalAPI', 'ConfigAPI', 'ApiConfig', '$state', '$location', '$filter', 'focusElementById',
function($scope, agentMemory, $compile, $stateParams, config, GoalAPI, ConfigAPI, ApiConfig, $state, $location, $filter, focusElementById) {

    var contextId;
    var sessionId;
    $scope.config = config;
    $scope.otherOption = {value: '(other - not listed)'};
    $scope.yolandaUrl = ApiConfig.getConfig().url;
    $scope.tryGoal = agentMemory.tryGoal;

    $scope.updateAlias = function() {
        sessionId = null;
    };

    $scope.$on('tryGoal', function(event, args) {  //probably delete all this.
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

    function getNumberInput(instance){
        return '<input id="numberInput' + instance + '" class="rb-try-goal-full-width numberInput" rb-number-only type="number" ng-model="answer.selection[' + instance + ']" class="rb_input number" />';
    }

    function getDateInput(instance){
        return '<div class="instanceDatepicker" id="dateInput' + instance + '">' +
            '<input id="dateInputText' + instance + '" type="text" class="form-control" uib-datepicker-popup ng-model="answer.selection[' + instance + ']" is-open="datePicker.instances[' + instance + ']" ' +
            'datepicker-options="datePicker.options" ng-required="true" close-text="Close" show-button-bar="false" placeholder="yyyy-MM-dd" popup-placement="auto bottom-left" ng-model-options="{timezone: \'utc\'}"/>  ' +
            '<button id="datePicker' + instance + '" type="button" class="btn btn-default displayPicker" ng-click="datePicker.open($event, ' + instance + ')"><i class="glyphicon glyphicon-calendar"></i></button></div>';
    }

    $scope.addPluralInput = function(type) {
        var instance = $scope.pluralInputCounter++;
        var input = (type == 'number') ? angular.element(getNumberInput(instance)) : angular.element(getDateInput(instance));
        var ele = document.querySelector('#' + type + 'Inputs');
        $compile(input)($scope);
        angular.element(ele).append(input);
    };

    $scope.removePluralInput = function(type) {
        var ele = document.querySelector('#' + type + 'Input' + ($scope.pluralInputCounter - 1));
        ele.parentNode.removeChild(ele);
        delete $scope.answer.selection[$scope.pluralInputCounter - 1];
        $scope.pluralInputCounter--;
    };

    $scope.startGoalContext = function() {
        $scope.display = 'thinking';

        ConfigAPI.getSessionId({ id: $stateParams.id, contextid: contextId}, function(response) {
            sessionId = response.sessionId;
            $scope.queryGoal();
        });
    };

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
        }, function (err) {
            handleError(err.data);
        });
    };

    function formatObjectDateInQuestion(response) {
        if (response.question.objectType === 'date') {
            response.question.prompt = response.question.prompt.replace(response.question.object,
                $filter('rbDateOutputFormat')(response.question.object));
        }
    }

    $scope.processResponse = function (response) {
        $scope.postMessage(response);
        
        if (response.question && response.question.allowUnknown) {
            focusElementById('mainAgent');
        }

        $scope.answer = {cf: 100, selection: []};
        $scope.otherValues = [];
        $scope.response = response;

        if (response.question) {
            if (response.question.plural){
                $scope.pluralInputCounter = 1;
                $scope.answer.selection = [];
            }
            if (response.question.type === 'First Form') {
                $scope.display = 'firstForm';
                formatObjectDateInQuestion(response);
            } else {
                $scope.response.concepts = response.question.concepts;
                if ($scope.response.concepts && response.question.canAdd !== false && !$scope.response.question.plural) {
                    $scope.response.concepts.push($scope.otherOption);
                }
                $scope.display = 'secondForm';
            }
        } else if (response.result && angular.isArray(response.result) && response.result.length > 0) {
            $scope.goalResults = [];
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

    $scope.addOtherInput = function () {
        if (!$scope.response.question.plural) {
            return;
        }

        if (!~$scope.otherValues.indexOf('')) {
            var otherValuesLength = $scope.otherValues.length;
            var conceptsLength = ($scope.response.question.concepts ? $scope.response.question.concepts.length : 0);

            $scope.otherValues[otherValuesLength] = '';
            var input = angular.element(
                '<div class="inlineCheckboxGrouped" id="'+ ('otherValueInput'+otherValuesLength) +'">' +
                '<label>' +
                '<i class="fa fa-minus-square" aria-hidden="true" ng-click="selectConcept(otherValues['+otherValuesLength+'], ' +
                (otherValuesLength + conceptsLength) + '); removeOtherInput('+otherValuesLength+')"></i>' +
                '<input ng-model="otherValues['+otherValuesLength+']" class="rb-try-goal-full-width" ' +
                ' placeholder="enter other value" ng-change="selectConcept(otherValues['  +
                        otherValuesLength+  '], ' + (otherValuesLength + conceptsLength) + '); addOtherInput([' + otherValuesLength + '])" ' +
                '   value="" type="text" style="margin-left: 3px;">' +
                '</label>'+
                '</div>');
            $compile(input)($scope);
            var ele = document.querySelector('#secondFormBlock');
            angular.element(ele).append(input);
        }
    };

    $scope.removeOtherInput = function (index) {
        if (index !== undefined) {
            $scope.otherValues[index] = '';
        }
        var indexOfFirstEmpty = $scope.otherValues.indexOf('');

        var keyArray = Object.keys($scope.otherValues);
        for (var i = keyArray.length-1; i >= 0; i--) {
            if (($scope.otherValues[keyArray[i]] == undefined ||  $scope.otherValues[keyArray[i]] === '') && keyArray[i] != indexOfFirstEmpty) {
                angular.element('#'+'otherValueInput'+keyArray[i]).remove();
                delete $scope.otherValues[keyArray[i]];
            }
        }
    };

    $scope.enterPressed = function() {
        if ($scope.display === 'init data') {
            if ($scope.init.objectInstance || $scope.init.subjectInstance){
                $scope.startGoalContext();
            }
        } else {
            if (!$scope.disableContinue()) {
                $scope.respond();
            }
        }
    };

    $scope.selectConcept = function (value, index) {
        if ($scope.answer.selection[index] === value || value === '') {
            delete $scope.answer.selection[index];
        } else {
            $scope.answer.selection[index] = value;
        }
        $scope.removeOtherInput();
    };

    $scope.respond = function() {

        var answerTemplate = {
            'subject': $scope.response.question.subject,
            'relationship': $scope.response.question.relationship,
            'object': $scope.response.question.object,
            'cf': $scope.answer.cf
        };
        var answers = [];
        var selections = [];
        var otherIndex;

        $scope.display = 'thinking';

        if ( $scope.answer.selection ) {
            if (angular.isArray($scope.answer.selection)) {
                $scope.answer.selection.forEach(function(element) {
                    selections.push(element);
                });
            } else {
                selections = [$scope.answer.selection];
            }

            otherIndex = selections.indexOf($scope.otherOption.value);
            if (otherIndex !== -1) {
                if (typeof($scope.answer.otherValue) == 'undefined') {
                    selections.splice(otherIndex, 1);
                } else {
                    selections[otherIndex] = $scope.answer.otherValue;
                }
            }
        }

        if ($scope.response.question.type === 'First Form' ) {
            if (selections.length === 1) {
                answerTemplate.answer = selections[0];
                answers.push(answerTemplate);
            }
        } else if ($scope.response.question.type === 'Second Form Subject' ) {
            var sendSubjects = selections;
            sendSubjects.forEach(function (item) {
                answerTemplate.subject = item;
                answers.push(angular.copy(answerTemplate));
            });
        } else {
            var sendObjects = [];
            switch ($scope.response.question.dataType) {
            case 'date':
            case 'number':
                sendObjects = $scope.response.question.plural   ? selections : typeof($scope.answer.value) != 'undefined' ? [$scope.answer.value] : [];
                break;
            default:
                sendObjects = selections;
            }
            sendObjects.forEach(function (item) {
                if ($scope.response.question.dataType === 'date') {
                    answerTemplate.object = item.getTime ? item.getTime() : new Date(item).getTime();
                } else {
                    answerTemplate.object = item;
                }
                answers.push(angular.copy(answerTemplate));
            });
        }

        if ($scope.response.question.knownAnswers && ($scope.response.question.plural || answers.length === 0)) {
            $scope.response.question.knownAnswers.forEach(function (triple) {
                var tempTriple = triple;
                tempTriple.relationship = tempTriple.relationship.name;
                answers.push(tempTriple);
            });
        }

        if (answers.length === 0) {
            answerTemplate.unanswered = true;
            answers.push(answerTemplate);
        }

        $scope.postMessage({
            id: $stateParams.id,
            sessionId: sessionId,
            answers: answers
        });

        GoalAPI.response({
            id: $stateParams.id,
            sessionId: sessionId,
            answers: answers
        },
        function(result) {
            $scope.processResponse(result);
        },
        function(err) {
            handleError(err.data);
        });
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
        },function(err) {
            handleError(err.data);
        });
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
        $state.go('goalList');
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
        return (!$scope.response.question.allowUnknown ||
            ($scope.answer.selection && containsAnswer($scope.answer.selection)) || hasValue($scope.answer.value)) ?
            'Continue' : 'Skip';
    };

    $scope.disableContinue = function () {
        return !$scope.response.question.allowUnknown && !hasValue($scope.answer.value) &&
            (($scope.response.question.knownAnswers && $scope.response.question.knownAnswers.length == 0) || $scope.response.question.knownAnswers == undefined) &&
            (!$scope.answer.selection || !containsAnswer($scope.answer.selection));
    };

    function containsAnswer(answers){
        //Check required as cleared 'other' answers still exist with undefined values
        for (var i = 0; i < answers.length; i++){
            if (hasValue(answers[i])){
                return true;
            }
        }
        return false;
    }

    function hasValue(value){
        return value || value === 0 || value === false;
    }

    function runAgentGoal(){
        if ($stateParams.goalInfo != null){
            $scope.display = 'thinking';
            $scope.goalInfo = $stateParams.goalInfo;
            $scope.runGoal($scope.goalInfo);
        } else {
            $state.go('goalList');
        }
    }

    function init(){
        if ($stateParams.hasOwnProperty('goalInfo')) {
            runAgentGoal();
        }
    }

    init();
}]);
