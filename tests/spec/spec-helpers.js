var TEST_MANIFEST_URL = 'http://localhost:8080/F2/apps/test/hello-world',
	TEST_APP_ID = 'com_openf2_examples_javascript_helloworld',
	TEST_MANIFEST_URL2 = 'http://localhost:8080/F2/apps/test/market-news',
	TEST_APP_ID2 = 'com_openf2_examples_csharp_marketnews',
	TEST_MANIFEST_URL_HTTP_POST = 'http://localhost:8080/F2/apps/test/http-post',
	TEST_MANIFEST_URL_HTTP_XDOMAIN = 'http://localhost:8081/F2/apps/test/http-post',
	TEST_MANIFEST_URL3 = 'http://localhost:8080/F2/apps/test/hello-world-node',
	TEST_APP_ID3 = 'com_openf2_examples_nodejs_helloworld',
	TEST_PRELOADED_APP_ID = 'com_openf2_tests_preloaded',
	TEST_PRELOADED_MANIFEST_URL = 'http://localhost:8080/tests/apps/com_openf2_tests_preloaded/manifest.js'
;

/**
 * Reload F2 before each spec
 */
var beforeEachReloadF2 = function(callback) {
	beforeEach(function(done) {
		window.F2 = null;
		var head = (document.head || document.getElementsByTagName('head')[0]);
		var script = document.createElement('script');
		script.async = false;
		script.onload = script.onreadystatechange = function(e) {
			script = null;
			if (!window.F2) {
				throw new Error('F2 WAS NOT PROPERLY LOADED');
			}
			callback && callback();
			done();
		}
		script.src = '../dist/f2.js';
		head.appendChild(script);
	});
};

var afterEachDeleteTestScripts = function(callback) {
	afterEach(function(done) {
		var scripts = Array.from(document.querySelectorAll('script[src]') || []);
		var styles = Array.from(document.querySelectorAll('link[href]') || []);

		([].concat(scripts,styles)).forEach(s => {
			if (/tests/.test(s.src)) {
				s.parentNode.removeChild(s);
			}
		});
		callback && callback();
		done();
	});
}

/**
 *
 */
var itConditionally = function(condition, desc, func) {
	if (condition) {
		return jasmine.getEnv().it(desc, func);
	} else {
		var el = document.getElementById('tests-skipped');
		var count = Number(el.getAttribute('data-count')) + 1;
		el.innerHTML = 'Skipping ' + count + ' spec' + ((count > 1) ? 's' : '');
		el.setAttribute('data-count', count);
		el.style.display = 'block';
		return jasmine.getEnv().xit(desc, func);
	}
};

/**
 * Clean out the test fixture before each spec
 */
beforeEach(function() {
	var fixture = document.getElementById('test-fixture');
	while (fixture.firstChild) {
		fixture.removeChild(fixture.firstChild);
	}
});

/**
 * Adds .toLog matcher for checking for F2.log messages
 */
beforeEach(function() {

	jasmine.addMatchers({

		toLog: function(expectedMessage) {
return false;
			// // copy F2.log before overriding
			// var log = F2.log;
			// var result = false;
			// var suite = this;
			// var passedMessage;

			// F2.log = function(message) {
			// 	passedMessage = message;
			// };

			// // fire the test function which should call the F2.log override above
			// suite.actual();

			// result = passedMessage == expectedMessage;

			// if (!result) {
			// 	suite.message = function() {
			// 		if (!passedMessage) {
			// 			return 'Expected function ' + (suite.isNot ? 'not' : '') + 'to pass \'' + expectedMessage + '\' to F2.log, but nothing was passed.';
			// 		} else {
			// 			return 'Expected function ' + (suite.isNot ? 'not' : '') + 'to pass \'' + expectedMessage + '\' to F2.log, but \'' + passedMessage + '\' was passed.';
			// 		}
			// 	};
			// }

			// // return F2.log to its original state
			// F2.log = log;

			// return result;
		}

	});
});