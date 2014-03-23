(function() {

	require.config({
		urlArgs: 'cb=' + Math.random(),
		paths: {
			'domReady': '/vendor/requirejs-domready/domready',
			'F2': '/build/f2',
			'jasmine': '/vendor/jasmine/lib/jasmine-core/jasmine',
			'jasmine-boot': '/vendor/jasmine/lib/jasmine-core/boot/boot',
			'jasmine-html': '/vendor/jasmine/lib/jasmine-core/jasmine-html',
			'jasmine-console': '/vendor/jasmine/lib/console/console',
			// Preloaded Apps
			'com_test_placeholder': '/tests/js/apps/com_test_placeholder'
		},
		shim: {
			'jasmine': {
				exports: 'jasmine'
			},
			'jasmine-html': {
				deps: ['jasmine'],
				exports: 'jasmineRequire'
			},
			'jasmine-boot': {
				deps: ['jasmine', 'jasmine-html'],
				exports: 'jasmine'
			},
			'jasmine-console': {
				deps: ['jasmine', 'jasmine-html', 'jasmine-boot'],
				exports: 'getJasmineRequireObj'
			}
		}
	});

	require([
		'jasmine-boot',
		'jasmine-console',
		'domReady!'
	], function(jasmine, getJasmineRequireObj) {
		jasmine.DEFAULT_TIMEOUT_INTERVAL = 3000;

		// Pull in all the specs
		require([
			'/tests/js/specs/appPlaceholders.spec.js',
			'/tests/js/specs/globals.spec.js',
			'/tests/js/specs/f2.events.spec.js',
			'/tests/js/specs/f2.ui.spec.js',
			'/tests/js/specs/f2.spec.js',
			'/tests/js/specs/f2factory.spec.js',
			'/tests/js/specs/f2.schemas.spec.js'
		], function() {
			var callPhantomFunc = window.callPhantom || window.parent.callPhantom;

			if (callPhantomFunc) {
				var print = function(message) {
					callPhantomFunc({
						message: 'jasminelog',
						data: {
							message: message
						}
					});
				};

				var consoleReporterConstructor = getJasmineRequireObj().ConsoleReporter();
				var consoleReporter = new consoleReporterConstructor({
					print: print,
					timer: new window.jasmine.Timer()

				});

				window.jasmine.getEnv().addReporter(consoleReporter);
			}

			window.onload();
		});
	});

})();
