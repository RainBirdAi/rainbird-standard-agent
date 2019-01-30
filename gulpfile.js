var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var less = require('gulp-less');
//var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var karma = require('karma').server;
var del = require('del');
var ngAnnotate = require('gulp-ng-annotate');
var runSequence = require('run-sequence');
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
        'source/results/component/resultsController.js',
        'source/goalList/**/*.js',
        'source/mainController.js',
        'source/directives/**/*.js',
        '!**/*spec.js',
        '!**/*Spec.js'],
    less: ['source/styles/agent.less'],
    images: 'img/**/*'
};

// Delete content of dist folder to ensure a clean build
gulp.task('clean', function() {
    del(['dist/**.*']);
});


// Run tests once and exit use for running build
gulp.task('test', function (done) {
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
});

// Run tests headless
gulp.task('test-headless', function (done) {
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
});


gulp.task('eslint', function() {
    var eslintRun = gulp.src(['source/**/*.js', 'test/**/*.js', 'gulpfile.js'])
               .pipe(eslint())
               .pipe(eslint.format());

    if (!build.dev) {
        return eslintRun.pipe(eslint.failAfterError());
    } else {
        return eslintRun;
    }
});

//Angular Agent Compilation
gulp.task('minifyAgentJS', function () {
    return gulp.src(paths.scripts)
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(concat('agent.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('agent-build', ['minifyAgentJS', 'agent-styles']);

gulp.task('agent-styles', function() {
    gulp.src('source/styles/agent.less')
        .pipe(less({compress: true}))
        .on('error', errorHandler.bind(this, 'LESS Compiler Error:'))
        //.pipe(autoprefixer())
        .pipe(rename('agent.min.css'))
        .pipe(gulp.dest('dist'));
});

var errorHandler = function(title, e) {
    gutil.log(title, e.message);
};

gulp.task('copy-html', function() {
    gulp.src(
        [
            'source/tryGoal/component/tryGoalModal.html', //remove when we embed agents - refactor out references to shared
            'source/tryGoal/component/tryGoalAgent.html'
        ])
        .pipe(gulp.dest('dist/tryGoal/component'));
    gulp.src(
        [
            'source/tryGoal/component/shared/addRemovePluralButtons.html',
            'source/tryGoal/component/shared/tryGoalBody.html',
            'source/tryGoal/component/shared/apiLog.html'
        ])
        .pipe(gulp.dest('dist/tryGoal/component/shared'));
    gulp.src(['source/goalList/agentGoalList.html'])
        .pipe(gulp.dest('dist/goalList'));
    gulp.src(['source/main.html'])
        .pipe(gulp.dest('dist'));
    gulp.src(['source/results/component/results.html'])
        .pipe(gulp.dest('dist/results/'));
	gulp.src(['source/angular-semantic-ui.min.js'])
			.pipe(gulp.dest('dist'));
});

// Clear dist folder, check quality (jshint, unit tests pass, test coverage), build minified app.
gulp.task('build', function() {
    runSequence(['clean'],
    ['less'],
    ['agent-build'],
    ['copy-html'],
    //['test'],
    ['minifyAgentJS'],
    function(result) {
        if (!result) {
            gutil.log(gutil.colors.green('Build successful!'));
        } else {
            gutil.log(gutil.colors.red('Build failed!'));
        }
    });
});


gulp.task('default', ['dev']);


//BrowserSync
gulp.task('build-and-reload', ['build'], function (done) {
	browserSync.reload();
	done();
});


gulp.task('watchandrefresh', ['build'], function () {
	// Serve files from the root of this project
	browserSync.init({
		proxy: "localhost:3051",
		port: 8080,
		notify: true
	});

	gulp.watch(['source/**/*.js', 'source/**/*.html'], ['build-and-reload']);
});

gulp.task('watch-less', function() {
	gulp.watch('source/styles/**/*.less', ['less']);
	gulp.watch('dist/*.css').on('change', function() {

	});
});

gulp.task('less', function () {

	return gulp.src(paths.less)
			.pipe(less({compress: true}))
			.pipe(rename({
				suffix: '.min'
			}))
			.pipe(gulp.dest('dist'))
});

