var gulp = require('gulp');

var browserify = require('gulp-browserify');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var uglify = require('gulp-uglify');
var size = require('gulp-size');
var rename = require('gulp-rename');

gulp.task('scripts', function() {
  gulp.src('index.js')
      .pipe(browserify())
      .pipe(jshint())
      .pipe(rename('grex.js'))
      .pipe(gulp.dest('./build'))
      .pipe(size({ showFiles: true }))
      // Minified version
      .pipe(uglify())
      .pipe(rename('grex.min.js'))
      .pipe(gulp.dest('./build'))
      .pipe(size({ showFiles: true }));
});

gulp.task('test', function() {
  require('should');

  gulp.src('test/**/*')
      .pipe(mocha({
        reporter: 'spec',
      }))
      .on('error', function(error) {
        console.error('\nError:', error.plugin);
        console.error(error.message);
      });
});


gulp.task('watch', function() {
  function onChange(event) {
    console.log('File', event.type +':', event.path);
  }

  gulp.watch('src/**/*', ['test']).on('change', onChange);
  gulp.watch('test/**/*', ['test']).on('change', onChange);
});

gulp.task('default', ['dev']);

gulp.task('dev', ['build', 'test', 'watch']);

gulp.task('build', ['test', 'scripts']);