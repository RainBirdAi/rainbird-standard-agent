angular.module('rbApp.results', [])
    .directive('results', function () {
        return {
            controller: 'ResultsController',
            restrict: 'E',
            scope: {
                config: '=config',
                goalInfo: '=goalInfo',
                resultData: '=resultData'
            },
            templateUrl: '/applications/results/results.html'
        };
    })
    .controller('ResultsController', ['$scope', '$state', '$stateParams', '$timeout', 'ResultsAPI', 'ConfigAPI', 'ApiConfig',
        function ($scope, $state, $stateParams, $timeout, ResultsAPI, ConfigAPI, ApiConfig) {

            $scope.token = $stateParams.token || false;
            $scope.goalId = $stateParams.goalId || $scope.goalInfo._id;
            $scope.sid = $stateParams.sid || $scope.resultData.sid;
            $scope.pdfExpired = false;

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
                        $scope.goalResults.push({ text: resultText, cf: element.certainty, meta: metaData });
                    }
                });
                $scope.display = 'result';
            }

            if ($state.is('main.results') && !$scope.token) {
                $state.go('main.goalList');
            }

            $scope.getPDFDownload = function () {
                return $scope.config.pdfServiceUrl + '/agents/' + $scope.config.id + '/goals/' + $scope.goalId + '/interactions/' + $scope.sid + '/results.pdf';
            };

            if (!$scope.resultData) {
                // Do we need to concern ourselves with the config.showEvidence config, which currently is defaulted to false if not set as part of the directive?
                // At present it's only used to toggle the (i) which links one to the evidence tree page.
                ResultsAPI({ token: $scope.token, interactionId: $scope.sid }).then(function (response) {
                    setResponses(response.data, $scope.config.goals.filter(function (i) { return i._id === $scope.goalId; })[0]);
                }, function () {
                    $state.go('main.goalList');
                });
            } else {
                setResponses($scope.resultData, $scope.goalInfo);
            }

            $timeout(function() {
                $scope.pdfExpired = true;
            }, 900000);
        }]);
