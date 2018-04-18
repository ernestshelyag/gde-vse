"use strict";

var gulp         = require('gulp'),
		pug          = require('gulp-pug'),
		sass         = require('gulp-sass'),
		concat       = require('gulp-concat'),
		plumber      = require('gulp-plumber'),
		autoprefixer = require('autoprefixer'),
		postcss      = require('gulp-postcss'),
		mqpacker     = require('css-mqpacker'),
		imagemin     = require('gulp-imagemin'),
		useref 			 = require('gulp-useref'),
		gulpif 			 = require('gulp-if'),
		cssmin 			 = require('gulp-clean-css'),
		uglify 			 = require('gulp-uglify'),
		rimraf 			 = require('rimraf'),
		browserSync  = require('browser-sync').create();

var paths = {
			src: 'src/',
			devDir: 'dist/',
			outputDir: 'build/'
		};

/*********************************
              DIST
*********************************/

// pug compile

gulp.task('pug', function() {
	return gulp.src([paths.src + 'pug/pages/*.pug'])
		.pipe(plumber())
		.pipe(pug({pretty: true}))
		.pipe(gulp.dest(paths.devDir))
		.pipe(browserSync.stream())
});

// sass compile

var processors = [
  autoprefixer({
    browsers: ['last 4 versions'],
    cascade: false
  }),
  require('lost'),
  mqpacker({
    sort: sortMediaQueries
  })
];

function isMax(mq) {
  return /max-width/.test(mq);
}
function isMin(mq) {
  return /min-width/.test(mq);
}
function sortMediaQueries(a, b) {
  var A = a.replace(/\D/g, '');
  var B = b.replace(/\D/g, '');
  if (isMax(a) && isMax(b)) {
    return B - A;} else if (isMin(a) && isMin(b)) {
    return A - B;} else if (isMax(a) && isMin(b)) {
    return 1;} else if (isMin(a) && isMax(b)) {
    return -1;
  }
  return 1;
}

gulp.task('sass', function() {
	return gulp.src(paths.src + 'styles/app.sass')
		.pipe(plumber())
		.pipe(sass().on('error', sass.logError))
		.pipe(postcss(processors))
		.pipe(gulp.dest(paths.devDir + 'css/'))
		.pipe(browserSync.stream());
});

// js compile

gulp.task('js', function() {
	return gulp.src(paths.src + 'js/*.js')
		.pipe(concat('main.js'))
		.pipe(gulp.dest(paths.devDir + 'js/'))
		.pipe(browserSync.stream());
});

// watch

gulp.task('watch', function() {
	gulp.watch(paths.src + '**/*.pug', ['pug']);
	gulp.watch(paths.src + '**/*.sass', ['sass']);
	gulp.watch(paths.src + '**/*.js', ['scripts']);
});

// local server

gulp.task('browser-sync', function() {
	browserSync.init({
		port: 3000,
		server: {
			baseDir: paths.devDir
		}
	});
});

/*********************************
             BUILD
*********************************/

// clean

gulp.task('clean', function(cb) {
	rimraf(paths.outputDir, cb);
});

// css + js

gulp.task('build-all', ['clean'], function () {
	return gulp.src(paths.devDir + '*.html')
		.pipe(useref())
		.pipe(gulpif('*.js', uglify()))
		.pipe(gulpif('*.css', cssmin()))
		.pipe(gulp.dest(paths.outputDir));
});

// min and copy images to outputDir

gulp.task('imgProcess', ['clean'], function() {
	return gulp.src(paths.devDir + 'img/**/*.*')
		.pipe(imagemin())
		.pipe(gulp.dest(paths.outputDir + 'img/'));
});

// copy fonts to outputDir

gulp.task('copyFonts', ['clean'], function() {
	return gulp.src(paths.devDir + '/fonts/*')
		.pipe(gulp.dest(paths.outputDir + 'fonts/'));
});

// default

gulp.task('default', ['browser-sync', 'watch', 'pug', 'sass', 'js']);

// build

gulp.task('build', ['build-all', 'imgProcess', 'copyFonts']);
