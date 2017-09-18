var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var karma = require('karma').server;
var del = require('del');
var ngAnnotate = require('gulp-ng-annotate');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var eslint = require('gulp-eslint');

var build = {dev:false,unitTests:true, testCoverage:true};

var paths = {
    scripts: [
        'source/tryGoal/tryGoal_service.js',
        'source/tryGoal/tryGoal_app.js',
        'source/agent.js',
        'source/tryGoal/component/tryGoalController.js',
        'source/goalList/**/*.js',
        'source/mainController.js',
        '!**/*spec.js',
        '!**/*Spec.js'],
    less: ['source/styles/agent.less'],
    images: 'img/**/*'
};

// Delete content of dist folder to ensure a clean build
gulp.task('clean', function() {
    del(['dist/**.*']);
});

// using the main less file which imports other less files compile to css (less()) and minify
// use source mapping so dev tools can identify the less file a section of css comes from
// use autoprefixer to add browser dependent prefixers i.e. -moz-... so we don't have to
// and generate a css file at the destination
gulp.task('less', function () {
    gulp.src(paths.less)
        .pipe(sourcemaps.init())
        .pipe(less({compress: true}))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist'));
});

// Run this job so any less file changes are detected and then call the less task to recompile
// the single css file in dist folder
gulp.task('watch-less', function() {
    gulp.watch('**/*.less', ['less']);
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

var errorHandler = function(title, e) {
    gutil.log(title, e.message);
};


//WARNING, these commands are only here for people forking the agent project. Any changes should happpen in Rainbird-Applications instead.
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
            'source/tryGoal/component/shared/tryGoalBody.html'
        ])
        .pipe(gulp.dest('dist/tryGoal/component/shared'));
    gulp.src(['source/goalList/agentGoalList.html'])
        .pipe(gulp.dest('dist/goalList'));
    gulp.src(['source/main.html'])
        .pipe(gulp.dest('dist'));
});

// Clear dist folder, check quality (jshint, unit tests pass, test coverage), build minified app.
gulp.task('build', function () {
    runSequence(['clean', 'eslint'],
        ['less'],
        ['agent-build'],
        ['copy-html'],
        //['test'],
        //['minifyJS', 'imageOpt'],
        function (result) {
            if (!result) {
                gutil.log(gutil.colors.green('Build successful!'));
            } else {
                gutil.log(gutil.colors.red('Build failed!'));
            }
        });
});
