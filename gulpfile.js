var gulp = require('gulp');

var mocha = require('gulp-mocha');
var uglify = require('gulp-uglify');
var size = require('gulp-size');
var rename = require('gulp-rename');
var bump = require('gulp-bump');

var browserify = require('browserify');
var transform = require('vinyl-transform');

var argv = require('yargs')
    .options('s', {
      alias: 'semver',
      default: 'patch'
    })
    .argv;


gulp.task('scripts', function () {
  var browserified = transform(function(filename) {
    var b = browserify(filename, { });
    return b.bundle();
  });

  return gulp.src(['./src/grex.js'])
      .pipe(browserified)
      .pipe(gulp.dest('./build'))
      .pipe(size({ showFiles: true }))
      .pipe(uglify())
      .pipe(rename('grex.min.js'))
      .pipe(gulp.dest('./build'))
      .pipe(size({ showFiles: true }));
});

gulp.task('test', function() {
  gulp.src('test/**/*.js')
      .pipe(mocha({
        reporter: 'spec',
        globals: {
          should: require('should')
        }
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

// Bump tasks
gulp.task('bump-version', function() {
  gulp.src('./package.json')
      .pipe(bump({ type: argv.semver }))
      .pipe(gulp.dest('./'));
});

// Main tasks
gulp.task('default', ['dev']);

gulp.task('dev', ['test', 'watch']);

gulp.task('build', ['test', 'scripts']);

