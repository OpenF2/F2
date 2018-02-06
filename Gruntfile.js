module.exports = function(grunt) {

	var exec = require('child_process').exec,
		handlebars = require('handlebars'),
		moment = require('moment'),
		pkg = grunt.file.readJSON('package.json'),
		bower_pkg = grunt.file.readJSON('bower.json'),
		semver = require('semver'),
		path = require('path');

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
			'github-pages': {
				options: { force: true },
				src: ['../gh-pages/src']
			},
			'F2-examples': {
				options: { force: true },
				src: ['./F2-examples.zip']
			}
		},
		copy: {
			'f2ToRoot': {
				files: [
					{
						expand: true,
						cwd: 'sdk/',
						src: 'f2.min.js',
						dest: './',
						rename: function(dest,src){
							return './<%= pkg.name %>.latest.js';
						}
					}
				]
			},
			'f2Dist': {
				files: [
					{
						expand: true, 
						flatten: true,
						src: [
							'sdk/packages/*',
							'sdk/*.js',
							'sdk/*.map'
						], 
						dest: 'dist/', 
						filter: 'isFile'
					}
				]
			},
			'github-pages': {
				files: [
					{
						expand: true,
						cwd: 'docs/dist',
						src: ['**'],
						dest: '../gh-pages'
					},
					{
						expand: true,
						cwd: './',
						src: ['f2.latest.js'],
						rename: function(dest,src){
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
				process: { data: pkg },
				separator: '\n',
				stripBanners: false
			},
			dist: {
				src: [
					'sdk/src/template/header.js.tmpl',
					'sdk/src/third-party/json3.js',
					'sdk/src/third-party/jquery.js',
					'sdk/src/third-party/jquery.noconflict.js',
					'sdk/src/third-party/bootstrap-modal.js',
					'sdk/src/third-party/eventemitter2.js',
					'sdk/src/third-party/easyXDM/easyXDM.js',
					'<%= jshint.files %>',
					'sdk/src/template/footer.js.tmpl'
				],
				dest: 'sdk/f2.debug.js'
			},
			'no-third-party': {
				src: [
					'sdk/src/template/header.js.tmpl',
					'<%= jshint.files %>',
					'sdk/src/template/footer.js.tmpl'
				],
				dest: 'sdk/f2.no-third-party.js'
			},
			'no-jquery-or-bootstrap': {
				src: [
					'sdk/src/template/header.js.tmpl',
					'sdk/src/third-party/json3.js',
					'sdk/src/third-party/eventemitter2.js',
					'sdk/src/third-party/easyXDM/easyXDM.js',
					'<%= jshint.files %>',
					'sdk/src/template/footer.js.tmpl'
				],
				dest: 'sdk/packages/f2.no-jquery-or-bootstrap.js'
			},
			'no-bootstrap': {
				src: [
					'sdk/src/template/header.js.tmpl',
					'sdk/src/third-party/json3.js',
					'sdk/src/third-party/jquery.js',
					'sdk/src/third-party/jquery.noconflict.js',
					'sdk/src/third-party/eventemitter2.js',
					'sdk/src/third-party/easyXDM/easyXDM.js',
					'<%= jshint.files %>',
					'sdk/src/template/footer.js.tmpl'
				],
				dest: 'sdk/packages/f2.no-bootstrap.js'
			},
			'no-easyXDM': {
				src: [
					'sdk/src/template/header.js.tmpl',
					'sdk/src/third-party/json3.js',
					'sdk/src/third-party/jquery.js',
					'sdk/src/third-party/bootstrap-modal.js',
					'sdk/src/third-party/jquery.noconflict.js',
					'sdk/src/third-party/eventemitter2.js',
					'<%= jshint.files %>',
					'sdk/src/template/footer.js.tmpl'
				],
				dest: 'sdk/packages/f2.no-easyXDM.js'
			},
			'basic': { //reminiscent of F2 1.0, no secure apps and Container Provide must have jQuery & Bootstrap on page before F2.
				src: [
					'sdk/src/template/header.js.tmpl',
					'sdk/src/third-party/json3.js',
					'sdk/src/third-party/eventemitter2.js',
					'<%= jshint.files %>',
					'sdk/src/template/footer.js.tmpl'
				],
				dest: 'sdk/packages/f2.basic.js'
			},
		},
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
			files: [
				'sdk/src/F2.js',
				'sdk/src/app_handlers.js',
				'sdk/src/classes.js',
				'sdk/src/constants.js',
				'sdk/src/events.js',
				'sdk/src/rpc.js',
				'sdk/src/ui.js',
				'sdk/src/container.js'
			]
		},
		uglify: {
			options: {
				preserveComments: 'some',
				banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("mm-dd-yyyy") %> - See below for copyright and license */\n'
			},
			dist: {
				files: {'sdk/f2.min.js' : ['sdk/f2.debug.js']},
				options: {
					report: 'min'
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
			},
			'package-no-jquery-or-bootstrap': {
				files: { 'sdk/packages/f2.no-jquery-or-bootstrap.min.js' : ['sdk/packages/f2.no-jquery-or-bootstrap.js'] },
				options: { report: 'min' }
			},
			'package-no-bootstrap': {
				files: { 'sdk/packages/f2.no-bootstrap.min.js' : ['sdk/packages/f2.no-bootstrap.js'] },
				options: { report: 'min' }
			},
			'package-no-easyXDM': {
				files: { 'sdk/packages/f2.no-easyXDM.min.js' : ['sdk/packages/f2.no-easyXDM.js'] },
				options: { report: 'min' }
			},
			'package-basic': {
				files: { 'sdk/packages/f2.basic.min.js' : ['sdk/packages/f2.basic.js'] },
				options: { report: 'min' }
			}
		},
		sourcemap: {
			options: {
				src: 'sdk/f2.min.js',
				prefix: 'sdk/'
			}
		},
		watch: {
			docs: {
				files: ['docs/src/**/*.*','package.json','docs/bin/gen-docs.js','!docs/src/template/head.html','!docs/src/template/nav.html','!docs/src/template/footer.html'],
				tasks: ['docs'],
				// tasks: ['generate-docs'],
				options: {
					spawn: false,
				}
			},
			scripts: {
				files: ['./sdk/src/**/*.js', '!./sdk/src/third-party/**/*.js'],
				tasks: ['js'],
				options: {
					spawn: false,
				}
			}
		},
		http: {
			getDocsLayout: {
				options: {
					url: 'http://www.openf2.org/api/layout/docs',
					json: true,
					strictSSL: false,
					callback: function(err, res, response){
						var log = grunt.log.write('Retrieved doc layout...')
						grunt.config.set('docs-layout',response);
						log.ok();
						log = grunt.log.write('Saving templates as HTML...');
						//save as HTML for gen-docs step
						grunt.file.write('./docs/src/template/head.html', response.head);
						grunt.file.write('./docs/src/template/nav.html', response.nav);
						grunt.file.write('./docs/src/template/footer.html', response.footer);
						log.ok();
					}
				}
			}
		}
	});

	// Register tasks
	grunt.registerTask('fix-sourcemap', 'Fixes the source map file', function() {
		var uglifyOptions = grunt.config('uglify.sourcemap.options'),
			options = grunt.config('sourcemap.options'),
			dest = uglifyOptions.sourceMap(options.src),
			rawMap = grunt.file.read(dest);

		rawMap = rawMap.replace(options.prefix, '');
		grunt.file.write(dest, rawMap);
	});

	grunt.registerTask('generate-docs', 'Generate docs', function() {
		var done = this.async(),
			log = grunt.log.write('Generating docs...');

		exec('node ' + path.join(__dirname, 'docs/bin/gen-docs'), function(err, stdout, stderr) {
			if (err) {
				grunt.log.error(err.message);
				grunt.fail.fatal('Docs generation aborted.');
				return;
			}
			grunt.log.write(stdout);
			log.ok();
			done();
		});
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
			function(error, result, code){
				if (error){
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
		
		var version = semver.valid(releaseType) ? releaseType : String(semver.inc(pkg.version, releaseType)).replace(/\-\w+$/, '');

		pkg.version = version;
		bower_pkg.version = version;
		
		pkg._releaseDate = new Date().toJSON();
		pkg._releaseDateFormatted = moment(pkg._releaseDate).format('D MMMM YYYY');

		grunt.file.write('./package.json', JSON.stringify(pkg, null, '\t'));
		grunt.file.write('./bower.json', JSON.stringify(bower_pkg, null, '\t'));
		grunt.config.set('pkg', pkg);
		

		grunt.task.run('version');
	});

	grunt.registerTask('version', 'Displays version information for F2', function() {
		grunt.log.writeln(grunt.template.process(
			'This copy of F2 is at version <%= version %> with a release date of <%= _releaseDateFormatted %>',
			{ data: pkg }
		));
	});

	grunt.registerTask('yuidoc', 'Builds the reference docs with YUIDocJS', function() {
		var done = this.async();
		var log = grunt.log.write('Generating reference docs...');

		// using YUIDoc within a grunt task OR using grunt-contrib-yuidoc results in a
		// this.parsedir error. See https://github.com/gruntjs/grunt-contrib-yuidoc/issues/33
		// the grunt-contrib-yuidoc folks blame it on yuidoc and the yuidoc folks blame it
		// on grunt-contrib-yuidoc (https://github.com/yui/yuidoc/issues/242)
		// it seems like its actually a grunt issue so for now using an external script seems
		// to work fine
		exec('node ' + path.join(__dirname, 'docs/bin/yuidocs.js'), function(err, stdout, stderr) {
			if (err) {
				grunt.log.error(err.message);
				grunt.fail.fatal('YUIDocs failed.');
				return;
			}
			grunt.log.error(stderr);
			grunt.log.write(stdout);
			log.ok();
			done();
		});
	});

	// Load plugins
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-http');

	grunt.registerTask('docs', ['http:getDocsLayout','generate-docs', 'yuidoc']);
	grunt.registerTask('github-pages', ['copy:github-pages', 'clean:github-pages']);
	grunt.registerTask('zip', ['compress', 'copy:F2-examples', 'clean:F2-examples']);
	grunt.registerTask('js', ['concat:dist', 'concat:no-third-party', 'uglify:dist', 'sourcemap', 'copy:f2ToRoot', 'copy:f2Dist']);
	grunt.registerTask('sourcemap', ['uglify:sourcemap', 'fix-sourcemap']);
	grunt.registerTask('packages', [
		'concat:no-jquery-or-bootstrap',
		'concat:no-bootstrap',
		'concat:no-easyXDM',
		'concat:basic',
		'uglify:package-no-jquery-or-bootstrap',
		'uglify:package-no-bootstrap',
		'uglify:package-no-easyXDM',
		'uglify:package-basic'
	]);
	grunt.registerTask('test', ['jshint', 'express', 'jasmine']);
	grunt.registerTask('test-live', ['jshint', 'express', 'express-keepalive']);
	grunt.registerTask('travis', ['test']);
	grunt.registerTask('default', ['test', 'js', 'docs', 'zip']);
	grunt.registerTask('build', ['js', 'docs', 'zip', 'packages', 'nuget'])
};
