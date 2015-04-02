var TEST_MANIFEST_URL = 'http://localhost:8080/F2/apps/test/hello-world',
	TEST_APP_ID = 'com_openf2_examples_javascript_helloworld',
	TEST_MANIFEST_URL2 = 'http://localhost:8080/F2/apps/test/market-news',
	TEST_APP_ID2 = 'com_openf2_examples_csharp_marketnews',
	TEST_MANIFEST_URL_HTTP_POST = 'http://localhost:8080/F2/apps/test/http-post'
	TEST_MANIFEST_URL3 = 'http://localhost:8080/F2/apps/test/hello-world-node',
	TEST_APP_ID3 = 'com_openf2_examples_nodejs_helloworld'
;

/**
 * Addition to Jasmine Async that reloads F2
 */
AsyncSpec.prototype.beforeEachReloadF2 = function(callback) {
	this.beforeEach(function(done) {
		window.F2 = null;
		window.F2 = window.F2 || { Apps:{} };
		$.ajax({
			url: '../sdk/f2.min.js',
			dataType: 'script',
			complete: function() {
				callback && callback();
				done();
			}
		});
	});
};

/**
 *
 */
itConditionally = function(condition, desc, func) {
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
	$('#test-fixture').empty();
});

/**
 * Adds .toLog matcher for checking for F2.log messages
 */
beforeEach(function() {

	this.addMatchers({

		toLog: function(expectedMessage) {

			// copy F2.log before overriding
			var log = F2.log;
			var result = false;
			var suite = this;
			var passedMessage;
			
			F2.log = function(message) {
				passedMessage = message;
			};

			// fire the test function which should call the F2.log override above
			suite.actual();

			result = passedMessage == expectedMessage;

			if (!result) {
				suite.message = function() {
					if (!passedMessage) {
						return 'Expected function ' + (suite.isNot ? 'not' : '') + 'to pass \'' + expectedMessage + '\' to F2.log, but nothing was passed.';
					} else {
						return 'Expected function ' + (suite.isNot ? 'not' : '') + 'to pass \'' + expectedMessage + '\' to F2.log, but \'' + passedMessage + '\' was passed.';
					}
				};
			}

			// return F2.log to its original state
			F2.log = log;

			return result;
		}

	});
});