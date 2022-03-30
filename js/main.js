require({
	basePath: '/js',
	paths: {
		bootstrap: '//maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min',
		F2: 'f2',
		highlightjs: 'thirdparty/highlight.min',
		jquery: '//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min',
		mousetrap: 'thirdparty/mousetrap',
		moment: 'thirdparty/moment.min'
	},
	shim: {
		bootstrap: {
			deps: ['jquery'],
			exports: 'jquery'
		}
	}
}, ['jquery', 'docs-amd', 'bootstrap'], function ($, docs) {
	var $pm = $('script[data-main][data-page]');

	if ($pm.length) {
		var pageModule = $pm.data('page');

		// require page-specific js
		$(function () {
			require([pageModule], function (page) {
				if (page && typeof page.initialize === 'function') {
					page.initialize();
				}
			});
		});
	}

	docs.initialize();
});
