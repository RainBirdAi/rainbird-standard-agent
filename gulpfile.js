const { src, dest, watch } = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var less = require('gulp-less');
//var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var karma = require('karma').server;
var del = require('del');
var ngAnnotate = require('gulp-ng-annotate');
const runSequence = require('gulp4-run-sequence');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

var build = {dev:false,unitTests:true, testCoverage:true};

var paths = {
    scripts: [
        'source/tryGoal/tryGoal_service.js',
        'source/tryGoal/tryGoal_app.js',
        'source/agent.js',
        'source/tryGoal/component/tryGoalController.js',
        'source/goalList/**/*.js',
        'source/mainController.js',
        'source/directives/**/*.js',
        '!**/*spec.js',
        '!**/*Spec.js'],
    less: ['source/styles/agent.less'],
    images: 'img/**/*'
};

// Delete content of dist folder to ensure a clean build
function clean() {
    return del(['dist/**.*']);
}

// Run tests once and exit use for running build
function test(done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true,
        browsers: ['PhantomJS']
    }, function(result) {
        if (result) {
            build.unitTests = false;
            done(result);
        } else {
            build.unitTests = true;
            done();
        }
    });
}

// Run tests headless
function testHeadless(done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true,
        browsers: ['PhantomJS']
    }, function(result) {
        if (result) {
            build.unitTests = false;
            done(result);
        } else {
            build.unitTests = true;
            done();
        }
    });
}

function eslint() {
    var eslintRun = src(['source/**/*.js', 'test/**/*.js', 'gulpfile.js'])
               .pipe(eslint())
               .pipe(eslint.format());

    if (!build.dev) {
        return eslintRun.pipe(eslint.failAfterError());
    } else {
        return eslintRun;
    }
}

//Angular Agent Compilation
function minifyAgentJS() {
    return src(paths.scripts)
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(concat('agent.min.js'))
        .pipe(dest('dist'));
}

function agentBuild(done) {
    return runSequence(['minifyAgentJS', 'agentStyles'], done);
}

function agentStyles() {
    return src('source/styles/agent.less')
        .pipe(less({compress: true}))
        .on('error', errorHandler.bind(this, 'LESS Compiler Error:'))
        //.pipe(autoprefixer())
        .pipe(rename('agent.min.css'))
        .pipe(dest('dist'));
}

var errorHandler = function(title, e) {
    gutil.log(title, e.message);
};

function copyHtml(done) {
    src(
        [
            'source/tryGoal/component/tryGoalModal.html', //remove when we embed agents - refactor out references to shared
            'source/tryGoal/component/tryGoalAgent.html'
        ])
        .pipe(dest('dist/tryGoal/component'));
    src(
        [
            'source/tryGoal/component/shared/tryGoalBody.html',
            'source/tryGoal/component/shared/apiLog.html',
            'source/tryGoal/component/shared/queryContext.html',
        ])
        .pipe(dest('dist/tryGoal/component/shared'));
    src(['source/goalList/agentGoalList.html'])
        .pipe(dest('dist/goalList'));
    src(['source/main.html'])
        .pipe(dest('dist'));
	src(['source/angular-semantic-ui.min.js'])
            .pipe(dest('dist'));
    done();
}

// Clear dist folder, check quality (jshint, unit tests pass, test coverage), build minified app.
function standardAgentBuild(done) {
    return runSequence(['clean'],
        ['standardAgentLess'],
        ['agentBuild'],
        ['copyHtml'],
        //['test'],
        ['minifyAgentJS'],
        function(result) {
            if (!result) {
                gutil.log(gutil.colors.green('Build successful!'));
            } else {
                gutil.log(gutil.colors.red('Build failed!'));
            }
            done(result);
        });
}

//BrowserSync
function buildAndReload(done) {
    return runSequence(
        ['build'], function (done) {
            browserSync.reload();
            done();}
    )
}

function watchAndRefresh(done) {
    return runSequence(
        ['build'], function (done) {
            // Serve files from the root of this project
            browserSync.init({
                proxy: "localhost:3051",
                port: 8080,
                notify: true
            });
        
            watch(['source/**/*.js', 'source/**/*.html'], ['build-and-reload']);
            done();
        });
}

function watchLess() {
	watch('source/styles/**/*.less', ['standardAgentLess']);
	watch('dist/*.css').on('change', function() {});
}

function standardAgentLess() {
	return src(paths.less)
			.pipe(less({compress: true}))
			.pipe(rename({
				suffix: '.min'
			}))
			.pipe(dest('dist'))
}

exports.build = standardAgentBuild;
exports.clean = clean;
exports.standardAgentLess = standardAgentLess;
exports.agentBuild = agentBuild;
exports.agentStyles = agentStyles;
exports.copyHtml = copyHtml;
exports.minifyAgentJS = minifyAgentJS;