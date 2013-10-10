module.exports = function(grunt) {

	var handlebars = require('handlebars'),
		moment = require('moment'),
		pkg = grunt.file.readJSON('package.json'),
		semver = require('semver');

	// TODO: Remove Handlebars dependency and use the built-in grunt templating
	// Handlebars helpers
	handlebars.registerHelper('if', function(conditional, options) {
		if (options.hash.desired === options.hash.test) {
			return options.fn(this);
		}
	});

	// Project config
	grunt.initConfig({
		pkg: pkg,
		clean: {
			docs: ['docs/src-temp'],
			'github-pages': {
				options: { force: true },
				src: ['../gh-pages/src']
			},
			'F2-examples': {
				options: { force: true },
				src: ['./F2-examples.zip']
			},
			'thirdParty': ['sdk/f2.thirdParty.js']
		},
		copy: {
			docs: {
				files: [
					{
						expand: true,
						cwd: 'docs/src/',
						src: ['**'],
						dest: 'docs/src-temp/',
						filter: function(src) {
							if (!(/twbootstrap/).test(src)) {//don't touch submodule
								return (/(.html|.md)$/i).test(src);
							}
						}
					}
				],
				options: {
					processContent: function(content, srcpath) {
						// TODO: Remove Handlebars dependency and use the built-in grunt
						// templating compile and run the Handlebars template
						return (handlebars.compile(content))(pkg);
					}
				}
			},
			'f2ToRoot': {
				files: [
					{
						expand: true,
						cwd: 'sdk/',
						src: 'f2.min.js',
						dest: './',
						rename: function(dest, src) {
							return './<%= pkg.name %>.latest.js';
						}
					}
				]
			},
			'github-pages': {
				files: [
					{
						expand: true,
						cwd: 'docs/',
						src: ['**'],
						dest: '../gh-pages'
					},
					{
						expand: true,
						cwd: './',
						src: ['f2.latest.js'],
						rename: function(dest, src) {
							return '../gh-pages/js/f2.min.js';//See #35
						}
					}
				]
			},
			'F2-examples': {
				files: [
					{
						expand: true,
						cwd: './',
						src: ['F2-examples.zip'],
						dest: '../gh-pages'
					}
				]
			}
		},
		compress: {
			main: {
				options: {
					archive: 'F2-examples.zip',
					pretty: true
				},
				files: [
					{
						expand: true,
						cwd: 'examples/',
						src: ['**'],
						dest: 'examples/'
					},
					{
						expand: true,
						cwd: 'sdk/',
						src: ['f2.debug.js'],
						dest: 'sdk/'
					},
					{
						expand: true,
						cwd: 'sdk/',
						src: ['src/third-party/require.min.js'],
						dest: 'sdk/'
					}
				]
			}
		},
		concat: {
			options: {
				process: {
					data: pkg
				},
				separator: '\n',
				stripBanners: false
			},
			dist: {
				src: [
					'sdk/src/template/header.js.tmpl',
					'sdk/f2.thirdParty.js',
					'<%= jshint.files %>',
					'sdk/src/template/footer.js.tmpl'
				],
				dest: 'sdk/f2.debug.js'
			},
			thirdParty: {
				src: [
					'sdk/src/template/thirdParty/header.js.tmpl',
					'sdk/src/third-party/json3.js',
					'sdk/src/template/thirdParty/json3.js.tmpl',
					'sdk/src/third-party/almond.js',
					'sdk/src/template/thirdParty/amd.js.tmpl',
					'sdk/src/third-party/eventemitter2.js',
					'sdk/src/third-party/q.js',
					'sdk/src/template/thirdParty/q.js.tmpl',
					'sdk/src/third-party/tv4.js',
					'sdk/src/template/thirdParty/tv4.js.tmpl',
					'sdk/src/template/thirdParty/footer.js.tmpl',
				],
				dest: 'sdk/f2.thirdParty.js',
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
					server: (require('path')).resolve('./tests/server')
				}
			}
		},
		jasmine: {
			'non-amd': {
				options: {
					host: 'http://localhost:8080/tests/',
					outfile: 'index.html'
				}
			},
			'amd': {
				options: {
					host: 'http://localhost:8080/tests/',
					outfile: 'index-amd.html'
				}
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: ['sdk/src/*.js']
		},
		less: {
			dist: {
				options: {
					compress: true
				},
				files: {
					'./docs/css/F2.css': './docs/src/template/less/bootstrap.less',
					'./docs/css/F2.Docs.css': './docs/src/template/less/bootstrap-docs.less',
					'./docs/css/F2.Sdk.css': './docs/src/template/less/bootstrap-sdk.less'
				}
			}
		},
		uglify: {
			options: {
				preserveComments: 'some',
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("mm-dd-yyyy") %> - See below for copyright and license */\n'
			},
			dist: {
				files: {
					'sdk/f2.min.js': ['sdk/f2.debug.js']
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
				src: 'sdk/f2.min.js',
				prefix: 'sdk/'
			}
		},
		watch: {
			scripts: {
				files: [
					'Gruntfile.js',
					'.jshintrc',
					'sdk/src/**/*.*'
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
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');
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

	grunt.registerTask('markitdown', 'Compiles the spec documentation with Markitdown', function() {
		var done = this.async(),
			log = grunt.log.write('Generating spec documentation...');
		grunt.util.spawn(
			{
				cmd: 'markitdown',
				args: [
					'./',
					'--output-path', '../',
					'--docTemplate', './template/baseTemplate.html',
					'--header', './template/header.html',
					'--footer', './template/footer.html',
					'--head', './template/style.html',
					'--title', 'F2'
				],
				opts: {
					cwd: './docs/src-temp'
				}
			},
			function(error, result, code) {
				if (error) {
					grunt.fail.fatal(error);
				} else {
					log.ok();
					done();
				}
			}
		);
	});

	grunt.registerTask('nuget', 'Builds the NuGet package for distribution on NuGet.org', function() {
		var done = this.async(),
			log = grunt.log.write('Creating NuSpec file...'),
			nuspec = grunt.file.read('./sdk/f2.nuspec.tmpl');

		nuspec = grunt.template.process(nuspec, { data: pkg });
		grunt.file.write('./sdk/f2.nuspec', nuspec);
		log.ok();

		log = grunt.log.write('Creating NuGet package...');
		grunt.util.spawn(
			{
				cmd: 'nuget',
				args: ['pack', 'f2.nuspec'],
				opts: {
					cwd: './sdk'
				}
			},
			function(error, result, code) {
				if (error) {
					grunt.fail.fatal(error);
				} else {
					grunt.file.delete('./sdk/f2.nuspec');
					log.ok();
					done();
				}
			}
		);
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

	grunt.registerTask('yuidoc', 'Builds the reference documentation with YUIDoc', function() {

		var builder,
			docOptions = {
				quiet: true,
				norecurse: true,
				paths: ['./sdk/src'],
				outdir: './docs/sdk/',
				themedir: './docs/src/sdk-template'
			},
			done = this.async(),
			json,
			log = grunt.log.write('Generating reference documentation...'),
			readmeMd = grunt.file.read('README.md'),
			Y = require('yuidocjs');

		json = (new Y.YUIDoc(docOptions)).run();
		// massage in some meta information from F2.json
		json.project = {
			docsAssets: '../',
			version: pkg.version,
			releaseDateFormatted: pkg._releaseDateFormatted
		};
		docOptions = Y.Project.mix(json, docOptions);

		// hasClassMembers
		// ensures that the class has members and isn't just an empty namespace
		Y.Handlebars.registerHelper('hasClassMembers', function() {

			for (var i = 0, len = json.classitems.length; i < len; i++) {
				//console.log(json.classitems[i].class, this.name);
				if (json.classitems[i].class === this.name) {
					return '';
				}
			}

			return 'hide';
		});

		// title tag
		Y.Handlebars.registerHelper('htmlTitle', function() {
			var name = this.displayName || this.name,
					title = name;

			if (title) {
				title = 'F2 - ' + title;
			} else {
				title = 'F2 - The Open Financial Framework';
			}

			return title;
		});

		// handle any member names that have periods in them
		Y.Handlebars.registerHelper('memberNameAsId', function() {
			return String(this.name).replace('.', '_');
		});

		// insert readme markdown
		/*Y.Handlebars.registerHelper('readme', function() {
			return builder.markdown(readmeMd, true);	
		});*/

		builder = new Y.DocBuilder(docOptions, json);
		builder.compile(function() {
			log.ok();
			done();
		});
	});

	grunt.registerTask('docs', ['less', 'yuidoc', 'copy:docs', 'markitdown', 'clean:docs']);
	grunt.registerTask('github-pages', ['copy:github-pages', 'clean:github-pages']);
	grunt.registerTask('zip', ['compress', 'copy:F2-examples', 'clean:F2-examples']);
	grunt.registerTask('js', ['jshint', 'concat:thirdParty', 'concat:dist', 'clean:thirdParty', 'uglify:dist', 'uglify:sourcemap', 'sourcemap', 'copy:f2ToRoot']);
	grunt.registerTask('sourcemap', ['uglify:sourcemap', 'fix-sourcemap']);
	grunt.registerTask('test', ['jshint', 'express', 'jasmine'/*, 'express-keepalive'*/]);
	grunt.registerTask('travis', ['test']);

	// the default task
	grunt.registerTask('default', ['test', 'js', 'docs', 'zip']);
};