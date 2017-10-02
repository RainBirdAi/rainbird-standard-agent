// Karma configuration
// Generated on Mon Nov 03 2014 14:08:21 GMT+0000 (GMT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai-jquery', 'chai', 'jquery-1.9.1'],


    // list of files / patterns to load in the browser
    files: [
        'components/angular/angular.js',
        'components/angular-mocks/angular-mocks.js',
        'components/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'components/ui-route/release/angular-ui-router.min.js',
        'components/angular-resource/angular-resource.min.js',
        'components/angular-sanitize/angular-sanitize.min.js',
        'components/showdown/dist/showdown.min.js',
        'components/ng-showdown/dist/ng-showdown.min.js',
        'node_modules/chai/chai.js',
        'node_modules/sinon/pkg/sinon.js',
        'node_modules/chai-jquery/chai-jquery.js',
        'node_modules/karma-sinon-chai/node_modules/sinon-chai/lib/sinon-chai.js',
        'source/tryGoal/*app.js',
        'source/agent.js',
        'source/**/*.js',
        'source/goalList/agentGoalList.html',
        'source/**/*.html'
    ],

    //// list of files to exclude
    //exclude: [
    //],

    proxies:  {
        //'/sharedAgent/tryGoal/component/tryGoalModal.html': '/dist/tryGoal/component/tryGoalModal.html'
    },

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        'source/**/!(*spec|*Spec).js': ['coverage'],
        '**/*.html': ['ng-html2js']
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'source'
    },

    // optionally, configure the reporter
    coverageReporter: {
      reporters: [
        {type: 'html', dir: 'public/coverage'},
        {type: 'json', dir: 'public/coverage'}
      ]
    },

    // test results reporter to use
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'coverage'],

    // reporter options
    mochaReporter: {
        output: 'autowatch'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],

    plugins:[
        'karma-mocha',
        'karma-phantomjs-launcher',
        'karma-chai',
        'karma-chai-jquery',
        'karma-sinon',
        'karma-sinon-chai',
        'karma-coverage',
        'karma-chrome-launcher',
        'karma-mocha-reporter',
        'karma-jquery',
        'karma-ng-html2js-preprocessor'
    ],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
