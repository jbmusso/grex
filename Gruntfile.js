module.exports = function(grunt){

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'client/grex.js',
        dest: 'client/<%= pkg.name %>.min.js'
      }
    },
    jshint: {
      ignore_warning: {
        options: {
        '-W040': true,
        },
        src: ['src/*.js'],
      }
    },
    // Configure a mochaTest task
    mochaTest: {
      test: {
        options: {
          timeout: 2000,
            reporter: 'spec',
            require: 'should',
            globals: 'g'
        },
        src: ['test/**/*.js']
      }
    },
    browserify: {
      build: {
        src: ['index.js'],
        dest: 'client/grex.js',
        options: {
          standalone: 'gRex',
          debug: false
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // Load the plugin that provides the "lint" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // Load the plugin that provides the "browserify" task.
  grunt.loadNpmTasks('grunt-browserify');
  // Add the grunt-mocha-test tasks.
  grunt.loadNpmTasks('grunt-mocha-test');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'mochaTest']);
  grunt.registerTask('build', ['jshint', 'browserify:build', 'uglify']);
  grunt.registerTask('test', ['mochaTest']);

};
