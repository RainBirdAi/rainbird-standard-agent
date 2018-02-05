angular.module('rbAgent')
.controller('AgentGoalListController', ['agentMemory', '$scope', '$rootScope', 'config', '$state', function(agentMemory, $scope, $rootScope, config, $state){

    $scope.config = config;
    $scope.contextId = agentMemory.contextId;
    $scope.tryGoal = false;

    window.addEventListener('message', function(event) {
        if (event.data && event.data.tryGoal) {
            agentMemory.tryGoal = true;
            if (event.data.close) {
                $state.go('main.goalList', null, {
                    location: 'replace'
                });
            } else {
                parent.postMessage('goal received', '*');
                $state.go('main.startGoal', {goalInfo: event.data, id: $scope.id}, {
                    location: 'replace'
                });
            }
        }
    }, false);

    if (config.$resolved !== undefined && !config.$resolved) {
        config.$promise.then(function() {
            printLog($scope.id, $scope.api, config);
        }).catch(function (err){
            handleError(err.data);
        });
    } else {
        printLog($scope.id, $scope.api, config);
    }

    $scope.startGoal = function (goal) {
        parent.postMessage({goal:goal}, '*');
        goal.contextId = $scope.contextId;
        agentMemory.contextId = goal.contextId;
        $state.go('main.startGoal', { goalInfo: goal, id: $scope.id });
    };

    function printLog(agentId, yolanda, config) {
        /*eslint-disable no-console*/
        console.log('------- Rainbird Agent -------');
        console.log('Agent ID   :', agentId);
        console.log('Endpoint   :', yolanda);
        console.log('User       :', config.kbUser);
        console.log('Goals      :', config.goals.length);
        console.log('Evidence   :', config.showEvidence ? 'enabled' : 'disabled');
        console.log('Context    :', config.showAlias ? 'enabled' : 'disabled');
        console.log('UI-Settings:', config.uiSettings);
        console.log('------------------------------');
        /*eslint-enable no-console*/
    }

    function handleError(err) {
    	console.error(err);
        $scope.errorMessage = err.message ? err.message : 'Sorry! An error occurred. Please try again.';
        $scope.display = 'error';
    }

}]);

