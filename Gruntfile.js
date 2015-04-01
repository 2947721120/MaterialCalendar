module.exports = function(grunt) {
  'use strict';

  // load plugins
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // configuration
  grunt.initConfig({
    jshint: {
      all: ['Gruntfile.js', 'content/**/*.js']
    },
    uglify: {
      my_target: {
        files: {
          'content/publish/material-calendar.min.js': ['content/js/material-calendar.js']
        }
      }
    },
    sass: {
      dev: {
        options: {
          style: 'expanded'
        },
        files: {
          'content/css/material-calendar.css': 'content/sass/material-calendar.scss',
          'content/css/optional.css': 'content/sass/optional.scss'
        }
      },
      prod: {
        options: {
          style: 'compressed'
        },
        files: {
          'content/publish/material-calendar.min.css': 'content/sass/material-calendar.scss'
        }
      }
    },
    watch: {
      scripts: {
        files: '**/*.js',
        tasks: ['jshint'],
        options: {
          interrupt: true,
          livereload: true,
        },
      },
      configFiles: {
        files: ['Gruntfile.js', '*.js', '*.html'],
        options: {
          reload: true,
          livereload: true,
        }
      },
      css: {
        files: '**/*.scss',
        tasks: ['sass:dev'],
        options: {
          livereload: true,
        },
      },
    },
  });

  grunt.registerTask('default', ['watch']);
  grunt.registerTask('prod', ['jshint', 'uglify', 'sass:prod']);
};
