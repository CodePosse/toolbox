// Untitled Project - created with Gulp Fiction
var gulp = require("gulp");
var cheerio = require('gulp-cheerio')//use jquery in gulp
var gutil = require('gulp-util');//utilities
var plumber = require('gulp-plumber');//error handler
var inject = require('gulp-inject');//injects html/css/js into placeholders
var open = require('gulp-open');//open in a browser
var prettify = require('gulp-prettify');//properly formats HTML
var sass = require('gulp-sass');//scss/sass task
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var concat = require("gulp-concat");//concatinate files
var gulpif = require('gulp-if');//if else for gulp
var htmlmin = require('gulp-html-minifier');//html uglify

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

gulp.task('prettyHTML', function () {
  gulp.src('./src/*.html')//DUDE, CHANGE ME
    .pipe(plumber())
    .pipe(prettify())
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