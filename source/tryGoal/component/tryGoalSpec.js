describe('Try Goal Controller', function() {
    var scope;
    /*eslint-disable no-unused-vars*/
    var ctrl;
    /*eslint-enable no-unused-vars*/
    var state;
    var $httpBackend;
    var GoalAPI;
    var ConfigAPI;
    var location;
    var yolanda_external = 'http://127.0.0.1:3100';

    beforeEach(module('/sharedAgent/tryGoal/component/tryGoalModal.html'));
    beforeEach(module('ui.router'));
    beforeEach(module('rbApp.tryGoal.service'));
    //beforeEach(module('rbAgent.agentMemory'));
    beforeEach(module('rbApp.tryGoal'));
    beforeEach(function() {
        module(function($provide) {
            $provide.service('ApiConfig', function () {
                this.getConfig = function() {
                    return { url: yolanda_external };
                };
            });

            $provide.service('config', function () {
                return { showEvidence: true };
            });

            $provide.value('rbDateOutputFormatFilter', function(timestamp) {
                if (timestamp === 1268179200000){
                    return '10th March, 2010';
                } else {
                    return 'Unexpected timestamp';
                }

            });

            $provide.value('agentMemory', function () {
                return { tryGoal: false };
            });

            $provide.service('focusElementById', function () {
                return { };
            });
        });
    });

    describe('Test Try Goal Controller', function () {

        beforeEach(inject(
            function ($rootScope, $controller, _$httpBackend_, $stateParams, _ConfigAPI_, _GoalAPI_, _$state_, _$location_) { // jshint ignore:line
                scope = $rootScope.$new();

                $httpBackend = _$httpBackend_;
                $stateParams.id = '10000001';
                ConfigAPI = _ConfigAPI_;
                GoalAPI = _GoalAPI_;
                location = _$location_;
                state = _$state_;

                ctrl = $controller('TryGoalController', {
                    $scope: scope,
                    $stateParams: $stateParams,
                    GoalAPI: GoalAPI,
                    ConfigAPI: ConfigAPI,
                    $location: location
                });
            })
        );

        function backendCalls(goalInfo, startSession, responseJSON) {

            $httpBackend.expectGET('/goal/info/10001234/10000001').respond(200, goalInfo);

            if (startSession) {
                $httpBackend.expectGET(yolanda_external + '/start/10000001').respond(200, {id: 'sessionId1'});
                $httpBackend.expectPOST(yolanda_external + '/sessionId1/query', {
                    id: '10000001',
                    sessionId: 'sessionId1',
                    subject: 'Fred',
                    relationship: 'speaks',
                    object: null
                }).respond(200, responseJSON);
            }

            scope.$broadcast('tryGoal', {goalid: '10001234'});
            $httpBackend.flush();
        }


        xit('should load goalInfo', function () {

            var spyOnRunGoal = sinon.spy(scope, 'runGoal');
            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: 'user provided',
                subjectInstance: null,
                goalText: 'You need %O',
                goalId: '10001234',
                kmid: 'kmid-10001234'
            };
            /*eslint-disable no-console*/
            console.log(goalInfo.kmid);

            $httpBackend.expectGET('/goal/info/10001234/10000001').respond(200, goalInfo);
            scope.$broadcast('tryGoal', {goalid: '10001234'});
            $httpBackend.flush();
            /*eslint-enable no-console*/

            spyOnRunGoal.should.have.been.calledOnce;
            expect(scope.goalInfo.description).to.equal(goalInfo.description);
        });

        xit('should request initial subject data', function () {

            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'user provided',
                goalText: 'You need %O',
                kmid: '10000001'
            };

            $httpBackend.expectGET('/goal/info/10001234/10000001').respond(200, goalInfo);
            scope.$broadcast('tryGoal', {goalid: '10001234'});
            $httpBackend.flush();

            expect(scope.display).to.equal('init data');
            expect(scope.subjectPrompt).to.equal('Person');
        });

        xit('should request initial object data', function () {

            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: 'user provided',
                subjectInstance: null,
                goalText: 'You need %O',
                kmid: '10000001'
            };

            $httpBackend.expectGET('/goal/info/10001234/10000001').respond(200, goalInfo);
            scope.$broadcast('tryGoal', {goalid: '10001234'});
            $httpBackend.flush();

            expect(scope.display).to.equal('init data');
            expect(scope.objectPrompt).to.equal('Language');
        });

        xit('should not request any initial data', function () {

            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true,
                {
                    'question': {
                        'subject': 'Fred',
                        'relationship': 'lives in',
                        'object': null,
                        'prompt': 'Where does Fred live?',
                        'plural': false,
                        'allowCF': true,
                        'allowUnknown': true,
                        type: 'Second Form Object',
                        concepts: ['England', 'France']
                    }
                }
            );

            expect(scope.display).to.equal('secondForm');
        });

        xit('should show error when query returns with 400', function () {

            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: '10000001'
            };

            $httpBackend.expectGET('/goal/info/10001234/10000001').respond(200, goalInfo);
            $httpBackend.expectGET(yolanda_external + '/start/'+ goalInfo.kmid).respond(200, {id: 'sessionId1'});
            $httpBackend.expectPOST(yolanda_external + '/sessionId1/query', {
                id: '10000001',
                sessionId: 'sessionId1',
                subject: 'Fred',
                relationship: 'speaks',
                object: null
            }).respond(400, {
                error: 'an error!'
            });

            scope.$broadcast('tryGoal', {goalid: '10001234'});
            $httpBackend.flush();

            expect(scope.display).to.equal('error');
            expect(scope.errorMessage).to.equal('Unfortunately Rainbird has been unable to process the ' +
                'goal against the current Knowledge Map.');
        });

        xit('should show error when start returns with 400', function () {

            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: '10000001'
            };

            $httpBackend.expectGET('/goal/info/10001234/10000001').respond(200, goalInfo);
            $httpBackend.expectGET(yolanda_external + '/start/'+ goalInfo.kmid).respond(400, {
                error: 'an error!'
            });

            scope.$broadcast('tryGoal', {goalid: '10001234'});
            $httpBackend.flush();

            expect(scope.display).to.equal('error');
            expect(scope.errorMessage).to.equal('Unfortunately Rainbird has been unable to process the ' +
                'goal against the current Knowledge Map.');
        });

        xit('should display second form question', function () {
            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true,
                {
                    'question': {
                        'subject': 'Fred',
                        'relationship': 'lives in',
                        'object': null,
                        'prompt': 'Where does Fred live?',
                        'plural': false,
                        'allowCF': true,
                        'allowUnknown': false,
                        type: 'Second Form Object',
                        concepts: ['England', 'France']
                    }
                }
            );

            expect(scope.display).to.equal('secondForm');
            expect(scope.response.concepts.length).to.equal(3);
            expect(scope.response.concepts[2]).to.equal(scope.otherOption);
        });

        xit('should not select an answer for a second form question where allowUnknown is true', function () {
            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true,
                {
                    'question': {
                        'subject': 'Fred',
                        'relationship': 'lives in',
                        'object': null,
                        'prompt': 'Where does Fred live?',
                        'plural': false,
                        'allowCF': true,
                        'allowUnknown': true,
                        type: 'Second Form Object',
                        concepts: ['England', 'France']
                    }
                }
            );

            expect(scope.display).to.equal('secondForm');
            expect(scope.answer.selection.length).to.equal(0);
        });


        xit('should not select an answer for a second form question where allowUnknown is false', function () {
            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true,
                {
                    'question': {
                        'subject': 'Fred',
                        'relationship': 'lives in',
                        'object': null,
                        'prompt': 'Where does Fred live?',
                        'plural': false,
                        'allowCF': true,
                        'allowUnknown': false,
                        type: 'Second Form Object',
                        concepts: ['England', 'France']
                    }
                }
            );

            expect(scope.display).to.equal('secondForm');
            expect(scope.answer.selection.length).to.equal(0);
        });

        xit('should display first form question', function () {
            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true,
                {
                    'question': {
                        'subject': 'Fred',
                        'relationship': 'lives in',
                        'object': 'England',
                        'prompt': 'question text?',
                        'plural': false,
                        'allowCF': true,
                        'allowUnknown': true,
                        'type': 'First Form'
                    }
                }
            );

            expect(scope.display).to.equal('firstForm');
            expect(scope.response.question.object).to.equal('England');
        });

        xit('should display formatted date in first form question', function () {
            var goalInfo = {
                description: 'What music do they like?',
                object: 'Music',
                subject: 'Person',
                relationship: 'likes',
                subjectInstance: 'user provided',
                goalText: '%S likes %O'
            };

            $httpBackend.expectGET('/goal/info/10001234/10000001').respond(200, goalInfo);

            scope.$broadcast('tryGoal', {goalid: '10001234'});
            $httpBackend.flush();

            scope.init.subjectInstance = 'Bob';
            $httpBackend.expectGET(yolanda_external + '/start/10000001').respond(200, {id: 'sessionId1'});
            $httpBackend.expectPOST(yolanda_external + '/sessionId1/query', {
                id: '10000001',
                sessionId: 'sessionId1',
                subject: 'Bob',
                relationship: 'likes'
            }).respond(200, {
                'question': {
                    'subject': 'Bob',
                    'object': 1268179200000,
                    'objectType': 'date',
                    'relationship': 'Person__Birthday',
                    'prompt': 'Does Bob Person__Birthday 1268179200000?',
                    'type': 'First Form',
                    'plural': false,
                    'allowCF': true,
                    'allowUnknown': false
                }
            });

            scope.startGoalContext();
            $httpBackend.flush();

            expect(scope.display).to.equal('firstForm');
            expect(scope.response.question.prompt).to.equal('Does Bob Person__Birthday 10th March, 2010?');
        });

        xit('should indicate no result could be found', function () {

            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };


            backendCalls(goalInfo, true, {result: []});

            expect(scope.display).to.equal('end');
        });

        xit('should display the result', function () {

            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true, {result: [{object:'Bernard', relationship: 'speaks',
                subject: 'Fred', certainty: '1'}]
            });

            expect(scope.display).to.equal('result');
        });

        xit('should start session with initial subject data', function () {

            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'user provided',
                goalText: 'You need %O',
                kmid: '10000001'
            };

            $httpBackend.expectGET('/goal/info/10001234/10000001').respond(200, goalInfo);
            scope.$broadcast('tryGoal', {goalid: '10001234'});
            $httpBackend.flush();

            expect(scope.display).to.equal('init data');
            scope.init.subjectInstance = 'Fred';
            scope.init.objectInstance = null;

            $httpBackend.expectGET(yolanda_external + '/start/'+ goalInfo.kmid).respond(200, {id: 'sessionId1'});
            $httpBackend.expectPOST(yolanda_external + '/sessionId1/query', {
                id: goalInfo.kmid,
                sessionId: 'sessionId1',
                subject: 'Fred',
                relationship: 'speaks',
                object: null
            }).respond(200, {});

            scope.startGoalContext();
            $httpBackend.flush();
        });

        xit('should start session with initial object data', function () {

            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: 'user provided',
                subjectInstance: null,
                goalText: 'You need %O',
                kmid: '10000001'
            };

            $httpBackend.expectGET('/goal/info/10001234/10000001').respond(200, goalInfo);
            scope.$broadcast('tryGoal', {goalid: '10001234'});
            $httpBackend.flush();

            expect(scope.display).to.equal('init data');
            scope.init.objectInstance = 'English';
            scope.init.subjectInstance = null;

            $httpBackend.expectGET(yolanda_external + '/start/'+ goalInfo.kmid).respond(200, {id: 'sessionId1'});
            $httpBackend.expectPOST(yolanda_external + '/sessionId1/query', {
                'id': '10000001',
                sessionId: 'sessionId1',
                subject: null,
                relationship: 'speaks',
                object: 'English'
            }).respond(200, {});

            scope.startGoalContext();
            $httpBackend.flush();
        });

        xit('should start session without initial data', function () {
            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: '10000001'
            };

            $httpBackend.expectGET('/goal/info/10001234/10000001').respond(200, goalInfo);
            $httpBackend.expectGET(yolanda_external + '/start/'+ goalInfo.kmid).respond(200, {id: 'sessionId1'});
            $httpBackend.expectPOST(yolanda_external + '/sessionId1/query', {
                'id': '10000001',
                sessionId: 'sessionId1',
                subject: goalInfo.subjectInstance,
                relationship: 'speaks',
                object: goalInfo.objectInstance
            }).respond(200, {});

            scope.$broadcast('tryGoal', {goalid: '10001234'});
            $httpBackend.flush();
        });

        xit('should respond to question', function () {
            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: '10000001'
            };

            backendCalls(goalInfo, true, {
                'question': {
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': 'England',
                    'prompt': 'question text?',
                    'plural': false,
                    'allowCF': true,
                    'allowUnknown': true,
                    'type': 'First Form'
                }
            });

            scope.answer = {selection: 'yes', cf: '50'};

            $httpBackend.expectPOST(yolanda_external + '/sessionId1/response', {
                'id': '10000001',
                'sessionId': 'sessionId1',
                'answers': [{
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': 'England',
                    'answer': scope.answer.selection,
                    'cf': scope.answer.cf
                }]
            }).respond(200, {
                'question': {
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': null,
                    'prompt': 'Where does Fred live?',
                    'plural': false,
                    'allowCF': true,
                    'allowUnknown': true,
                    'type': 'Second Form Object',
                    'concepts': ['England', 'France']
                }
            });

            scope.respond();
            $httpBackend.flush();

            expect(scope.display).to.equal('secondForm');
        });

        xit('should respond with Subject Second Form', function () {
            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true, {
                'question': {
                    'subject': null,
                    'relationship': 'lives in',
                    'object': 'England',
                    'prompt': 'question text?',
                    'plural': false,
                    'allowCF': true,
                    'allowUnknown': true,
                    'type': 'Second Form Subject',
                    'concepts': [{value: 'Fred'}, {value: 'Bob'}]
                }
            });

            scope.answer = {selection: 'Fred', cf: '70'};

            $httpBackend.expectPOST(yolanda_external + '/sessionId1/response', {
                'id': '10000001',
                'sessionId': 'sessionId1',
                'answers': [{
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': 'England',
                    'cf': scope.answer.cf
                }]
            }).respond(200, {
                result: []
            });

            scope.respond();
            $httpBackend.flush();
        });

        xit('should respond using "Other" value' , function () {

            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: '10000001'
            };

            backendCalls(goalInfo, true, {
                'question': {
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': null,
                    'prompt': 'question text?',
                    'plural': false,
                    'allowCF': true,
                    'allowUnknown': true,
                    'type': 'Second Form Object',
                    'concepts': [{value: 'England'}, {value: 'France'}]
                }
            });

            scope.answer = {selection: scope.otherOption.value, cf: '50', otherValue: 'otherOne'};

            $httpBackend.expectPOST(yolanda_external + '/sessionId1/response', {
                'id': '10000001',
                sessionId: 'sessionId1',
                'answers': [{
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': 'otherOne',
                    'cf': scope.answer.cf
                }]
            }).respond(200, {
                'result': [{
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': 'England',
                    'cf': scope.answer.cf}
                ]
            });
            scope.respond();
            $httpBackend.flush();

            expect(scope.display).to.equal('result');
        });

        xit('should show error when goal response returns with 400', function () {


            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true, {
                'question': {
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': null,
                    'prompt': 'question text?',
                    'plural': false,
                    'allowCF': true,
                    'allowUnknown': true,
                    'type': 'Second Form Object',
                    'concepts': [{value: 'England'}, {value: 'France'}]
                }
            });

            scope.answer = {selection: scope.otherOption.value, cf: '50', otherValue: 'otherOne'};

            $httpBackend.expectPOST(yolanda_external + '/sessionId1/response', {
                'id': '10000001',
                'sessionId': 'sessionId1',
                'answers': [{
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': 'otherOne',
                    'cf': scope.answer.cf
                }]
            }).respond(400, {
                error: 'an error!', message: 'custom message'
            });
            scope.respond();
            $httpBackend.flush();

            expect(scope.display).to.equal('error');
            expect(scope.errorMessage).to.equal('custom message');
        });

        xit('should show error when goal response returns with 400 using default message', function () {

            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true, {
                'question': {
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': null,
                    'prompt': 'question text?',
                    'plural': false,
                    'allowCF': true,
                    'allowUnknown': true,
                    'type': 'Second Form Object',
                    'concepts': [{value: 'England'}, {value: 'France'}]
                }
            });

            scope.answer = {selection: scope.otherOption.value, cf: '50', otherValue: 'otherOne'};

            $httpBackend.expectPOST(yolanda_external + '/sessionId1/response', {
                'id': '10000001',
                'sessionId': 'sessionId1',
                'answers': [{
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': 'otherOne',
                    'cf': scope.answer.cf
                }]
            }).respond(400, {
                error: 'an error!'
            });
            scope.respond();
            $httpBackend.flush();

            expect(scope.display).to.equal('error');
            expect(scope.errorMessage).to.equal('Unfortunately Rainbird has been unable to process the ' +
                'goal against the current Knowledge Map.');
        });

        xit('should accept and process multiple selections when answering a question', function () {

            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true, {
                'question': {
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': null,
                    'prompt': 'question text?',
                    'plural': true,
                    'allowCF': true,
                    'allowUnknown': true,
                    'type': 'Second Form Object',
                    'concepts': [{value: 'England'}, {value: 'France'}]
                }
            });

            scope.answer = { selection: ['England', 'France'], cf: '50'};

            $httpBackend.expectPOST(yolanda_external + '/sessionId1/response', {
                'id': '10000001',
                'sessionId': 'sessionId1',
                'answers': [{
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': 'England',
                    'cf': '50'
                },
                {
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': 'France',
                    'cf': '50'
                }]
            }).respond(200, {
                'result': [
                    {
                        'subject': 'Fred',
                        'relationship': 'lives in',
                        'object': 'England',
                        'cf': scope.answer.cf
                    },
                    {
                        'subject': 'Fred',
                        'relationship': 'lives in',
                        'object': 'France',
                        'cf': scope.answer.cf
                    }
                ]
            });
            scope.respond();
            $httpBackend.flush();

            expect(scope.display).to.equal('result');
        });

        xit('should accept and process number answer (object)', function () {

            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true, {
                'question': {
                    'subject': 'Fred',
                    'relationship': 'has age',
                    'object': null,
                    'prompt': 'question text?',
                    'plural': false,
                    'allowCF': true,
                    'allowUnknown': true,
                    'type': 'Second Form Object',
                    'dataType': 'number'
                }
            });

            scope.answer = { value: 89, cf: 50};

            $httpBackend.expectPOST(yolanda_external + '/sessionId1/response', {
                'id': '10000001',
                'sessionId': 'sessionId1',
                'answers': [{
                    'subject': 'Fred',
                    'relationship': 'has age',
                    'object': 89,
                    'cf': 50
                }]
            }).respond(200, {
                'result': [
                    {
                        'subject': 'Fred',
                        'relationship': 'is a',
                        'object': 'pensioner',
                        'cf': scope.answer.cf
                    }
                ]
            });
            scope.respond();
            $httpBackend.flush();

            expect(scope.display).to.equal('result');
        });

        xit('should accept and process plural number answer (object)', function () {
            var goalInfo = {
                description: 'should book holiday days',
                object: 'holiday day',
                subject: 'Person',
                relationship: 'should book holiday days',
                objectInstance: null,
                subjectInstance: 'Steve',
                goalText: '%O',
                kmid: 'kmid-10001234'
            };

            $httpBackend.expectGET('/goal/info/10001234/10000001').respond(200, goalInfo);
            $httpBackend.expectGET(yolanda_external + '/start/10000001').respond(200, {id: 'sessionId1'});
            $httpBackend.expectPOST(yolanda_external + '/sessionId1/query', {
                id: '10000001',
                sessionId: 'sessionId1',
                object: null,
                relationship: 'should book holiday days',
                subject: 'Steve'
            }).respond(200, {
                'question': {
                    'subject': 'Steve',
                    'relationship': 'has dentist appointment type',
                    'object': null,
                    'prompt': 'What dentist appointment types does Steve have?',
                    'plural': true,
                    'allowCF': true,
                    'allowUnknown': true,
                    'type': 'Second Form Object',
                    'dataType': 'number'
                }
            });

            scope.$broadcast('tryGoal', {goalid: '10001234'});
            $httpBackend.flush();

            scope.answer = { selection:[ 2, 3], cf: '80' };

            $httpBackend.expectPOST(yolanda_external + '/sessionId1/response', {
                'id': '10000001',
                'sessionId': 'sessionId1',
                'answers': [
                    {
                        'subject': 'Steve',
                        'relationship': 'has dentist appointment type',
                        'object': 2,
                        'cf': '80'
                    },
                    {
                        'subject': 'Steve',
                        'relationship': 'has dentist appointment type',
                        'object': 3,
                        'cf': '80'
                    }]
            }).respond(200, {
                'result': [
                    {
                        'subject': 'result display',
                        'relationship': 'not',
                        'object': 'tested',
                        'cf': scope.answer.cf
                    }
                ]
            });
            scope.respond();
            $httpBackend.flush();

            expect(scope.display).to.equal('result');
        });

        xit('should accept and process date answer (object)', function () {
            var goalInfo = {
                description: 'Description of goal.',
                object: 'a date',
                subject: 'Person',
                relationship: 'born on',
                objectInstance: null,
                subjectInstance: 'Lawrie',
                goalText: 'Person born on %O',
                kmid: 'kmid-10001234'
            };

            $httpBackend.expectGET('/goal/info/10001234/10000001').respond(200, goalInfo);
            $httpBackend.expectGET(yolanda_external + '/start/10000001').respond(200, {id: 'sessionId1'});
            $httpBackend.expectPOST(yolanda_external + '/sessionId1/query', {
                id: '10000001',
                sessionId: 'sessionId1',
                object: null,
                relationship: 'born on',
                subject: 'Lawrie'
            }).respond(200, {
                'question': {
                    'subject': 'Lawrie',
                    'relationship': 'born on',
                    'object': null,
                    'prompt': 'question text?',
                    'plural': false,
                    'allowCF': true,
                    'allowUnknown': true,
                    'type': 'Second Form Object',
                    'dataType': 'date'
                }
            });

            scope.$broadcast('tryGoal', {goalid: '10001234'});
            $httpBackend.flush();

            scope.answer = { value: new Date('1989-03-18'), cf: 80};

            $httpBackend.expectPOST(yolanda_external + '/sessionId1/response', {
                'id': '10000001',
                'sessionId': 'sessionId1',
                'answers': [{
                    'subject': 'Lawrie',
                    'relationship': 'born on',
                    'object': 606182400000,
                    'cf': 80
                }]
            }).respond(200, {
                'result': [
                    {
                        'subject': 'result display',
                        'relationship': 'not',
                        'object': 'tested',
                        'cf': scope.answer.cf
                    }
                ]
            });
            scope.respond();
            $httpBackend.flush();

            expect(scope.display).to.equal('result');
        });

        xit('should accept and process plural date answer (object)', function () {
            var goalInfo = {
                description: 'different between dates',
                object: 'a date',
                subject: 'Training Course',
                relationship: 'tutorial on',
                objectInstance: null,
                subjectInstance: 'MySQL',
                goalText: '%O',
                kmid: 'kmid-10001234'
            };

            $httpBackend.expectGET('/goal/info/10001234/10000001').respond(200, goalInfo);
            $httpBackend.expectGET(yolanda_external + '/start/10000001').respond(200, {id: 'sessionId1'});
            $httpBackend.expectPOST(yolanda_external + '/sessionId1/query', {
                id: '10000001',
                sessionId: 'sessionId1',
                object: null,
                relationship: 'tutorial on',
                subject: 'MySQL'
            }).respond(200, {
                'question': {
                    'subject': 'MySQL',
                    'relationship': 'tutorial on',
                    'object': null,
                    'prompt': 'question text?',
                    'plural': true,
                    'allowCF': true,
                    'allowUnknown': true,
                    'type': 'Second Form Object',
                    'dataType': 'date'
                }
            });

            scope.$broadcast('tryGoal', {goalid: '10001234'});
            $httpBackend.flush();

            scope.answer = { selection:[ new Date('1984-01-01'), new Date('1985-01-01')], cf: '80' };

            $httpBackend.expectPOST(yolanda_external + '/sessionId1/response', {
                'id': '10000001',
                'sessionId': 'sessionId1',
                'answers': [
                    {
                        'subject': 'MySQL',
                        'relationship': 'tutorial on',
                        'object': 441763200000,
                        'cf': '80'
                    },
                    {
                        'subject': 'MySQL',
                        'relationship': 'tutorial on',
                        'object': 473385600000,
                        'cf': '80'
                    }]
            }).respond(200, {
                'result': [
                    {
                        'subject': 'result display',
                        'relationship': 'not',
                        'object': 'tested',
                        'cf': scope.answer.cf
                    }
                ]
            });
            scope.respond();
            $httpBackend.flush();

            expect(scope.display).to.equal('result');
        });

        xit('should not contain Unknown option second form', function () {

            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true, {
                'question': {
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': null,
                    'prompt': 'question text?',
                    'plural': false,
                    'allowCF': true,
                    'allowUnknown': false,
                    'type': 'Second Form Object',
                    'concepts': ['England', 'France']
                }
            });

            // TODO RB-621 will probably change this.
            expect(scope.response.concepts.length).to.equal(3);
            expect(scope.response.concepts[2]).to.equal(scope.otherOption);
        });

        xit('should not contain other option second form', function () {

            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true, {
                'question': {
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': null,
                    'prompt': 'question text?',
                    'plural': false,
                    'allowCF': true,
                    'allowUnknown': false,
                    'canAdd': false,
                    'type': 'Second Form Object',
                    'concepts': ['England', 'France']
                }
            });

            expect(scope.response.concepts.length).to.equal(2);
        });

        xit('should allowUnknown option first form', function () {

            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true, {
                'question': {
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': 'England',
                    'prompt': 'question text?',
                    'plural': false,
                    'allowCF': true,
                    'allowUnknown': true,
                    'type': 'First Form',
                    'objectMetadata': {}
                }
            });

            expect(scope.response.question.allowUnknown).to.be.true;
        });

        xit('should allowUnknown false option first form', function () {
            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true, {
                'question': {
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': 'England',
                    'prompt': 'question text?',
                    'plural': false,
                    'allowCF': true,
                    'allowUnknown': false,
                    'type': 'First Form',
                    'objectMetadata': {}
                }
            });

            expect(scope.response.question.allowUnknown).to.be.false;
        });

        it('Agent should use GetSessionID to get a sessionId on goal start', function () {
            var spyOnConfigAPI = sinon.spy(ConfigAPI, 'getSessionId');
            var spyOnGoalAPI = sinon.spy(GoalAPI, 'startGoal');
            location.url('/agent/10000001');

            scope.startGoalContext();

            spyOnConfigAPI.should.have.been.calledOnce;
            spyOnGoalAPI.should.not.have.been.called;
        });

        xit('Try/goal should use GoalAPI to get sessionId on goal start', function () {
            var spyOnConfigAPI = sinon.spy(ConfigAPI, 'config');
            var spyOnGoalAPI = sinon.spy(GoalAPI, 'startGoal');
            location.url('/#/edit/10000001/goal');

            scope.startGoalContext();

            spyOnConfigAPI.should.not.have.been.called;
            spyOnGoalAPI.should.have.been.calledOnce;
        });

        xit('First form question returned with no metadata', function () {
            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true, {
                'question': {
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': 'England',
                    'prompt': 'question text?',
                    'plural': false,
                    'allowCF': true,
                    'allowUnknown': false,
                    'type': 'First Form',
                    'objectMetadata': {}
                }
            });

            expect(scope.response.question.objectMetadata).to.be.empty;
        });

        xit('First form question returned with markdown metadata', function () {
            var goalInfo = {
                description: 'Description of goal.',
                object: 'Language',
                subject: 'Person',
                relationship: 'speaks',
                objectInstance: null,
                subjectInstance: 'Fred',
                goalText: 'You need %O',
                kmid: 'kmid-10001234'
            };

            backendCalls(goalInfo, true, {
                'question': {
                    'subject': 'Fred',
                    'relationship': 'lives in',
                    'object': 'England',
                    'prompt': 'question text?',
                    'plural': false,
                    'allowCF': true,
                    'allowUnknown': false,
                    'type': 'First Form',
                    'objectMetadata': {
                        'en': [
                            {
                                'dataType': 'md',
                                'data': '# This is an h1 tag\n## This is an h2 tag.'
                            }
                        ]
                    }
                }
            });

            expect(scope.response.question.objectMetadata).to.not.be.empty;
            expect(scope.response.question.objectMetadata.en[0]).to.deep.equal({'dataType': 'md', 'data': '# This is an h1 tag\n## This is an h2 tag.'});
        });

        xit('should display a date object in an answer in the format provided by the server', function () {
            var goalInfo = {
                description: 'When was the system started?',
                subject: 'System',
                subjectInstance: 'theSystem',
                relationship: 'startedOn',
                goalText: 'The system was started on %O',
                kmid: 'kmid-10001234'
            };

            $httpBackend.expectGET('/goal/info/10001234/10000001').respond(200, goalInfo);
            $httpBackend.expectGET(yolanda_external + '/start/10000001').respond(200, {id: 'sessionId1'});
            $httpBackend.expectPOST(yolanda_external + '/sessionId1/query', {
                id: '10000001',
                sessionId: 'sessionId1',
                relationship: 'startedOn',
                subject: 'theSystem'
            }).respond(200, {
                'result': [
                    {
                        'relationshipType': 'startedOn',
                        'certainty': 100,
                        'conditions': [],
                        'objectType': 'date',
                        'subject': 'theSystem',
                        'object': '7th June, 2016',
                        'objectValue': 1465257600000,
                        'objectMetadata': {}
                    }
                ]
            });

            scope.$broadcast('tryGoal', {goalid: '10001234'});
            $httpBackend.flush();

            expect(scope.goalResults[0].text).to.equal('The system was started on 7th June, 2016');
        });

        it('processResponse() should post message to parent window', function () {
            var spyOnPostMessage= sinon.spy(scope, 'postMessage');

            var response = { test:'this is a test' };
            scope.processResponse(response);

            expect(spyOnPostMessage.getCall(0).args[0]).to.equal(response);
            expect(spyOnPostMessage.callCount).to.equal(1);
        });

        it('queryGoal() should post message to parent window', function () {
            var spyOnPostMessage= sinon.spy(scope, 'postMessage');
            scope.init = {subjectInstance: 'a subject'};
            scope.goalInfo = {relationship: 'a rel', goalText:'some text', subjectInstance: 'user provided', objectInstance: 'an object'};

            scope.queryGoal();

            expect(spyOnPostMessage.callCount).to.equal(1);
            expect(spyOnPostMessage.getCall(0).args[0].id).to.equal('10000001');
            expect(spyOnPostMessage.getCall(0).args[0].subject).to.equal('a subject');
            expect(spyOnPostMessage.getCall(0).args[0].object).to.equal('an object');
            expect(spyOnPostMessage.getCall(0).args[0].relationship).to.equal('a rel');
        });

        it('queryGoal() should send full triple', function () { // RB-983
            var spyOnPostMessage= sinon.spy(GoalAPI, 'queryGoal');
            scope.init = {};
            scope.goalInfo = {relationship: 'a rel', goalText:'some text', subjectInstance: 'a subject', objectInstance: 'an object'};

            scope.queryGoal();

            expect(spyOnPostMessage.callCount).to.equal(1);
            expect(spyOnPostMessage.getCall(0).args[0].id).to.equal('10000001');
            expect(spyOnPostMessage.getCall(0).args[0].subject).to.equal('a subject');
            expect(spyOnPostMessage.getCall(0).args[0].object).to.equal('an object');
            expect(spyOnPostMessage.getCall(0).args[0].relationship).to.equal('a rel');
        });

        it('queryGoal() should send object side if subject is user provided', function () { // RB-983
            var spyOnPostMessage= sinon.spy(GoalAPI, 'queryGoal');
            scope.init = {subjectInstance: 'a users input'};
            scope.goalInfo = {relationship: 'a rel', goalText:'some text', subjectInstance: 'user provided', objectInstance: 'an object'};

            scope.queryGoal();

            expect(spyOnPostMessage.callCount).to.equal(1);
            expect(spyOnPostMessage.getCall(0).args[0].id).to.equal('10000001');
            expect(spyOnPostMessage.getCall(0).args[0].subject).to.equal('a users input');
            expect(spyOnPostMessage.getCall(0).args[0].object).to.equal('an object');
            expect(spyOnPostMessage.getCall(0).args[0].relationship).to.equal('a rel');
        });

        it('queryGoal() should send subject side if object is user provided', function () { // RB-983
            var spyOnPostMessage= sinon.spy(GoalAPI, 'queryGoal');
            scope.init = {objectInstance: 'a users input'};
            scope.goalInfo = {relationship: 'a rel', goalText:'some text', subjectInstance: 'a subject', objectInstance: 'user provided'};

            scope.queryGoal();

            expect(spyOnPostMessage.callCount).to.equal(1);
            expect(spyOnPostMessage.getCall(0).args[0].id).to.equal('10000001');
            expect(spyOnPostMessage.getCall(0).args[0].subject).to.equal('a subject');
            expect(spyOnPostMessage.getCall(0).args[0].object).to.equal('a users input');
            expect(spyOnPostMessage.getCall(0).args[0].relationship).to.equal('a rel');
        });

        it('respond() should post message to parent window', function () {
            var spyOnPostMessage= sinon.spy(scope, 'postMessage');
            var response = { test:'this is a test' };
            scope.response = {
                question: {
                    type: 'First Form',
                    dateType: ''
                }
            };
            scope.answer = {
                selection: 'my answer'
            };

            scope.respond(response);

            expect(spyOnPostMessage.callCount).to.equal(1);
            expect(spyOnPostMessage.getCall(0).args[0].answers.length).to.equal(1);
            expect(spyOnPostMessage.getCall(0).args[0].answers[0].answer).to.equal('my answer');
        });

        xit('done() should post message to parent window', function () {
            var spyOnPostMessage= sinon.spy(scope, 'postMessage');

            scope.done();

            expect(spyOnPostMessage.callCount).to.equal(1);
            expect(spyOnPostMessage.getCall(0).args[0]).to.equal('Done');
        });

        it('exit() should post message to parent window', function () {
            var spyOnPostMessage= sinon.spy(scope, 'postMessage');
            state.go = function() {};

            scope.exit();

            expect(spyOnPostMessage.callCount).to.equal(1);
            expect(spyOnPostMessage.getCall(0).args[0]).to.equal('Reset');
        });

        describe('Continue button', function(){

            describe('displayContinueOrSkip', function(){

                it('Should return \'Continue\' when allowUnknown is false', function(){

                    scope.response = {
                        question: {
                            allowUnknown: false
                        }
                    };

                    expect(scope.displayContinueOrSkip()).to.equal('Continue');
                });

                it('Should return \'Skip\' when allowUnknown is true', function(){

                    scope.response = {
                        question: {
                            allowUnknown: true
                        }
                    };

                    scope.answer = {};

                    expect(scope.displayContinueOrSkip()).to.equal('Skip');
                });

                it('Should return \'Continue\' when allowUnknown is true but an answer is provided', function(){

                    scope.response = {
                        question: {
                            allowUnknown: true
                        }
                    };

                    scope.answer = { value: 'answer' };

                    expect(scope.displayContinueOrSkip()).to.equal('Continue');
                });

                it('Should return \'Continue\' when allowUnknown is true but an answer selection is provided', function(){

                    scope.response = {
                        question: {
                            allowUnknown: true
                        }
                    };

                    scope.answer = { selection: ['answer'] };

                    expect(scope.displayContinueOrSkip()).to.equal('Continue');
                });

                it('Should return \'Continue\' when allowUnknown is true but an answer of 0 is provided', function(){

                    scope.response = {
                        question: {
                            allowUnknown: true
                        }
                    };

                    scope.answer = { value: 0 };

                    expect(scope.displayContinueOrSkip()).to.equal('Continue');
                });

                it('Should return \'Continue\' when allowUnknown is true but an answer above 0 is provided', function(){

                    scope.response = {
                        question: {
                            allowUnknown: true
                        }
                    };

                    scope.answer = { value: 5 };

                    expect(scope.displayContinueOrSkip()).to.equal('Continue');
                });

                it('Should return \'Continue\' when allowUnknown is true but an answer of false is provided',
                    function(){

                        scope.response = {
                            question: {
                                allowUnknown: true
                            }
                        };

                        scope.answer = { value: false };

                        expect(scope.displayContinueOrSkip()).to.equal('Continue');
                    });

                it('Should return \'Continue\' when allowUnknown is true but an answer of true is provided', function(){

                    scope.response = {
                        question: {
                            allowUnknown: true
                        }
                    };

                    scope.answer = { value: true };

                    expect(scope.displayContinueOrSkip()).to.equal('Continue');
                });

            });

            describe('disableContinue', function(){

                it('Should return false when allowUnknown is true', function(){

                    scope.response = {
                        question: {
                            allowUnknown: true
                        }
                    };

                    expect(scope.disableContinue()).to.equal(false);
                });

                it('Should return false when allowUnknown is false and an answer is provided', function(){

                    scope.response = {
                        question: {
                            allowUnknown: false
                        }
                    };

                    scope.answer = { value: 'answer' };

                    expect(scope.disableContinue()).to.equal(false);
                });

                it('Should return false when allowUnknown is false and an answer of 0 is provided', function(){

                    scope.response = {
                        question: {
                            allowUnknown: false
                        }
                    };

                    scope.answer = { value: 0 };

                    expect(scope.disableContinue()).to.equal(false);
                });

                it('Should return false when allowUnknown is false and an answer above 0 is provided', function(){

                    scope.response = {
                        question: {
                            allowUnknown: false
                        }
                    };

                    scope.answer = { value: 5 };

                    expect(scope.disableContinue()).to.equal(false);
                });

                it('Should return false when allowUnknown is false and an answer of false is provided', function(){

                    scope.response = {
                        question: {
                            allowUnknown: false
                        }
                    };

                    scope.answer = { value: false };

                    expect(scope.disableContinue()).to.equal(false);
                });

                it('Should return false when allowUnknown is false and an answer of true is provided', function(){

                    scope.response = {
                        question: {
                            allowUnknown: false
                        }
                    };

                    scope.answer = { value: true };

                    expect(scope.disableContinue()).to.equal(false);
                });

                it('Should return false when allowUnknown is false and an answer selection is provided', function(){

                    scope.response = {
                        question: {
                            allowUnknown: false,
                            knownAnswers: []
                        }
                    };

                    scope.answer = { selection: ['answer'] };

                    expect(scope.disableContinue()).to.equal(false);
                });

                it('Should return true when allowUnknown is false and no answers are provided', function(){

                    scope.response = {
                        question: {
                            allowUnknown: false,
                            knownAnswers: []
                        }
                    };

                    scope.answer = {};

                    expect(scope.disableContinue()).to.equal(true);
                });

                it('Should return true when allowUnknown is false and an empty answer selection is provided',
                    function(){

                        scope.response = {
                            question: {
                                allowUnknown: false,
                                knownAnswers: []
                            }
                        };

                        scope.answer = { selection: [''] };

                        expect(scope.disableContinue()).to.equal(true);
                    });

                it('Should return false when allowUnknown is false and an answer selection containing 0 is provided',
                    function(){

                        scope.response = {
                            question: {
                                allowUnknown: false,
                                knownAnswers: []
                            }
                        };

                        scope.answer = { selection: [0] };

                        expect(scope.disableContinue()).to.equal(false);
                    });

                it('Should return false when allowUnknown is false and an answer selection containing a number above' +
                    ' 0 is provided',
                    function(){

                        scope.response = {
                            question: {
                                allowUnknown: false,
                                knownAnswers: []
                            }
                        };

                        scope.answer = { selection: [4] };

                        expect(scope.disableContinue()).to.equal(false);
                    });

                it('Should return false when allowUnknown is false and an answer selection containing false is provided',
                    function(){

                        scope.response = {
                            question: {
                                allowUnknown: false,
                                knownAnswers: []
                            }
                        };

                        scope.answer = { selection: [false] };

                        expect(scope.disableContinue()).to.equal(false);
                    });

                it('Should return false when allowUnknown is false and an answer selection containing true is provided',
                    function(){

                        scope.response = {
                            question: {
                                allowUnknown: false,
                                knownAnswers: []
                            }
                        };

                        scope.answer = { selection: [true] };

                        expect(scope.disableContinue()).to.equal(false);
                    });

                it('Should return false when allowUnknown is false and an empty answer selection is provided but there are known answers',
                    function(){

                        scope.response = {
                            question: {
                                allowUnknown: false,
                                knownAnswers: ['a known answer']
                            }
                        };

                        scope.answer = { selection: [''] };

                        expect(scope.disableContinue()).to.equal(false);
                    });

                it('Should return false when allowUnknown is false and answer selected with known answers',
                    function(){

                        scope.response = {
                            question: {
                                allowUnknown: false,
                                knownAnswers: ['a known answer']
                            }
                        };

                        scope.answer = { selection: ['an answer'] };

                        expect(scope.disableContinue()).to.equal(false);
                    });

            });

        });
    });
});
