module.exports = function(grunt) {
	'use strict';

	// load plugins
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-jscs');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// configuration
	grunt.initConfig(
{
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
	configFiles: {
		files: ['*.js', '*.json', '*.html'],
		options: {
			reload: true,
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

	grunt.registerTask('default', ['jscs', 'watch']);
	grunt.registerTask('prod', ['jscs', 'uglify:dev', 'sass:dev']);
	grunt.registerTask('prodmin', ['jscs', 'uglify:prod', 'sass:prod']);
};
