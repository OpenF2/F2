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
			'docs': {
				options: { force: true },
				src: ['./docs/dist']
			},
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
			'docs': {
				files: [
					{
						expand: true,
						flatten: true,
						src: [
							'sdk/*.js',
							'sdk/*.map'
						],
						dest: 'docs/dist/js/'
					},
					{
						cwd: 'docs/src',
						expand: true,
						src: [
							'img/**/*',
							'fonts/**/*',
							'apps/**/*',
							'js/**/*'
						],
						dest: 'docs/dist/'
					},
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
						cwd: 'dist/',
						src: ['**'],
						dest: 'dist/'
					}
				]
			}
		},
		express: {
			docs: {
				options: {
					bases: [path.resolve('./docs/dist')]
				}
			},
			server: {
				options: {
					bases: './',
					port: 8080,
					server: path.resolve('./tests/server')
				}
			},
			// this is a duplicate of the above ^^^ to allow for testing cross origin
			// requests (GET/JSONP vs POST/JSON)
			server2: {
				options: {
					bases: './',
					port: 8081,
					server: path.resolve('./tests/server')
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
				jshintrc: true
			},
			files: [
				'src/**/*.js'
			]
		},
		less: {
			production: {
				options: {
					paths: [
						'docs/src/css/less',
					],
					modifyVars: {
						imgPath: '',
						version: '<%= pkg.version %>'
					},
					compress: true,
					sourceMap: true,
					sourceMapURL: '/css/site.css.map',
					banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> Copyright Markit On Demand, Inc. */\n'
				},
				files: {
					'docs/dist/css/site.css': 'docs/src/css/less/site.less'
				}
			}
		},
		watch: {
			docs: {
				files: ['docs/src/**/*.*','package.json','docs/bin/gen-docs.js'],
				tasks: ['docs'],
				options: {
					spawn: false
				}
			},
			scripts: {
				files: ['./src/**/*.js'],
				tasks: ['js'],
				options: {
					spawn: false
				}
			}
		},
		webpack: {
			prod: require('./webpack.config.js')
		}
	});

	// Register tasks
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
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-express');
	grunt.loadNpmTasks('grunt-webpack');

	grunt.registerTask('docs', ['clean:docs','less','generate-docs', 'yuidoc', 'copy:docs']);
	grunt.registerTask('docs-dev', ['docs', 'express:docs', 'watch:docs'/*,'express-keepalive'*/]);
	grunt.registerTask('github-pages', ['copy:github-pages', 'clean:github-pages']);
	grunt.registerTask('zip', ['compress', 'copy:F2-examples', 'clean:F2-examples']);
	grunt.registerTask('test', ['jshint', 'express:server', 'express:server2', 'jasmine']);
	grunt.registerTask('test-live', ['jshint', 'express:server', 'express:server2', 'express-keepalive']);
	grunt.registerTask('travis', ['test']);
	grunt.registerTask('default', ['webpack', 'test']);
	grunt.registerTask('build', ['webpack', 'test', 'docs', 'zip'])
};
