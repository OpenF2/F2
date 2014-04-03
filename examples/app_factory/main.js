require.config({
	map: {
		'*': {
			// Alias to the specific version
			'jquery-2.1': 'jquery'
		}
	},
	paths: {
		'F2': '../../build/f2',
		'jquery': '../../vendor/jquery/dist/jquery',
		'moment': '../../vendor/moment/moment'
	}
});

require(['F2', 'jquery'], function(F2, $) {

	var appConfigs = {
		'com_example_a': {
			appId: 'com_example_a',
			manifestUrl: 'com_example_a.json'
		},
		'com_example_b': {
			appId: 'com_example_b',
			manifestUrl: 'com_example_b.json'
		},
		'com_example_c': {
			appId: 'com_example_c',
			manifestUrl: 'com_example_c.json'
		}
	};

	// Pick up the placeholders
	F2.loadPlaceholders();

	// Find the first available place we can place an app
	function getAvailableBucket() {
		var $buckets = $('.bucket');

		for (var i = 0; i < $buckets.length; i++) {
			var $bucket = $buckets.eq(i);
			if (!$bucket.children().length) {
				return $bucket;
			}
		}
	}

	// Add some events for loading apps
	$('.page-header').on('click', '[data-load]', function(e) {
		var target = e.currentTarget;
		var appId = target.getAttribute('data-load');
		var $bucket = getAvailableBucket();

		if (appId in appConfigs && $bucket) {
			F2.load([appConfigs[appId]], function(manifests) {
				$bucket.append(manifests[0].root);
			});
		}
	});

});
