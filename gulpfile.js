// Untitled Project - created with Gulp Fiction
var gulp = require("gulp");
var cheerio = require('gulp-cheerio') //use jquery in gulp
var gutil = require('gulp-util'); //utilities
var plumber = require('gulp-plumber'); //error handler
var inject = require('gulp-inject'); //injects html/css/js into placeholders
var open = require('gulp-open'); //open in a browser
var prettify = require('gulp-prettify'); //properly formats HTML
var sass = require('gulp-sass'); //scss/sass task
var uglify = require('gulp-uglify');
var uglifycss = require('gulp-uglifycss');
var concat = require("gulp-concat"); //concatinate files
var gulpif = require('gulp-if'); //if else for gulp
var htmlmin = require('gulp-htmlmin'); //html uglify

gulp.task("default", async function () {
  gutil.log(gutil.colors.bgGreen.white.bold('GULP WORKS'), gutil.colors.bgRed.white.bold("type: \"gulp --tasks\" to list all tasks"));
});

gulp.task('miniHTML', async function () {
  gulp.src('src/html/*.html') //DUDE, CHANGE ME
    .pipe(plumber())
    .pipe(cheerio(function ($, file) {
      $("img:not([alt])").attr("alt", ""); //this adds a blank alt tag to images without an alt
    }))
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true
    }))
    .pipe(gulp.dest('./prod/html/')); //DUDE, CHANGE ME
});

gulp.task('prettyHTML', async function (resolve) {
  gulp.src('./src/html/*.html') //DUDE, CHANGE ME
    .pipe(plumber())
    .pipe(prettify())
    .pipe(gulp.dest('./prod/html/')); //DUDE, CHANGE ME
});

gulp.task('sass', async function () {
  gulp.src('./src/scss/theme.scss') //DUDE, CHANGE ME
    .pipe(plumber())
    .pipe(sass())
    .pipe(gulp.dest('src/css')); //DUDE, CHANGE ME
});

gulp.task('miniCSS', async function () {
  gulp.src('./src/**/*.css') //DUDE, CHANGE ME
    .pipe(plumber())
    .pipe(uglifycss())
    .pipe(gulp.dest('./css')); //DUDE, CHANGE ME
});

gulp.task('miniJS', async function () {
  gulp.src('./src/js/*.js') //DUDE, CHANGE ME
    .pipe(plumber())
    .pipe(uglify())
    .pipe(gulp.dest('./prod/js')); //DUDE, CHANGE ME
});