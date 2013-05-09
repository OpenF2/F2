module.exports = function(grunt) {

	var f2Info = require('./build/F2.json'),
		CORE_FILES = [
			'sdk/src/F2.js',
			'sdk/src/app_handlers.js',
			'sdk/src/classes.js',
			'sdk/src/constants.js',
			'sdk/src/events.js',
			'sdk/src/rpc.js',
			'sdk/src/ui.js',
			'sdk/src/container.js'
		],
		pkg = grunt.file.readJSON('package.json');

	// Project config
	grunt.initConfig({
		pkg: pkg,
		concat: {
			options: {
				process: { data: pkg },
				separator: '\n',
				stripBanners: false
			},
			'no-third-party': {
				src: [
					'sdk/src/template/header.js.tmpl',
					CORE_FILES,
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
					CORE_FILES,
					'sdk/src/template/footer.js.tmpl'
				],
				dest: 'sdk/f2.debug.js'
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			files: CORE_FILES
		},
		uglify: {
			options: {
				preserveComments: function(node, comment) {
					return /^!/.test(comment.value);
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
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	// Register tasks
	grunt.registerTask('fix-sourcemap', 'Fixes the source map file', function() {
		var uglifyOptions = grunt.config('uglify.sourcemap.options'),
			options = grunt.config('sourcemap.options'),
			dest = uglifyOptions.sourceMap(options.src),
			rawMap = grunt.file.read(dest);
		
		rawMap = rawMap.replace(options.prefix, '');
		grunt.file.write(dest, rawMap);
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
			grunt.log.writeln('YUIDoc compilation complete');
			done();
		});
	});
	


	grunt.registerTask('docs', ['yuidoc']);
	grunt.registerTask('js', ['jshint', 'concat', 'uglify:dist', 'sourcemap']);
	grunt.registerTask('sourcemap', ['uglify:sourcemap', 'fix-sourcemap']);

	// the default task
	grunt.registerTask('default', ['js', 'docs']);
};