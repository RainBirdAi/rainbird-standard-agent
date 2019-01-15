angular.module('rbApp.results', [])
.controller('ResultsController', ['$scope', '$stateParams', function($scope, $stateParams) {
    $scope.goalResults = [];
    $scope.response = {};
    
    function setResponses(responseData) {
        $scope.goalResults = [];
        $scope.response = {};
        $scope.goalInfo;
        responseData.result.forEach(function(element) {
            var resultText = ($scope.goalInfo.goalText ? $scope.goalInfo.goalText : $scope.goalInfo.text);

            var metaData = element.objectMetadata ? element.objectMetadata : '';

            resultText = resultText.replace(/%O/g, element.object);
            resultText = resultText.replace(/%R/g, element.relationship);
            resultText = resultText.replace(/%S/g, element.subject);
            resultText = resultText.replace(/%C/g, element.certainty);

            if ($scope.config.showEvidence) {
                $scope.goalResults.push({text: resultText, cf: element.certainty, meta: metaData, factID: element.factID });
            } else {
                $scope.goalResults.push({text: resultText, cf: element.certainty, meta: metaData});
            }
        });
        $scope.display = 'result';

        if ($scope.tryGoal){
            // focusElementById('reset');
        } else {
            // focusElementById('done');
        }
    }
    
    function init() {
        var responseData = $stateParams.responseData;
        var goalInfo = $stateParams.goalInfo;
        $scope.goalInfo = goalInfo;

        if (responseData && goalInfo) {
            setResponses(responseData, goalInfo);
        }
    }
    
    init();
}]);
