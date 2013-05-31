$(function() {
	
	var containerAppHandlerToken = F2.AppHandlers.getToken();

	var appCreateRootFunc = function(appConfig) {
		var hasSettings = F2.inArray(F2.Constants.Views.SETTINGS, appConfig.views);
		var hasHelp = F2.inArray(F2.Constants.Views.HELP, appConfig.views);
		var hasAbout = F2.inArray(F2.Constants.Views.ABOUT, appConfig.views);
		var showDivider = hasSettings || hasHelp || hasAbout;
		var gridWidth = appConfig.minGridSize || 3;

		appConfig.root = $([
			'<section class="' + F2.Constants.Css.APP + ' span' + gridWidth + '" data-grid-width="' + gridWidth + '">',
				'<header class="clearfix">',
					'<h2 class="pull-left ', F2.Constants.Css.APP_TITLE, '">', appConfig.name.toUpperCase(), '</h2>',
					'<div class="btn-group pull-right">',
						'<button class="btn btn-mini btn-link dropdown-toggle" data-toggle="dropdown">',
							'<i class="icon-cog"></i>',
						'</button>',
						'<ul class="dropdown-menu">',
							hasSettings ? '<li><a href="#" class="' + F2.Constants.Css.APP_VIEW_TRIGGER + '" ' + F2.Constants.Views.DATA_ATTRIBUTE + '="' + F2.Constants.Views.SETTINGS + '">Edit Settings</a></li>' : '',
							hasHelp ? '<li><a href="#" class="' + F2.Constants.Css.APP_VIEW_TRIGGER + '" ' + F2.Constants.Views.DATA_ATTRIBUTE + '="' + F2.Constants.Views.HELP + '">Help</a></li>' : '',
							hasAbout ? '<li><a href="#" class="' + F2.Constants.Css.APP_VIEW_TRIGGER + '" ' + F2.Constants.Views.DATA_ATTRIBUTE + '="' + F2.Constants.Views.ABOUT + '">About</a></li>' : '',
							showDivider ? '<li class="divider"></li>' : '',
							'<li><a href="#" class="' + F2.Constants.Css.APP_VIEW_TRIGGER + '" ' + F2.Constants.Views.DATA_ATTRIBUTE + '="' + F2.Constants.Views.REMOVE + '">Remove App</a></li>',
						'</ul>',
					'</div>',
				'</header>',
			'</section>'
		].join('')).get(0);			
	};

	var appRenderFunc = function(appConfig, app) {

		var gridWidth = appConfig.minGridSize || 3;
		
		// find a row that can fit this app
		var row;
		$('#mainContent div.row').each(function(i, el) {
			var span = 0;
			$('.f2-app', el).each(function(j, app) {
				span += Number($(app).data('gridWidth'));
			});
			if (span <= (12 - gridWidth)) {
				row = el;
				return false;
			}
		});
		// create a new row if one wasn't found
		if (row === undefined) {
			row = $('<div class="row"></div>').appendTo('#mainContent');
		}
		// append app to app root and also to row
		$(appConfig.root).append(app).appendTo(row);
	};

	var appRenderCompleteFunc = function(appConfig) {
		F2.UI.hideMask(appConfig.instanceId, appConfig.root);
	};

	var appDestroyFunc = function(appInstance) {
		if(!appInstance) { return; }
		
		// call the apps destroy method, if it has one
		if(appInstance.app && appInstance.app.destroy && typeof(appInstance.app.destroy) == 'function'){
			appInstance.app.destroy();
		}
		// warn the container developer/app developer that even though they have a destroy method it hasn't been called
		else if(appInstance.app && appInstance.app.destroy){
			F2.log(appInstance.appId + ' has a Destroy property, but Destroy is not of type function and as such will not be executed.');
		}
		
		// fade out and remove the root
		jQuery(appInstance.config.root).fadeOut(250, function() {
			jQuery(this).remove();
		});
	};
	/**
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 */

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
		secureAppPagePath: 'secure.html' // this should go on a separate domain from index.html
	});
		
	// Define these prior to calling F2.registerApps
	/*
	F2.AppHandlers
		.on(containerAppHandlerToken, F2.Constants.AppHandlers.APP_CREATE_ROOT, 	appCreateRootFunc)
		.on(containerAppHandlerToken, F2.Constants.AppHandlers.APP_RENDER, 			appRenderFunc)
		.on(containerAppHandlerToken, F2.Constants.AppHandlers.APP_RENDER_AFTER, 	appRenderCompleteFunc)
		.on(containerAppHandlerToken, F2.Constants.AppHandlers.APP_DESTROY,			appDestroyFunc)
	;*/
	
	//listen for app symbol change events and re-broadcast
	F2.Events.on(F2.Constants.Events.APP_SYMBOL_CHANGE,function(data) {
		F2.Events.emit(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, { symbol: data.symbol, name: data.name || '' });
	});

	/**
	 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
	 */

	/**
	 * init symbol lookup in navbar
	 */
	$('#symbolLookup')
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
					url: 'http://dev.markitondemand.com/api/Lookup/jsonp',
					dataType: 'jsonp',
					data: {
						input: request.term
					},
					success: function (data) {
						response($.map(data, function (item) {
							return {
								label: item.Name + ' (' + item.Exchange + ')',
								value: item.Symbol
							};
						}));
					},
					open: function() {
						$(this).removeClass('ui-corner-all').addClass('ui-corner-top');
					},
					close: function() {
						$(this).removeClass('ui-corner-top').addClass('ui-corner-all');
					}
				});
			}
		});

});