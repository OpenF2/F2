var TEST_MANIFEST_URL = 'http://localhost:8080/F2/apps/test/hello-world',
	TEST_APP_ID = 'com_openf2_examples_javascript_helloworld',
	TEST_MANIFEST_URL2 = 'http://localhost:8080/F2/apps/test/market-news',
	TEST_APP_ID2 = 'com_openf2_examples_csharp_marketnews',
	TEST_MANIFEST_URL_HTTP_POST = 'http://localhost:3000/F2/apps/test/http-post',
	TEST_MANIFEST_URL_HTTP_XDOMAIN =
		'http://localhost:8081/F2/apps/test/http-post',
	TEST_MANIFEST_URL3 = 'http://localhost:8080/F2/apps/test/hello-world-node',
	TEST_APP_ID3 = 'com_openf2_examples_nodejs_helloworld',
	TEST_PRELOADED_APP_ID = 'com_openf2_tests_preloaded',
	TEST_PRELOADED_MANIFEST_URL =
		'http://localhost:8080/tests/apps/com_openf2_tests_preloaded/manifest.js';
/**
 * Clean out the test fixture before each spec
 */
beforeEach(function () {
	var fixture = document.getElementById('test-fixture');
	while (fixture.firstChild) {
		fixture.removeChild(fixture.firstChild);
	}
});

/**
 * Reload F2 before each spec
 */
var beforeEachReloadF2 = function (callback) {
	beforeEach(function (done) {
		console.info('beforeEachReloadF2: start');
		window.F2 = null;
		var head = document.head || document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		head.appendChild(script);
		script.async = false;
		script.onerror = function (e) {
			console.error('F2 FAILED TO LOAD: ' + e.message);
			throw new Error('F2 FAILED TO LOAD: ' + e.message);
		};
		script.onload = script.onreadystatechange = function (e) {
			script = null;
			if (!window.F2) {
				console.error('F2 WAS NOT PROPERLY LOADED');
				throw new Error('F2 WAS NOT PROPERLY LOADED');
			}
			console.info('beforeEachReloadF2: end');
			callback && callback();
			done();
		};
		script.src = '../dist/f2.js';
	});
};
// go ahead and attach a beforeEach everywhere while allowing this function to
// be called manually as necessary
beforeEachReloadF2();

/**
 * Delete all test apps after each spec
 */
afterEach(function (done) {
	var scripts = Array.from(document.querySelectorAll('script[src]') || []);

	[].concat(scripts).forEach((s) => {
		if (/tests\/apps/.test(s.src)) {
			s.parentNode.removeChild(s);
		}
	});

	done();
});
