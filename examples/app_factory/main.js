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

	var token = F2.onetimeToken();

	// Pick up the placeholders
	F2.loadPlaceholders();

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
		},
		'com_example_d': {
			appId: 'com_example_d',
			manifestUrl: 'com_example_d.json'
		}
	};

	F2.on(token, 'unload', function(root) {
		$(root).parent().remove();
		F2.unload(root);
	});

	// Add some events for loading apps
	$('.page-header').on('click', '[data-load]', function(e) {
		var target = e.currentTarget;
		var appId = target.getAttribute('data-load');

		if (appId in appConfigs) {
			F2.load([appConfigs[appId]], function(manifests) {
				$('.app-container').append(
					$('<div class="bucket col-md-4" />').append(manifests[0].root)
				);
			});
		}
	});

});
