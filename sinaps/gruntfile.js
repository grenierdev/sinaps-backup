module.exports = function (grunt) {

	//var mozjpeg = require('imagemin-mozjpeg');
	//var pngquant = require('imagemin-pngquant');

	grunt.initConfig({

		sass: {
			options: {
				sourceMap: true
			},
			dist: {
				files: [{
					expand: true,
					cwd: './plugins/sinaps.admin/resources/sass/',
					src: ['**/*.scss'],
					dest: './plugins/sinaps.admin/resources/css/',
					ext: '.css'
				}]
			}
		},

		jshint: {
			sinaps: {
				options: {
					globals: {
						sinaps: true
					},
					ignores: ['node_modules/**', '**/node_modules/**', 'temps/**', 'templates/**', 'plugins/*/templates/**', 'plugins/*/resources/**'],
					multistr: true
				},
				files: {
					src: ['./*.js', './**/*.js']
				}
			}
		},

		watch: {
			sass: {
				interval: 1000,
				files: [
					'./plugins/sinaps.admin/resources/sass/**/*.scss'
				],
				tasks: ['sass']
			}
		},

		nodemon: {
			dist: {
				script: './server.js',
				options: {
					cwd: __dirname,
					delay: 500,
					watch: ['.', './**'],
					ext: 'js',
					ignore: ['node_modules/**', '**/node_modules/**', 'temps/**', 'templates/**', 'plugins/*/templates/**', 'plugins/*/resources/**']
				}
			}
		},

		concurrent: {
			options: {
				logConcurrentOutput: true
			},
			tasks: ['nodemon', 'watch']
		}

	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-contrib-watch');
	//grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-sass');
	//grunt.loadNpmTasks('grunt-contrib-less');


	grunt.registerTask('default', ['concurrent']);
	grunt.registerTask('tests', ['jshint']);
};
