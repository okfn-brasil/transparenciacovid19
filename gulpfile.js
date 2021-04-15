'use strict';

var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
const strip = require('gulp-strip-comments');

const BABEL_POLYFILL = './node_modules/babel-polyfill/browser.js';

var themePath = '.';

gulp.task('default', gulp.series(function(done) {
  gulp.watch(themePath + '/src/less/**/*.less').on('change', function(path, stats) {
    gulp.src(themePath + '/src/less/style.less')
      .pipe(less({
        compress: true
      }))
      .pipe(autoprefixer('last 10 versions', 'ie 9'))
      .pipe(cleanCSS())
      .pipe(gulp.dest(themePath + '/build'));
  });
  gulp.watch(themePath + '/src/scripts/**/*.js').on('change', function(path, stats) {
    gulp.src(['./node_modules/jquery/dist/jquery.js', themePath + '/src/scripts/plugins/*.js', themePath + '/src/scripts/*.js'])
      .pipe(concat('script.js'))
      .pipe(uglify())
      .pipe(gulp.dest(themePath + '/build'));
  });
  gulp.watch(themePath + '/src/scripts/**/*.js').on('change', function(path, stats) {
    gulp.src([themePath + '/src/scripts/indice/*.js'])
      .pipe(concat('indice.js'))
      .pipe(uglify())
      .pipe(gulp.dest(themePath + '/build'));
  });
  gulp.watch(themePath + '/src/scripts/**/*.js').on('change', function(path, stats) {
    gulp.src([BABEL_POLYFILL, themePath + '/src/scripts/leitos/_leitos.js'])
      .pipe(concat('leitos.js'))
      // .pipe(uglify())
      .pipe(strip())
      .pipe(babel({ presets: ['@babel/preset-env'] }))
      .pipe(gulp.dest(themePath + '/build'));
  });
  done();
}));

gulp.task('js', function() {
    return gulp.src([BABEL_POLYFILL, themePath + '/src/scripts/leitos/_leitos.js'])
      .pipe(concat('leitos.js'))
      // .pipe(uglify())
      .pipe(strip())
      .pipe(babel({ presets: ['@babel/preset-env'] }))
      .pipe(gulp.dest(themePath + '/build'));
});
