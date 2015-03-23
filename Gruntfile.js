module.exports = function(grunt) {
  'use strict';

  // load plugins
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-sass');

  // configuration
  grunt.initConfig({
    jshint: {
      all: ['Gruntfile.js', 'content/**/*.js']
    },
    sass: {
      dist: {
        options: {
          style: 'expanded'
        },
        files: {
          'content/css/material-calendar.css': 'content/sass/material-calendar.scss'
        }
      }
    },
    watch: {
      scripts: {
        files: '**/*.js',
        tasks: ['jshint'],
        options: {
          interrupt: true,
        },
      },
      configFiles: {
        files: ['Gruntfile.js', '*.js', '*.html'],
        options: {
          reload: true
        }
      },
      css: {
        files: '**/*.sass',
        tasks: ['sass'],
        options: {
          livereload: true,
        },
      },
    },
  });

  grunt.registerTask('default', ['watch']);
};
