(function(){
	require.config({
		paths: {
			'domReady': 'vendor/requirejs-domready/domready',
			'F2': '/build/f2'
		}
	});

	require([
		'js/perf/PerfHelpers.js',
		'js/perf/F2.perf.js',
		'js/perf/F2.Events.perf.js'
		// Other than PerfHelpers, it should just be the data from their
		// performance tests to pass to D3 or whatever.
		], function(PerfHelpers, Core, Events) {
			var CoreResults = Core.run();
		});
})()