module.exports = function(grunt) {

	var moment = require('moment');
	var pkg = grunt.file.readJSON('package.json');
	var semver = require('semver');
	var path = require('path');

	// Project config
	grunt.initConfig({
		pkg: pkg,
		clean: {
			vendor: ['./build/f2.vendor.js']
		},
		concat: {
			options: {
				separator: '\n',
				stripBanners: false
			},
			build: {
				src: [
					// Header
					'./src/templates/header.js',
					// Vendor
					'./build/f2.vendor.js',
					// Core (order matters)
					'./src/helpers/funderscore.js',
					'./src/helpers/ajax.js',
					'./src/helpers/appPlaceholders.js',
					'./src/helpers/guid.js',
					'./src/constants.js',
					'./src/schemas.js',
					'./src/helpers/loadApps.js',
					'./src/events.js',
					'./src/core.js',
					'./src/ui.js',
					'./src/appClass.js',
					// Footer
					'./src/templates/footer.js'
				],
				dest: './build/f2.js'
			},
			vendor: {
				src: [
					// Header
					'./src/templates/vendor/header.js',
					// Reqwest
					'./vendor/reqwest/reqwest.js',
					'./src/templates/vendor/reqwest_footer.js',
					// TV4
					'./vendor/tv4/tv4.js',
					'./src/templates/vendor/tv4_footer.js',
					// Footer
					'./src/templates/vendor/footer.js'
				],
				dest: './build/f2.vendor.js',
				options: {
					process: function(src, filename) {
						// Strip out source maps
						return src.replace(/[\/\/]+@\s+sourceMappingURL=[a-zA-Z.-_]+.map/g, '');
					}
				}
			}
		},
		express: {
			server: {
				options: {
					bases: [__dirname],
					hostname: 'localhost',
					port: 8080,
					server: path.resolve('./tests/js/server')
				}
			}
		},
		jasmine: {
			'default': {
				options: {
					host: 'http://localhost:8080/tests/',
					outfile: './index.html'
				}
			}
		},
		jshint: {
			options: {
				jshintrc: './.jshintrc'
			},
			files: [
				'./src/helpers/*.js',
				'./src/*.js'
			]
		},
		uglify: {
			options: {
				preserveComments: 'none',
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("mm-dd-yyyy") %> - See below for copyright and license */\n'
			},
			build: {
				files: {
					'./build/f2.min.js': ['./build/f2.js']
				},
				options: {
					report: 'gzip'
				}
			},
			sourcemap: {
				files: '<%= uglify.build.files %>',
				options: {
					sourceMap: function(fileName) {
						return fileName.replace(/\.js$/, '.map');
					},
					sourceMapPrefix: 1,
					sourceMappingURL: function(path) {
						return path.replace(grunt.config('sourcemap.options.prefix'), '').replace(/\.js$/, '.map');
					}
				}
			}
		},
		sourcemap: {
			options: {
				src: './build/f2.min.js',
				prefix: './src/'
			}
		},
		watch: {
			scripts: {
				files: [
					'./Gruntfile.js',
					'./.jshintrc',
					'./src/**/*.js',
				],
				tasks: ['js'],
				options: {
					spawn: false
				}
			}
		},
		yuidoc: {
			compile: {
				options: {
					exclude: 'helpers',
					paths: [
						'./src/'
					],
					outdir: './docs'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-yuidoc');
	grunt.loadNpmTasks('grunt-express');

	grunt.registerTask('fix-sourcemap', 'Fixes the source map file', function() {
		var uglifyOptions = grunt.config('uglify.sourcemap.options'),
			options = grunt.config('sourcemap.options'),
			dest = uglifyOptions.sourceMap(options.src),
			rawMap = grunt.file.read(dest);

		rawMap = rawMap.replace(options.prefix, '');
		grunt.file.write(dest, rawMap);
	});

	grunt.registerTask('js', ['jshint', 'concat:vendor', 'concat:build', 'clean:vendor', 'uglify:build', 'uglify:sourcemap', 'sourcemap']);
	grunt.registerTask('sourcemap', ['uglify:sourcemap', 'fix-sourcemap']);
	grunt.registerTask('test', ['js', 'express', 'jasmine', 'express-keepalive']);
	grunt.registerTask('testweb', ['js', 'express', 'express-keepalive']);
	grunt.registerTask('default', ['test']);

};
