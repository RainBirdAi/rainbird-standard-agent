angular.module('rbAgent')
.controller('AgentGoalListController', ['agentMemory', '$scope', '$rootScope', 'config', '$state', function(agentMemory, $scope, $rootScope, config, $state){

    $scope.config = config;
    $scope.contextId = agentMemory.contextId;

    window.addEventListener('message', function(event) {
        //if(event.origin != '') { //enable at some point
        //    return;
        //}
        var data = event.data ? null : JSON.parse(event.data);

        if (data && data.startGoal) {
            /*eslint-disable no-console*/
            console.log('GO', data);
            /*eslint-enable no-console*/
            $state.go('startGoal', {goalInfo: event.data, id: $scope.id});
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
        $state.go('startGoal', { goalInfo: goal, id: $scope.id });
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
        $scope.errorMessage = err.message ? err.message : 'Sorry! An error occurred. Please try again.';
        $scope.display = 'error';
    }

}]);

