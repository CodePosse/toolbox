// Untitled Project - created with Gulp Fiction
var gulp = require("gulp");
var cheerio = require('gulp-cheerio')
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var inject = require('gulp-inject');
var open = require('gulp-open');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var concat = require("gulp-concat");
var gulpif = require('gulp-if');
var htmlmin = require('gulp-html-minifier');

gulp.task("default", function () {
  gutil.log(gutil.colors.bgGreen.white.bold('GULP WORKS'), gutil.colors.bgRed.white.bold("type: \"gulp --tasks\" to list all tasks"));
  gulp.src(__filename)
  .pipe(open({uri: 'https://www.npmjs.com/package/gulp/'}));
});

gulp.task('miniHTML', function () {
  gulp.src('./src/*.html')//DUDE, CHANGE ME
    .pipe(plumber())
    .pipe(htmlmin())
    .pipe(gulp.dest('./'));//DUDE, CHANGE ME
});

gulp.task('sass', function () {
  gulp.src('./src/scss/theme.scss')//DUDE, CHANGE ME
    .pipe(plumber())
	  .pipe(sass())
    .pipe(gulp.dest('src/css'));//DUDE, CHANGE ME
});

gulp.task('miniCSS', function () {
  gulp.src('./src/**/*.css')//DUDE, CHANGE ME
    .pipe(plumber())
    .pipe(uglifycss())
    .pipe(gulp.dest('./css'));//DUDE, CHANGE ME
});

gulp.task('miniJS', function(){
  gulp.src('./src/js/*.js')//DUDE, CHANGE ME
    .pipe(plumber())
    .pipe(uglify({preserveComments : false,mangle : false}))
    .pipe(gulp.dest('/js'));//DUDE, CHANGE ME
});