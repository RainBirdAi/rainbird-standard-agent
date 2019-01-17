angular.module('rbApp.results', [])
    .directive('results', function () {
        return {
            controller: 'ResultsController',
            restrict: 'E',
            scope: {
                resultData: '=resultData',
                goalInfo: '=goalInfo',
                config: '=config'
            },
            templateUrl: '/applications/results/results.html',
            link: function (scope, element, attrs, controller) {
                controller.init();
            }
        };
    })
    .controller('ResultsController', ['$scope', '$stateParams', 'ApiConfig',
        function ($scope, $stateParams, ApiConfig) {

            function setResponses(resultData, goalInfo) {
                $scope.yolandaUrl = ApiConfig.getConfig().url;
                $scope.sid = resultData.sid;
                $scope.goalResults = [];
                resultData.result.forEach(function (element) {
                    var resultText = (goalInfo.goalText ? goalInfo.goalText : goalInfo.text);
                    var metaData = element.objectMetadata ? element.objectMetadata : '';

                    resultText = resultText.replace(/%O/g, element.object);
                    resultText = resultText.replace(/%R/g, element.relationship);
                    resultText = resultText.replace(/%S/g, element.subject);
                    resultText = resultText.replace(/%C/g, element.certainty);

                    if ($scope.config.showEvidence) {
                        $scope.goalResults.push({
                            text: resultText,
                            cf: element.certainty,
                            meta: metaData,
                            factID: element.factID
                        });
                    } else {
                        $scope.goalResults.push({text: resultText, cf: element.certainty, meta: metaData});
                    }
                });
                $scope.display = 'result';
            }

            function init() {
                var sid = $stateParams.sid;
                if (sid) {
                    // #TODO: fetch these from the API endpoint
                    // Do we need to concern ourselves with the config.showEvidence config, which currently is defaulted to false if not set as part of the directive?
                    // At present it's only used to toggle the (i) which links one to the evidence tree page.
                    var resultData = {"result":[{"objectMetadata":{},"subjectMetadata":{},"object":"Bob","subject":"Bob","factID":"WA:KF:db6bf9201785db2cf299b63eedfa4e96aa146af7736d1e09ac78164bb0cb8a52","relationship":"has name","relationshipType":"has name","certainty":100}],"stats":{"getDBFact":{"calls":1,"items":1,"ms":4},"callDatasource":{"calls":0,"ms":0},"ensureCache":{"ms":3},"setDBFact":{"calls":0,"ms":0},"totalMS":44,"approxEngineMS":37,"totalConditionCount":0,"invocationStartTime":1547634008100},"sid":"6ce9d77c-6427-4f2b-8c60-1cf3fea1a3a5"};
                    var goalInfo = {"goalId":{"type":"Buffer","data":[169,47,184,72,177,181,65,23,133,19,88,46,74,131,201,207]},"contextId":"","questionText":"Is named","answerText":"%S is called %O","subject":"Person","subjectInstance":"Bob","relationship":"has name","object":"Name","objectInstance":null,"_id":"a92fb848-b1b5-4117-8513-582e4a83c9cf","description":"Is named","text":"%S is called %O","rel":"has name","$$hashKey":"object:15"};
                    setResponses(resultData, goalInfo);
                } else if ($scope.resultData && $scope.goalInfo) {
                    setResponses($scope.resultData, $scope.goalInfo);
                }
            }
            init();
            this.init = init;
        }]);