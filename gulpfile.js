var gulp = require('gulp');
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var filesize = require('gulp-filesize');
var rename = require('gulp-rename');
var jasmine = require('gulp-jasmine');
var expressService = require('gulp-express-service');
var plumber = require('gulp-plumber');

var paths = {
	core: [
		'./src/core/helpers/*.js',
		'./src/core/*.js',
	],
	scripts: [
		// Header
		'./src/core/templates/header.js',
		// Vendor
		'./src/vendor/templates/header.js',
		'./src/vendor/json3.js',
		'./src/vendor/templates/json3_footer.js',
		'./src/vendor/reqwest.js',
		'./src/vendor/templates/reqwest_footer.js',
		'./src/vendor/tv4.js',
		'./src/vendor/templates/tv4_footer.js',
		'./src/vendor/templates/underscore_header.js',
		'./src/vendor/underscore.js',
		'./src/vendor/templates/footer.js',
		// Core
		'./src/core/helpers/*.js',
		'./src/core/*.js',
		// Footer
		'./src/core/templates/footer.js',
	],
	test: './tests/js/specs/*.js'
};

gulp.task('lint', function() {
	return gulp.src(paths.core)
		.pipe(jshint('.jshintrc'))
		.pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('scripts', function() {
	return gulp.src(paths.scripts)
		.pipe(plumber())
		.pipe(concat('f2.js'))
		.pipe(gulp.dest('./build'))
		.pipe(uglify())
		.pipe(rename('f2.min.js'))
		.pipe(filesize())
		.pipe(gulp.dest('./build'));
});

gulp.task('watch', function() {
	gulp.watch(paths.scripts, ['lint', 'scripts']);
});

gulp.task('test', function() {
	gulp.src(paths.test)
		.pipe(expressService({
			file: './tests/js/server.js'
		}));
});

gulp.task('default', ['lint', 'scripts', 'watch']);
