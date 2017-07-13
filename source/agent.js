var agentApp = angular.module('rbAgent', ['ui.router', 'rbApp.tryGoal', 'rbApp.tryGoal.service', 'ui.bootstrap']);

agentApp.value('agentMemory',
    {
        contextId: '',
        sessionId: '',
        tryGoal: false
    }
);


agentApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('goalList', {
            url: '/',
            templateUrl: '/applications/goalList/agentGoalList.html',
            controller: 'AgentGoalListController',
            resolve: {
                config: ['ConfigAPI', '$rootScope', function(ConfigAPI, $rootScope) {
                    return ConfigAPI.config({ id: $rootScope.id });
                }]
            }
        })
        .state('startGoal', {
            url: '/startGoal',
            templateUrl: '/applications/tryGoal/component/tryGoalAgent.html',
            controller: 'TryGoalController',
            resolve: {
                config: ['ConfigAPI', '$rootScope', function(ConfigAPI, $rootScope) {
                    return ConfigAPI.config({ id: $rootScope.id });
                }]
            },
            params: { goalInfo: null, id: null }
        });

}]);

agentApp.service('ApiConfig', ['$rootScope', function($rootScope){

    var config = { url: $rootScope.api };

    return {
        getConfig: function () {
            return config;
        }
    };

}]);

agentApp.factory('focusElementById', function($timeout, $window) {
    return function(id) {
        $timeout(function() {
            var element = $window.document.getElementById(id);
            if (element) {
                element.focus();
            }
        });
    };
});
