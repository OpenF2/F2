require(
	{
		basePath: 'js',
		paths: {
			'bootstrap': 'bootstrap.min',
			'jquery': '//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min',
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
			//get AppHandler token
			var _token = F2.AppHandlers.getToken();
			//create & assign a "root" element for the App
			F2.AppHandlers.on(_token,F2.Constants.AppHandlers.APP_CREATE_ROOT,function(appConfig) {
				appConfig.root = $('div.row','#mainContent').addClass(F2.Constants.Css.APP).get(0);
			});
			//render the App
			F2.AppHandlers.on(_token,F2.Constants.AppHandlers.APP_RENDER,function(appConfig, html) {
				var gridSize = appConfig.minGridSize || 4;
					gridSize = 'span' + gridSize;
				$(appConfig.root).append('<div class="'+gridSize+'">'+html+'</div>');
			});
			// init Container
			F2.init({
				isSecureAppPage:true,
				debugMode: true,
				UI:{
					Mask:{
						loadingIcon:'./img/ajax-loader.gif'
					}
				},
				supportedViews:[F2.Constants.Views.HOME]
			});
		});
	}
);