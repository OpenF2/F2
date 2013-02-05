define(
	[
		'/sdk/f2.min.js'
	],
	
	function(F2) {

		/**
		 * Init Container
		 */
		F2.init({

			afterAppRender: function (app, html) {
				var el = $(app.root).append(html);
				F2.UI.hideMask(app.instanceId, el);
				return el;
			},

			beforeAppRender: function(app) {

				var hasSettings = F2.inArray(F2.Constants.Views.SETTINGS, app.views);
				var hasHelp = F2.inArray(F2.Constants.Views.HELP, app.views);
				var hasAbout = F2.inArray(F2.Constants.Views.ABOUT, app.views);
				var showDivider = hasSettings || hasHelp || hasAbout;
				var gridWidth = app.minGridSize || 3;

				var appRoot = $([
					'<section class="' + F2.Constants.Css.APP + ' span' + gridWidth + '">',
						'<header class="clearfix">',
							'<h2 class="pull-left ', F2.Constants.Css.APP_TITLE, '">', app.name.toUpperCase(), '</h2>',
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
				].join('')).appendTo($('#mainContent div.row'));

				// show loader
				F2.UI.showMask(app.instanceId, appRoot, true);

				return appRoot;
			},

			UI:{
				Mask:{
					loadingIcon:'./img/ajax-loader.gif'
				}
			},

			supportedViews: [F2.Constants.Views.HOME, F2.Constants.Views.SETTINGS, F2.Constants.Views.REMOVE],
			secureAppPagePath: "secure.html" // this should go on a separate domain from index.html
		});

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
	}

);
