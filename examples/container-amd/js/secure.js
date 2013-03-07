require(
	{
		basePath: 'js',
		paths: {
			'bootstrap': 'bootstrap.min',
			'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min',
			'F2': '../../../sdk/f2.debug'
		},
		shim: {
			'bootstrap': {
				deps: ['jquery'],
				exports: 'jQuery'
			}
		}
	},
	[
		'jquery',
		'F2',
		'bootstrap'
	],
	function($, F2) {

		// wait for DOM ready
		$(function() {
			// init Container
			F2.init({
				appRender:function(appContext, html) {
					return [
						'<div class="span4">',
							html,
						'</div>'
					].join('');
				},
				afterAppRender:function(appContext, html) {
					return $(html).appendTo("#mainContent div.row:first");
				},
				isSecureAppPage:true,
				supportedViews:[F2.Constants.Views.HOME]
			});
		});
	}
);