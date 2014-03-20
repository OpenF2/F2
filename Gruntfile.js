module.exports = function(grunt) {

	var moment = require('moment');
	var pkg = grunt.file.readJSON('package.json');
	var semver = require('semver');
	var path = require('path');

	// Project config
	grunt.initConfig({
		pkg: pkg,
		clean: {
			thirdParty: ['./build/f2.thirdParty.js']
		},
		concat: {
			options: {
				separator: '\n',
				stripBanners: false
			},
			build: {
				src: [
					'./src/core/templates/header.js',
					'./build/f2.thirdParty.js',
					'./src/core/helpers/*.js',
					'./src/core/*.js',
					'./src/core/templates/footer.js'
				],
				dest: './build/f2.js'
			},
			thirdParty: {
				// The order of the third-party libs matters
				// Don't change them unless you know what you're doing
				src: [
					// Header
					'./src/vendor/templates/header.js',
					// JSON3
					'./src/vendor/json3.js',
					'./src/vendor/templates/json3_footer.js',
					// Reqwest
					'./src/vendor/reqwest.js',
					'./src/vendor/templates/reqwest_footer.js',
					// TV4
					'./src/vendor/tv4.js',
					'./src/vendor/templates/tv4_footer.js',
					// LazyLoad
					'./src/vendor/lazyload.js',
					// Underscore
					'./src/vendor/templates/underscore_header.js',
					'./src/vendor/underscore.js',
					// Footer
					'./src/vendor/templates/footer.js'
				],
				dest: './build/f2.thirdParty.js',
				options: {
					process: function(src, filename) {
						// Strip out source maps
						return src.replace(/[\/\/]+@\s+sourceMappingURL=[a-zA-Z.-_]+.map/g, '');
					}
				}
			}
		},
		/**
		 * Need to downgrade forever-monitor to v1.1 because of:
		 * https://github.com/blai/grunt-express/issues/12
		 * cd node_modules/grunt-express; npm uninstall forever-monitor; npm install forever-monitor@1.1;
		 */
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
				'./src/core/helpers/*.js',
				'./src/core/*.js'
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
					'./src/core/**/*.js',
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
						'src/core'
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

	grunt.registerTask('js', ['jshint', 'concat:thirdParty', 'concat:build', 'clean:thirdParty', 'uglify:build', 'uglify:sourcemap', 'sourcemap']);
	grunt.registerTask('sourcemap', ['uglify:sourcemap', 'fix-sourcemap']);
	grunt.registerTask('test', ['js', 'express', 'jasmine', 'express-keepalive']);
	grunt.registerTask('testweb', ['js', 'express', 'express-keepalive']);
	grunt.registerTask('default', ['test']);

};
