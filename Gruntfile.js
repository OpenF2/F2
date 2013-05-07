module.exports = function(grunt) {

	// core files that make up F2
	var CORE_FILES = [
		'sdk/src/F2.js',
		'sdk/src/app_handlers.js',
		'sdk/src/classes.js',
		'sdk/src/constants.js',
		'sdk/src/events.js',
		'sdk/src/rpc.js',
		'sdk/src/ui.js',
		'sdk/src/container.js'
	];

	// Project config
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				process: { data: '<%= pkg %>' },
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
	
	grunt.registerTask('js', ['jshint', 'concat', 'uglify:dist', 'sourcemap']);
	grunt.registerTask('sourcemap', ['uglify:sourcemap', 'fix-sourcemap']);

	// the default task
	grunt.registerTask('default', ['js']);
};