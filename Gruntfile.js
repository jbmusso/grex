module.exports = function(grunt){

  //Need to work out how to include browserify & uglify
  //browserify -r ./src/grex.js:grex > ./browser/bundle.js
  //uglifyjs ./browser/bundle.js -o ./browser/grex.min.js

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
      banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
    },
    build: {
      src: 'src/<%= pkg.name %>.js',
      dest: 'build/<%= pkg.name %>.min.js'
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
          timeout: 10000,
            reporter: 'spec',
            require: 'should',
            globals: 'g'
        },
        src: ['test/*.js']
      }
    },
    browserify2: {
      dev: {
        entry: './build/entry.js',
        mount: '/application.js',
        server: './build/server.js',
        debug: true
      },
      compile: {
        entry: './build/entry.js',
        compile: './public/application.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  // Load the plugin that provides the "lint" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // Load the plugin that provides the "browserify" task.
  grunt.loadNpmTasks('grunt-browserify2');
  // Load the plugin that provides the "mocha/phantomjs" task.
//  grunt.loadNpmTasks('grunt-mocha');
  // Add the grunt-mocha-test tasks.
  grunt.loadNpmTasks('grunt-mocha-test');


  // Default task(s).
  grunt.registerTask('default', ['jshint', 'grunt-mocha-test', 'browserify2:dev']);
  grunt.registerTask('compile', 'browserify2:compile');

};
