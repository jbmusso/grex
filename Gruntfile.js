module.exports = function(grunt){
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
	  }
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	// Load the plugin that provides the "lint" task.
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Default task(s).
	grunt.registerTask('default', ['jshint', 'uglify']);

}