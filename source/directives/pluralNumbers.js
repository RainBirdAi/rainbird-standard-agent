angular.module("pluralNumbers", []).directive("pluralNumbers", [
  function () {
    return {
      link: function (scope, element) {
        //SETTINGS
        scope.forceUniqueNumbers = false; //set to false to allow the front end to send an array like ['10', '10'].
        scope.fractionalPart = false;
        //END SETTINGS

        scope.inputValue = "";
        scope.answers = [];

        element.on("keydown", function (e) {
          if (e.key == " ") {
            e.preventDefault();
            addNumberToAnswers();
          } else if (e.key == "Backspace") {
            if (
              typeof scope.inputValue != "number" &&
              scope.pluralNumbersInput.$valid
            ) {
              scope.answers.splice(scope.answers.length - 1, 1);
              scope.answers.currentValue = "";
              e.preventDefault();
            } else if (
              typeof scope.inputValue == "number" &&
              scope.inputValue.toString().indexOf(".") === -1
            ) {
              scope.fractionalPart = false;
            }
            scope.$apply();
          } else if (e.key == "-" && scope.inputValue == "") {
            if (!!~scope.inputValue.toString().indexOf("-")) {
              e.preventDefault();
            }
          } else if (
            !~[
              "0",
              "1",
              "2",
              "3",
              "4",
              "5",
              "6",
              "7",
              "8",
              "9",
              ".",
              "-",
              "ArrowLeft",
              "ArrowRight",
            ].indexOf(e.key)
          ) {
            e.preventDefault();
          } else {
            // Check that the number won't become too big.
            // We allow 15 digits.
            if (typeof scope.inputValue == "number" && !scope.fractionalPart) {
              if (e.key == ".") {
                scope.fractionalPart = true;
              } else {
                var newValue = scope.inputValue.toString().concat(e.key);
                if (newValue.replace(/^-/, "").length > 15) {
                  e.preventDefault();
                }
              }
            }
          }
        });

        function addNumberToAnswers() {
          var inputDigits = /[0-9.-]*/.exec(scope.inputValue)[0];
          scope.inputValue = inputDigits;
          if (scope.inputValue.length > 0) {
            if (
              scope.forceUniqueNumbers &&
              !~scope.answers.indexOf(scope.inputValue)
            ) {
              scope.answers.push(scope.inputValue);
            } else if (!scope.forceUniqueNumbers) {
              scope.answers.push(scope.inputValue);
            }
            scope.inputValue = "";
            scope.answers.currentValue = "";
            scope.$apply();
          }
        }

        scope.deleteNumber = function (index) {
          scope.answers.splice(index, 1);
        };

        //Div disguises itself as an input, when clicking on the div, focus the nested tiny input box
        scope.input = element[0].children[0].children[0];
        element.on("mousedown", function (e) {
          scope.input.focus();
          e.preventDefault();
        });

        scope.numberChange = function (e) {
          scope.answers.currentValue = scope.inputValue;
        };

        scope.addNumberPressed = function (e) {
          addNumberToAnswers();
        };
      },
      restrict: "E",
      scope: {
        answers: "=",
        plural: "=",
      },
      template:
        '<div class="ui input selection search numberInputSemantic" ng-form="pluralNumbersInput" >' +
        '<a ng-repeat="answer in answers track by $index" class="ui label transition visible" data-value="worst colour a">' +
        '{{answer}}<i class="delete icon" ng-click="deleteNumber($index)"></i>' +
        "</a>" +
        '	<input ng-change="numberChange()" class="search semanticInputOverride" type="number" placeholder="number" ng-model="inputValue" max="999999999999999" min="-999999999999999" >' +
        '<label class="hoverOverLightElement fa fa-plus ui label plusButton" ng-click="addNumberPressed()"></label>' +
        "</div>",
    };
  },
]);
