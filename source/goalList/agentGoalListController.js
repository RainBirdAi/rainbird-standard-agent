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

    $scope.startGoal = function (goal) {
        parent.postMessage({goal:goal}, '*');
        goal.contextId = $scope.contextId;
        agentMemory.contextId = goal.contextId;
        $state.go('main.startGoal', { goalInfo: goal, id: $scope.id });
    };

}]);

