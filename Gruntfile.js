module.exports = function(grunt) {
	'use strict';

	// load plugins
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jscs');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// configuration
	grunt.initConfig({
	jshint: {
		options: {
			unused: true,
			forin: true,
			newcap: true,
			strict: true,
			eqnull: true
		},
		all: ['Gruntfile.js', 'public/content/js/material-calendar.js']
	},
	jscs: {
		src: ['Gruntfile.js', 'public/content/js/material-calendar.js'],
		options: {
			config: '.jscsrc'
		}
	},
	uglify: {
		dev: {
			options: {
				beautify: true,
				preserveComments: 'all',
				dropConsole: true
			},
			files: {
				'public/content/publish/material-calendar.js': ['public/content/js/material-calendar.js']
			}
		},
		prod: {
			options: {
				preserveComments: 'some',
				compress: {
					dropConsole: true
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
		livereload: {
			options: {
				livereload: true
			},
			files: ['public/**/*']
		},
		scripts: {
			files: 'public/content/js/material-calendar.js',
			tasks: ['jshint', 'jscs'],
			options: {
				livereload: true
			}
		},
		css: {
			files: '**/*.scss',
			tasks: ['sass:dev'],
			options: {
				livereload: true
			}
		}
	}
});

	grunt.registerTask('jsvalidate', ['jshint', 'jscs']);
	grunt.registerTask('default', ['jsvalidate', 'watch']);
	grunt.registerTask('prod', ['jsvalidate', 'uglify:dev', 'sass:dev']);
	grunt.registerTask('prodmin', ['jsvalidate', 'uglify:prod', 'sass:prod']);
};
