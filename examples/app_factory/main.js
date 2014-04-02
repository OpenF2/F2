require.config({
	map: {
		'*': {
			'jquery-2.1': 'jquery'
		}
	},
	paths: {
		'F2': '../../build/f2',
		'jquery': '../../vendor/jquery/dist/jquery'
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

	// Add some events for loading apps
	$('.page-header').on('click', '[data-load]', function(e) {
		var target = e.currentTarget;
		var appId = target.getAttribute('data-load');

		if (appId in appConfigs) {
			F2.load([appConfigs[appId]], function(manifests) {
				// Add the app to the first empty space
				$('.bucket').each(function(i, node) {
					var $node = $(node);

					if (!$node.html().trim()) {
						$node.append(manifests[0].root);
						return false;
					}
				});
			});
		}
	});

});
