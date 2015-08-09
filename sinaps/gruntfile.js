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
					src: ['*.scss'],
					dest: './plugins/sinaps.admin/resources/css/',
					ext: '.css'
				}]
			}
		},

		//less: {
		//	dist: {
		//		files: [{
		//			expand: true,
		//			cwd: '../public_html/resources/less/',
		//			src: ['*.less'],
		//			dest: '../public_html/resources/css/',
		//			ext: '.css'
		//		}]
		//	}
		//},

		//imagemin: {
		//	medias: {
		//		options: {
		//			progressive: true,
		//			optimizationLevel: 7,
		//			use: [mozjpeg(), pngquant()]
		//		},
		//		files: [{
		//			expand: true,
		//			cwd: __dirname,
		//			src: ['../public_html/resources/medias/*.{png,jpg}'],
		//			dest: '../public_html/resources/medias2/',
		//			flatten: true
		//		}]
		//	}
		//},

		//watch: {
		//	less: {
		//		interval: 1000,
		//		files: ['../public_html/resources/less/**/*.less'],
		//		tasks: ['less']
		//	},
		//},

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
			tasks: ['nodemon', 'sass']
		}

	});

	grunt.loadNpmTasks('grunt-concurrent');
	grunt.loadNpmTasks('grunt-nodemon');
	//grunt.loadNpmTasks('grunt-contrib-watch');
	//grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-sass');
	//grunt.loadNpmTasks('grunt-contrib-less');


	grunt.registerTask('default', ['concurrent']);
}
