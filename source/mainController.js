angular.module('rbAgent')
    .controller('MainController', ['$scope', 'config', '$state', '$timeout', '$rootScope',
        function($scope, config, $state, $timeout, $rootScope) {
            $scope.config = config;
            $scope.state = $state;
            $state.go('main.goalList', null, {
                location: 'replace'
            });



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
        }]);
