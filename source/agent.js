var agentApp = angular.module('rbAgent', ['ui.router', 'rbApp.tryGoal', 'rbApp.tryGoal.service', 'ui.bootstrap', 'semantic-ui', 'pluralNumbers', 'datePicker']);

agentApp.value('agentMemory',
    {
        contextId: '',
        sessionId: '',
        tryGoal: false
    }
);


agentApp.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider) {

    $urlRouterProvider.otherwise('/main');

    $stateProvider
        .state('unauthorised', {
            url: '/unauthorised'
        })
        .state('main', {
            url: '/main',
            templateUrl: '/applications/main.html',
            controller: 'MainController',
            resolve: {
                config: ['ConfigAPI', '$rootScope', function(ConfigAPI, $rootScope) {
                    return ConfigAPI.config({ id: $rootScope.id });
                }]
            }
        })
        .state('main.goalList', {
            url: '/goalList',
            templateUrl: '/applications/goalList/agentGoalList.html',
            controller: 'AgentGoalListController',
            resolve: {
                config: ['$q', 'ConfigAPI', '$rootScope', 'Security', '$state', function($q, ConfigAPI, $rootScope, Security, $state) {
                    var deferred = $q.defer();
                    ConfigAPI.config({ id: $rootScope.id }).$promise.then(function(config){

                        $rootScope.config = config;

                        if (Security.checkReferrerValid(config.authorisedDomains)) {
                            deferred.resolve(config);
                        } else {
                            $state.go('unauthorised');
                            deferred.reject();
                        }
                    });
                    return deferred.promise;
                }]
            }
        })
        .state('main.startGoal', {
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

    $httpProvider.interceptors.push('agentHttpInterceptor');
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

agentApp.factory('Security', ['$window', 'formatHelpers', function($window, formatHelpers) {
    return {
        'checkReferrerValid': function(authorisedDomains) {
            var validReferrer = true;

            // Are we in an iFrame?
            if ($window.self != $window.top) {

                var referrer = $window.document.referrer;

                if (Array.isArray(authorisedDomains) && authorisedDomains.length > 0 && referrer) {

                    var formattedAuthorisedDomains = formatHelpers.formatAuthorisedDomain(authorisedDomains);
                    var formattedReferrer = formatHelpers.extractSchemeAndHost(referrer);

                    var referrerIndex = formattedAuthorisedDomains.indexOf(formattedReferrer);

                    if (referrerIndex === -1) {
                        validReferrer = false;
                    }
                }
            }
            return validReferrer;
        }
    };
}]);

agentApp.factory('formatHelpers', function() {

    var helpers = {};

    // Input:  http://www.example.org:8080/mypage/theone?query=hello
    // Output: http://www.example.org:8080
    helpers.extractSchemeAndHost = function(url) {
        var matches = url.match(/(^https?\:\/\/([^\/?#]+))(?:[\/?#]|$)/i);
        return matches && matches[1];
    };

    helpers.formatAuthorisedDomain = function(domains) {
        var formatedDomains = [];
        domains.forEach(function(domain){
            formatedDomains.push(helpers.extractSchemeAndHost(domain));
        });
        return formatedDomains;
    };

    return helpers;
});

// 500 delay is needed for the userProvided input.
// A shorter delay causes it to lose focus.
agentApp.directive('autofocus', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link : function($scope, $element) {
            $timeout(function() {
                $element[0].focus();
            }, 500);
        }
    };
}]);
