module.exports = function(grunt) {

	var moment = require('moment'),
		pkg = grunt.file.readJSON('package.json'),
		semver = require('semver');

	// Project config
	grunt.initConfig({
		pkg: pkg,
		clean: {
			'thirdParty': ['dist/f2.thirdParty.js']
		},
		concat: {
			options: {
				separator: '\n',
				stripBanners: false
			},
			dist: {
				src: [
					'src/template/header.js.tmpl',
					'dist/f2.thirdParty.js',
					// The order of the src files matters in order to properly resolve
					// AMD dependencies
					'src/helpers/ajax.js',
					'src/helpers/appPlaceholders.js',
					'src/F2.Constants.js',
					'src/F2.Events.js',
					'src/F2.Schemas.js',
					'src/helpers/loadApps.js',
					'src/F2.js',
					'src/F2.UI.js',
					'src/F2.BaseAppClass.js',
					'src/template/footer.js.tmpl'
				],
				dest: 'dist/f2.js'
			},
			thirdParty: {
				// The order of the third-party libs matters
				// Don't change them unless you know what you're doing
				src: [
					'src/third-party/template/header.js.tmpl',
					// Almond
					'src/third-party/template/amd_header.js.tmpl',
					'src/third-party/almond.js',
					'src/third-party/template/amd_footer.js.tmpl',
					// JSON3
					'src/third-party/json3.js',
					'src/third-party/template/json3_footer.js.tmpl',
					// Reqwest
					'src/third-party/reqwest.js',
					'src/third-party/template/reqwest_footer.js.tmpl',
					// TV4
					'src/third-party/tv4.js',
					'src/third-party/template/tv4_footer.js.tmpl',
					// LazyLoad
					'src/third-party/lazyload.js',
					// Underscore
					'src/third-party/template/underscore_header.js.tmpl',
					'src/third-party/underscore.js',
					'src/third-party/template/footer.js.tmpl'
				],
				dest: 'dist/f2.thirdParty.js',
				options: {
					process: function(src, filename) {
						// Strip out source maps
						return src.replace(/[\/\/]+@\s+sourceMappingURL=[a-zA-Z.-_]+.map/g, "");
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
					bases: './',
					port: 8080,
					server: (require('path')).resolve('./tests/js/server')
				}
			}
		},
		jasmine: {
			'default': {
				options: {
					host: 'http://localhost:8080/tests/',
					outfile: 'index.html'
				}
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: [
				'src/*.js'
			]
		},
		uglify: {
			options: {
				preserveComments: 'some',
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("mm-dd-yyyy") %> - See below for copyright and license */\n'
			},
			dist: {
				files: {
					'dist/f2.min.js': ['dist/f2.js']
				},
				options: {
					report: 'gzip'
				}
			},
			sourcemap: {
				files: '<%= uglify.dist.files %>',
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
				src: 'dist/f2.min.js',
				prefix: 'src/'
			}
		},
		watch: {
			scripts: {
				files: [
					'Gruntfile.js',
					'.jshintrc',
					'src/**/*.*'
				],
				tasks: ['js'],
				options: {
					spawn: false
				}
			}
		}
	});

	// Load plugins
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express');

	// Register tasks
	grunt.registerTask('fix-sourcemap', 'Fixes the source map file', function() {
		var uglifyOptions = grunt.config('uglify.sourcemap.options'),
			options = grunt.config('sourcemap.options'),
			dest = uglifyOptions.sourceMap(options.src),
			rawMap = grunt.file.read(dest);

		rawMap = rawMap.replace(options.prefix, '');
		grunt.file.write(dest, rawMap);
	});

	grunt.registerTask('release', 'Prepares the code for release (merge into master)', function(releaseType) {
		if (!/^major|minor|patch$/i.test(releaseType) && !semver.valid(releaseType)) {
			grunt.log.error('"' + releaseType + '" is not a valid release type (major, minor, or patch) or SemVer version');
			return;
		}

		pkg.version = semver.valid(releaseType) ? releaseType : String(semver.inc(pkg.version, releaseType)).replace(/\-\w+$/, '');
		pkg._releaseDate = new Date().toJSON();
		pkg._releaseDateFormatted = moment(pkg._releaseDate).format('D MMMM YYYY');

		grunt.file.write('./package.json', JSON.stringify(pkg, null, '\t'));
		grunt.config.set('pkg', pkg);

		grunt.task.run('version');
	});

	grunt.registerTask('version', 'Displays version information for F2', function() {
		grunt.log.writeln(grunt.template.process(
			'This copy of F2 is at version <%= version %> with a release date of <%= _releaseDateFormatted %>',
			{ data: pkg }
		));
	});

	grunt.registerTask('js', ['jshint', 'concat:thirdParty', 'concat:dist', 'clean:thirdParty', 'uglify:dist', 'uglify:sourcemap', 'sourcemap']);
	grunt.registerTask('sourcemap', ['uglify:sourcemap', 'fix-sourcemap']);
	grunt.registerTask('test', ['jshint', 'express', 'jasmine', 'express-keepalive']);
	grunt.registerTask('travis', ['test']);

	// The default task
	grunt.registerTask('default', ['test', 'js']);
};