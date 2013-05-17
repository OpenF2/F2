module.exports = function(grunt) {

	var f2Info = require('./build/F2.json'),
		handlebars = require('Handlebars'),
		pkg = grunt.file.readJSON('package.json');

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
		clean: ['docs/src-temp'],
		copy: {
			docs: {
				files: [
					{
						expand: true,
						cwd: 'docs/src/',
						src: ['**'],
						dest: 'docs/src-temp/',
						filter: function(src) {
							return (/(.html|.md)$/i).test(src);
						}
					}
				],
				options: {
					processContent: function(content, srcpath) {
						// TODO: Remove Handlebars dependency and use the built-in grunt templating
						// compile and run the Handlebars template
						return (handlebars.compile(content))(f2Info);
					}
				}
			}
		},
		concat: {
			options: {
				process: { data: pkg },
				separator: '\n',
				stripBanners: false
			},
			'no-third-party': {
				src: [
					'sdk/src/template/header.js.tmpl',
					'<%= jshint.files %>',
					'sdk/src/template/footer.js.tmpl'
				],
				dest: 'sdk/f2.no-third-party.js'
			},
			dist: {
				src: [
					'sdk/src/template/header.js.tmpl',
					'sdk/src/third-party/json2.js',
					'sdk/src/third-party/jquery.js',
					'sdk/src/third-party/bootstrap-modal.js',
					'sdk/src/third-party/jquery.noconflict.js',
					'sdk/src/third-party/eventemitter2.js',
					'sdk/src/third-party/easyXDM/easyXDM.js',
					'<%= jshint.files %>',
					'sdk/src/template/footer.js.tmpl'
				],
				dest: 'sdk/f2.debug.js'
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
				preserveComments: function(node, comment) {
					return (/^!/).test(comment.value);
				}
			},
			dist: {
				files: {'sdk/f2.min.js' : ['sdk/f2.debug.js']},
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
		}
	});

	// Load plugins
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jasmine');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-uglify');
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
			version: grunt.package.version,
			docsVersion: grunt.package.version,
			docsLastUpdateDateFormatted: f2Info.docs.lastUpdateDateFormatted,
			branch: f2Info.branch
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
		Y.Handlebars.registerHelper('htmlTitle',function () {
			var name  = this.displayName || this.name,
					title = name;

			if (title) {
				title = 'F2 - ' + title;
			} else {
				title = 'F2 - The Open Financial Framework';
			}

			return title;
		});

		// insert readme markdown
		Y.Handlebars.registerHelper('readme', function() {
			return builder.markdown(readmeMd, true);	
		});

		builder = new Y.DocBuilder(docOptions, json);
		builder.compile(function() {
			log.ok();
			done();
		});
	});
	


	grunt.registerTask('docs', ['less', 'yuidoc', 'copy:docs', 'markitdown', 'clean']);
	grunt.registerTask('js', ['jshint', 'concat', 'uglify:dist', 'sourcemap']);
	grunt.registerTask('sourcemap', ['uglify:sourcemap', 'fix-sourcemap']);
	grunt.registerTask('test', ['jshint', 'express', 'jasmine'/*, 'express-keepalive'*/]);

	// the default task
	grunt.registerTask('default', ['js', 'docs']);
};