 // Define some globals for the tests
 DEFAULT_TIMEOUT = 5000;

 require.config({
 	paths: {
 		'domReady': 'vendor/domReady',
 		// Jasmine
 		'jasmine': 'vendor/jasmine-1.3.1/jasmine',
 		'jasmine-async': 'vendor/jasmine-1.3.1/jasmine.async.min',
 		'jasmine-html': 'vendor/jasmine-1.3.1/jasmine-html',
 		'console-reporter': 'vendor/console-runner',
 		// F2
 		'F2': '../build/f2',
 		// Preloaded Apps
 		'com_test_placeholder': 'js/apps/com_test_placeholder'
 	},
 	shim: {
 		'jasmine': {
 			exports: 'jasmine'
 		},
 		'jasmine-async': {
 			deps: ['jasmine'],
 			exports: 'AsyncSpec'
 		},
 		'jasmine-html': {
 			deps: ['jasmine'],
 			exports: 'jasmine.HtmlReporter'
 		},
 		'console-reporter': {
 			deps: ['jasmine'],
 			exports: 'jasmine.ConsoleReporter'
 		}
 	}
 });

 require([
 	// Jasmine
 	'jasmine',
 	'jasmine-html',
 	'console-reporter',
 	// Jasmine Specs
 	'js/specs/appPlaceholders.spec.js',
 	'js/specs/globals.spec.js',
 	'js/specs/amd.spec.js',
 	'js/specs/f2.events.spec.js',
 	'js/specs/f2.ui.spec.js',
 	'js/specs/f2.spec.js',
 	'js/specs/f2.schemas.spec.js',
 	// Util
 	'domReady!',
 	'jasmine-async'
 ], function(jasmine, HtmlReporter, ConsoleReporter) {

 	var jasmineEnv = jasmine.getEnv();
 	jasmineEnv.updateInterval = 1000;

 	var htmlReporter = new HtmlReporter();

 	jasmineEnv.addReporter(new ConsoleReporter());
 	jasmineEnv.addReporter(htmlReporter);

 	jasmineEnv.specFilter = function(spec) {
 		return htmlReporter.specFilter(spec);
 	};

 	// allow F2 to be reloaded on the fly
 	window.F2_TESTING_MODE = true;

 	// defined by the node test server, if it is running
 	if (typeof window.F2_NODE_TEST_SERVER === 'undefined') {
 		window.F2_NODE_TEST_SERVER = false; // just so we don't need to check for 'undefined' elsewhere
 		document.getElementById('test-server-failure').style.display = 'block';
 	}

 	jasmineEnv.execute();

 });
