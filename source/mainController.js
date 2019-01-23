angular.module('rbAgent')
    .controller('MainController', ['$scope', 'config', '$state',
        function($scope, config, $state) {
            $scope.config = config;
            $scope.state = $state;

            if ($state.current.name !== 'main.results') {
                $state.go('main.goalList', null, {
                    location: 'replace'
                });
            }
            $scope.splitScreen = false;
        }]);
