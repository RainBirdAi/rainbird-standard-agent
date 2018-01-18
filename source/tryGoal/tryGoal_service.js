var services = angular.module('rbApp.tryGoal.service', ['ngResource']);

services.factory('ConfigAPI', ['$resource', function($resource) {

    return $resource('', {}, {
        config: {
            method:'GET', url: '/agent/:id/config', interceptor : {responseError : resourceErrorHandler}
        },
        getGoalInfo: {
            method:'GET', url: '/goal/info/:goalid/:id', interceptor : {responseError : resourceErrorHandler}
        },
        getSessionId: {
            method:'GET', url: '/agent/:id/start/contextid', interceptor : {responseError : resourceErrorHandler}
        }
    });
}]);

services.factory('agentHttpInterceptor', ['agentMemory', '$rootScope', function(agentMemory, $rootScope) {
    
    $rootScope.apiOutput = new Array();

    return {

        'request': function(config) {
            
            if (agentMemory.tryGoal && !config.url.endsWith('.html') && 
            (config.url.endsWith('query') || config.url.endsWith('response'))) {
                var log = {type: 'request'};
                log.method = config.method;
                log.url = config.url;      
                log.params = config.params;  
                log.data = config.data;   
                log.headers = config.headers;    
                $rootScope.apiOutput.push(log);
            }
            return config;
        },
    
        'response': function(response) {
            var log;
            if (response.data && response.data.apiLog) {
                log = response.data.apiLog;
                $rootScope.apiOutput.push(log.request);
                $rootScope.apiOutput.push(log.response);

            } else if (agentMemory.tryGoal && !response.config.url.endsWith('.html') && 
            (response.config.url.endsWith('query') || response.config.url.endsWith('response'))) {

                log = {type: 'response'};
                log.method = response.config.method;
                log.url = response.config.url;   
                log.data = JSON.parse(JSON.stringify(response.data)); 
                log.headers = response.config.headers;
                $rootScope.apiOutput.push(log);
            }

            return response;
        }
    };
}]);

services.factory('GoalAPI', ['$resource', 'ApiConfig', function($resource, ApiConfig) {
    return $resource('', {sessionId: '@sessionId'}, {
        startGoal: {
            method: 'GET', url: ApiConfig.getConfig().url + '/start/:id',
            interceptor: {responseError: resourceErrorHandler},
            headers: {'Authorization': ApiConfig.getConfig().auth}
        },
        queryGoal: {
            method: 'POST', url: ApiConfig.getConfig().url + '/:sessionId/query',
            interceptor: {responseError: resourceErrorHandler}
        },
        response: {
            method: 'POST', url: ApiConfig.getConfig().url + '/:sessionId/response',
            interceptor: {responseError: resourceErrorHandler}
        },
        back: {
            method: 'POST', url: ApiConfig.getConfig().url + '/:sessionId/undo',
            interceptor: {responseError: resourceErrorHandler}
        }

    });

}]);

function resourceErrorHandler(response) {
    /*eslint-disable no-console*/
    console.log('Resource Error');
    console.log(response);
    /*eslint-enable no-console*/
}
