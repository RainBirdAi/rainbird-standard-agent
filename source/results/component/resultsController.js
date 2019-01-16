angular.module('rbApp.results', [])
    .directive('results', function () {
        return {
            controller: 'ResultsController',
            restrict: 'E',
            scope: {
                responseData: '=responseData',
                goalInfo: '=goalInfo'
            },
            templateUrl: '/applications/results/results.html',
            link: function (scope, element, attrs, controller) {
                scope.config = {showEvidence: false};
                controller.$postLink(scope.responseData);
            }
        };
    })
    .controller('ResultsController', ['$scope', '$stateParams', 'ApiConfig',
        function ($scope, $stateParams, ApiConfig) {
            $scope.response = {};

            function setResponses(responseData) {
                $scope.yolandaUrl = ApiConfig.getConfig().url;
                $scope.goalResults = [];
                $scope.response = {};
                $scope.goalInfo;
                $scope.responseData;
                responseData.result.forEach(function (element) {
                    var resultText = ($scope.goalInfo.goalText ? $scope.goalInfo.goalText : $scope.goalInfo.text);

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
                var responseData = $stateParams.responseData;
                var goalInfo = $stateParams.goalInfo;

                if (responseData && goalInfo) {
                    $scope.goalInfo = goalInfo;
                    setResponses(responseData, goalInfo);
                }
            }

            this.$postLink = function () {
                setResponses($scope.responseData);
            };
            // init();
        }]);
