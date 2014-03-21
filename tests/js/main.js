(function() {

	require.config({
		urlArgs: 'cb=' + Math.random(),
		paths: {
			'domReady': '/vendor/requirejs-domready/domready',
			'F2': '/build/f2',
			'jasmine': '/vendor/jasmine/lib/jasmine-core/jasmine',
			'jasmine-boot': '/vendor/jasmine/lib/jasmine-core/boot/boot',
			'jasmine-html': '/vendor/jasmine/lib/jasmine-core/jasmine-html',
			// Preloaded Apps
			'com_test_placeholder': '/tests/js/apps/com_test_placeholder'
		},
		shim: {
			'jasmine': {
				exports: 'jasmine'
			},
			'jasmine-html': {
				deps: ['jasmine']
			},
			'jasmine-boot': {
				deps: ['jasmine-html']
			}
		}
	});

	require([
		'jasmine-boot',
		'domReady!'
	], function() {
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
			// Kick jasmine into gear
			// http://stackoverflow.com/questions/19240302/does-jasmine-2-0-really-not-work-with-require-js
			window.onload();
		});
	});

})();
