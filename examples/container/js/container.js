$(function() {
	
	var containerAppHandlerToken = F2.AppHandlers.getToken();
	
	/**
	 * Init Container
	 */
	F2.init({
		UI:{
			Mask:{
				loadingIcon:'./img/ajax-loader.gif'
			}
		},
		supportedViews: [F2.Constants.Views.HOME, F2.Constants.Views.SETTINGS, F2.Constants.Views.REMOVE],
		secureAppPagePath: "secure.html" // this should go on a separate domain from index.html
	});
	
	// Define these prior to init
	F2.AppHandlers
	.on(
		containerAppHandlerToken,
		F2.AppHandlers.CONSTANTS.APP_CREATE_ROOT,
		function(appConfig)
		{
			appConfig.root = $("<section></section>").get(0);
		}
	)
	.on(
		containerAppHandlerToken,
		F2.AppHandlers.CONSTANTS.APP_RENDER_BEFORE,
		function(appConfig){
			F2.UI.hideMask(appConfig.instanceId, appConfig.root);
			$(appConfig.root).addClass("render-before-testing");			
		}
	)
	.on(
		containerAppHandlerToken,
		F2.AppHandlers.CONSTANTS.APP_RENDER,
		$("body").get(0)
	)
	.on(
		containerAppHandlerToken,
		F2.AppHandlers.CONSTANTS.APP_RENDER_AFTER,
		function(appConfig){			
			$(appConfig.root).addClass("render-after-testing");
			F2.UI.hideMask(appConfig.instanceId, appConfig.root);
		}
	);

	//listen for app symbol change events and re-broadcast
	F2.Events.on(
		F2.Constants.Events.APP_SYMBOL_CHANGE,
		function(data){
			F2.Events.emit(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, { symbol: data.symbol, name: data.name || "" });
		}
	);

	/**
	 * init symbol lookup in navbar
	 */
	$("#symbolLookup")
		.on('keypress', function(event) {
			if (event.keyCode == 13) {
				event.preventDefault();
			}
		})
		.autocomplete({
			autoFocus:true,
			minLength: 0,
			select: function (event, ui) {
				F2.Events.emit(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, { symbol: ui.item.value, name: ui.item.label });
			},
			source: function (request, response) {

				$.ajax({
					url: "http://dev.markitondemand.com/api/Lookup/jsonp",
					dataType: "jsonp",
					data: {
						input: request.term
					},
					success: function (data) {
						response($.map(data, function (item) {
							return {
								label: item.Name + " (" + item.Exchange + ")",
								value: item.Symbol
							}
						}));
					},
					open: function() {
						$(this).removeClass("ui-corner-all").addClass("ui-corner-top");
					},
					close: function() {
						$(this).removeClass("ui-corner-top").addClass("ui-corner-all");
					}
				});
			}
		});

});