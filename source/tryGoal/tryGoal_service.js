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
