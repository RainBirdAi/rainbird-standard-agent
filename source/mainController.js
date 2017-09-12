angular.module('rbAgent')
    .controller('MainController', ['$scope', 'config', '$state',
        function($scope, config, $state) {
            $scope.config = config;
            $scope.state = $state;
            $state.go('main.goalList', null, {
                location: 'replace'
            });
        }]);
