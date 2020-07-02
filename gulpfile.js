'use strict';

var gulp = require( 'gulp' );
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');
var concat = require( 'gulp-concat' );
var less = require( 'gulp-less' );
var uglify = require( 'gulp-uglify' );

var themePath = '.';

gulp.task( 'default', gulp.series(function(done) {
  gulp.watch( themePath + '/src/less/**/*.less').on('change', function(path, stats) {
    gulp.src( themePath + '/src/less/style.less' )
        .pipe( less({compress: true}) )
        .pipe( autoprefixer('last 10 versions', 'ie 9') )
        .pipe( cleanCSS() )
        .pipe( gulp.dest( themePath + '/build' ) );
  });
  gulp.watch( themePath + '/src/scripts/**/*.js').on('change', function(path, stats) {
    gulp.src( ['./node_modules/jquery/dist/jquery.js', themePath + '/src/scripts/plugins/*.js', themePath + '/src/scripts/*.js'] )
    .pipe( concat( 'script.js' ) )
    .pipe( uglify() )
    .pipe( gulp.dest( themePath + '/build' ) );
  });
  done();
}));