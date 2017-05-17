describe('Agent Goal List Controller', function() {
    var scope;
    /*eslint-disable no-unused-vars*/
    var ctrl;
    /*eslint-enable no-unused-vars*/
    var state;

    beforeEach(module('/sharedAgent/goalList/agentGoalList.html'));
    beforeEach(module('ui.router'));
    beforeEach(module('rbAgent'));
    beforeEach(module(function($urlRouterProvider) {
        $urlRouterProvider.deferIntercept();
    }));
    beforeEach(module(function ($urlRouterProvider) {
        $urlRouterProvider.otherwise(function(){return false;});
    }));

    describe('Test Agent Goal List Controller', function() {

        beforeEach(inject(function($controller, $state, $rootScope) {
            scope = $rootScope.$new();
            scope.id = 'Test1';
            scope.api = 'https://api.rainbird.ai';
            ctrl = $controller('AgentGoalListController', {
                $scope: scope,
                config:
                {
                    'sessionId': '5c26e8cc-03ff-4037-a0f3-67eb76a146de',
                    'kbId': '21eee485-3e2f-4136-a5e7-a8627d960dcf',
                    'kbName': 'You may also like',
                    'kbUser': 'willlocal',
                    'agentName': 'Testing',
                    'agentDescription': 'fhjfkkggk',
                    'showAlias': true,
                    'goals': [
                        {
                            'description': 'Is customer enabled?',
                            'text': 'The account belong to %S has status: %O',
                            'relIsGoal': false,
                            'object': 'Customer',
                            'rel': 'Customer__Account Enabled',
                            'subject': 'Customer',
                            'subjectInstance': 'user provided',
                            '_id': '45f7a425-300d-454e-a453-2657a9f1c0f3'
                        },
                        {
                            'description': 'Which products may you also like?',
                            'text': '%S may also like %O',
                            'relIsGoal': false,
                            'object': 'Product',
                            'rel': 'may like',
                            'subject': 'Customer',
                            'subjectInstance': 'user provided',
                            '_id': '0352ee4d-b1ac-4fde-ab2f-55f4f645bd0e'
                        }
                    ]
                },
                $state: $state
            });
            state = $state;
        }));

        it('should have list of Goals', function() {
            scope.config.goals.should.have.length(2);
            expect(scope.config.goals[0]).to.eql(
                {
                    'description': 'Is customer enabled?',
                    'text': 'The account belong to %S has status: %O',
                    'relIsGoal': false,
                    'object': 'Customer',
                    'rel': 'Customer__Account Enabled',
                    'subject': 'Customer',
                    'subjectInstance': 'user provided',
                    '_id': '45f7a425-300d-454e-a453-2657a9f1c0f3'
                });
            expect(scope.config.goals[1]).to.eql(
                {
                    'description': 'Which products may you also like?',
                    'text': '%S may also like %O',
                    'relIsGoal': false,
                    'object': 'Product',
                    'rel': 'may like',
                    'subject': 'Customer',
                    'subjectInstance': 'user provided',
                    '_id': '0352ee4d-b1ac-4fde-ab2f-55f4f645bd0e'
                });
        });

        it('should call state.go to direct agent to run the selected goal', function() {
            expect(scope.startGoal).to.be.a('Function');

            var stub = sinon.stub(state, 'go');
            scope.startGoal(scope.config.goals[1]);
            stub.should.have.been.calledWith('startGoal', { goalInfo: scope.config.goals[1], id: scope.id });
        });
    });
});
