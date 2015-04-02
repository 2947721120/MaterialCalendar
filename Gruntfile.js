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
      all: ['Gruntfile.js', 'public/content/js/*.js']
    },
    uglify: {
      dev: {
        options: {
          beautify: true,
          preserveComments: 'all',
          drop_console: true
        },
        files: {
          'public/content/publish/material-calendar.js': ['public/content/js/material-calendar.js']
        }
      },
      prod: {
        options: {
          preserveComments: 'some',
          compress: {
            drop_console: true
          }
        },
        files: {
          'public/content/publish/material-calendar.min.js': ['public/content/js/material-calendar.js']
        }
      }
    },
    sass: {
      dev: {
        options: {
          style: 'expanded'
        },
        files: {
          'public/content/css/material-calendar.css': 'public/content/sass/material-calendar.scss',
          'public/content/css/optional.css': 'public/content/sass/optional.scss'
        }
      },
      prod: {
        options: {
          style: 'compressed'
        },
        files: {
          'public/content/publish/material-calendar.min.css': 'public/content/sass/material-calendar.scss'
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
  grunt.registerTask('prod', ['jshint', 'uglify:dev', 'sass:dev']);
  grunt.registerTask('prodmin', ['jshint', 'uglify:prod', 'sass:prod']);
};
