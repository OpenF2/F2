(function() {

	var jasmineEnv = jasmine.getEnv();
	jasmineEnv.updateInterval = 1000;

	var htmlReporter = new jasmine.HtmlReporter();

	jasmineEnv.addReporter(htmlReporter);

	jasmineEnv.specFilter = function(spec) {
		return htmlReporter.specFilter(spec);
	};

	jasmine.getEnv().addReporter(new jasmine.TrivialReporter());

	var console_reporter = new jasmine.ConsoleReporter()
	jasmine.getEnv().addReporter(console_reporter);

	var currentWindowOnload = window.onload;

	window.onload = function() {
		if (currentWindowOnload) {
			currentWindowOnload();
		}
		execJasmine();
	};

	function execJasmine() {
		// allow F2 to be reloaded on the fly
		window.F2_TESTING_MODE = true;

		// defined by the node test server, if it is running
		if (typeof window.F2_NODE_TEST_SERVER === 'undefined') {
			window.F2_NODE_TEST_SERVER = false; // just so we don't need to check for 'undefined' elsewhere
			document.getElementById('test-server-failure').style.display = 'block';
		}

		jasmineEnv.execute();
	}

})();