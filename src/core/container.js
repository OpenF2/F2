/**
 * Core Container functionality
 * @module f2
 * @class F2
 */
F2.extend("", (function(){

	var _apps = {};
	var _config = {};
	var _hasSocketConnections = false;
	var _isInit = false;
	var _sockets = [];

	// init EventEmitter
	var _events = new EventEmitter2({
		wildcard:true
	});

	// unlimited listeners, set to > 0 for debugging
	_events.setMaxListeners(0);

	// handle APP_HEIGHT_CHANGE event
	_events.on(F2.Constants.Events.APP_HEIGHT_CHANGE, function(obj) {
		//F2.log("Updating height for " + obj.instanceId + " (" + obj.height + ")");
		$("#" + obj.instanceId).find("iframe").height(obj.height);
	});

	// Override the emit function so that events can be passed down into iframes
	_events.emit = function() {
		if (_hasSocketConnections) {
			for (var i = 0, len = _sockets.length; i < len; i++) {
				_sockets[i].postMessage(F2.stringify([].slice.call(arguments)));
			}
		}
		//F2.log([_hasSocketConnections, location.href, arguments]);
		EventEmitter2.prototype.emit.apply(this, arguments);
	};

	/**
	 * Creates a socket connection from the App to the Container
	 * @method _createAppToContainerSocket
	 * @private
	 * @see The <a href="http://easyxdm.net" target="_blank">easyXDM</a> project.
	 */
	var _createAppToContainerSocket = function() {

		var socketLoad = new RegExp("^" + F2.Constants.Events.SOCKET_LOAD);
		var isLoaded = false;
		var socket = new easyXDM.Socket({
			onMessage: function(message, origin){

				if (!isLoaded && socketLoad.test(message)) {
					message = message.replace(socketLoad, "");
					var appParts = JSON.parse(message);

					// make sure we have the App and AppAssets
					if (appParts.length == 2) {
						var app = appParts[0];
						var appAssets = appParts[1];

						// save app
						_apps[app.instanceId] = {
							app:app
						};

						F2.loadApp(app, appAssets);
						isLoaded = true;
					}
				} else {
					var eventArgs = JSON.parse(message);
					//F2.log(eventArgs);
					// do not call F2.Events.emit here, otherwise a circular message will occur
					EventEmitter2.prototype.emit.apply(F2.Events, eventArgs);
				}
			}
		});

		if (socket != null) {
			_sockets.push(socket);
			_hasSocketConnections = true;
		}
	};

	/**
	 * Creates a socket connection from the Container to the App using easyXDM
	 * @method _createContainerToAppSocket
	 * @private
	 * @see The <a href="http://easyxdm.net" target="_blank">easyXDM</a> project.
	 * @param {F2.App} app The App object
	 * @param {F2.AppAssets} appAssets The AppAssets object
	 */
	var _createContainerToAppSocket = function(app, appAssets) {

		var container = $("#" + app.instanceId).find("." + F2.Constants.Css.APP_CONTAINER);

		if (!container.length) {
			F2.log("Unable to locate app in order to establish secure connection.");
			return;
		}

		var socket = new easyXDM.Socket({
			remote: _config.secureAppPagePath,
			container: container.get(0),
			props:{ scrolling: "no", style:{width:"100%"} },
			onMessage: function(message, origin) {
				var eventArgs = JSON.parse(message);
				// do not call F2.Events.emit here, otherwise a circular message will occur
				EventEmitter2.prototype.emit.apply(F2.Events, eventArgs);
			},
			onReady: function() {
				socket.postMessage(F2.Constants.Events.SOCKET_LOAD + F2.stringify([app, appAssets]));
			}
		});

		if (socket != null) {
			_sockets.push(socket);
			_hasSocketConnections = true;
		}

		return socket;
	};

	/**
	 * Function to render the html for an App.
	 * @method _getAppHtml
	 * @private
	 * @param {F2.App} app The App object
	 * @param {string} html The string of html
	 */
	var _getAppHtml = function(app, html) {

		function outerHtml(html) {
			return $("<div></div>").append(html).html();
		}

		// apply APP_CONTAINER class
		html = outerHtml($(html).addClass(F2.Constants.Css.APP_CONTAINER));

		// optionally apply wrapper html
		if (_config.appWrapper) {
			html = _config.appWrapper(app, html);
		}

		// apply APP class and instanceId
		return outerHtml($(html).addClass(F2.Constants.Css.APP).attr("id", app.instanceId));
	};

	/**
	 * Attach App events
	 * @method _initAppEvents
	 * @private
	 */
	var _initAppEvents = function (app) {

		var appContainer = $("#" + app.instanceId);

		// these events should only be attached outside of the secure app
		if (!_config.isSecureAppPage) {

			// it is assumed that all containers will at least have F2.Constants.Views.HOME
			if (_config.supportedViews.length > 1) {
				$(appContainer).on("click", "." + F2.Constants.Css.APP_VIEW_TRIGGER + "[" + F2.Constants.Views.DATA_ATTRIBUTE + "]", function(event) {

					var view = $(this).attr(F2.Constants.Views.DATA_ATTRIBUTE);

					// handle the special REMOVE view
					if (view == F2.Constants.Views.REMOVE) {
						F2.removeApp(app.instanceId);

					// make sure the app supports this type of view
					} else if (F2.inArray(view, app.views)) {
						F2.Events.emit(F2.Constants.Events.APP_VIEW_CHANGE + app.instanceId, view);
					}
				});
			}
		}
	};

	/**
	 * Attach Container Events
	 * @method _initContainerEvents
	 * @private
	 */
	var _initContainerEvents = function() {

		var resizeTimeout;
		var resizeHandler = function() {
			F2.Events.emit(F2.Constants.Events.CONTAINER_WIDTH_CHANGE);
		};

		$(window).on("resize", function() {
			clearTimeout(resizeTimeout);
			setTimeout(resizeHandler, 100);
		});
	};

	/**
	 * Appends the App's html to the DOM
	 * @method _writeAppHtml
	 * @private
	 * @param {F2.App} app The App object
	 * @param {string} html The string of html
	 */
	var _writeAppHtml = function(app, html) {
		var handler = _config.appWriter || function(app, html) {
			$("body").append(html);
		};
		handler(app, html);
	};

	return {
		/**
		 * Description of Events goes here
		 * @class F2.Events
		 * @see The <a href="https://github.com/hij1nx/EventEmitter2" target="_blank">EventEmitter2</a> project.
		 */
		Events:_events,
		/**
		 * Initializes the Container. This method must be called before performing any other
		 * actions in the Container.
		 * @method init
		 * @param {F2.ContainerConfiguration} config The configuration object
		 * @for F2
		 */
		init:function(config) {
			_config = config;

			if (_config.isSecureAppPage) {
				_createAppToContainerSocket();
			} else {
				_initContainerEvents();
			}

			_isInit = true;
		},
		/**
		 * Loads the App's html/css/javascript
		 * @method loadApp
		 * @param {F2.App} app The App's context object.
		 * @param {F2.AppAssets} appAssets The App's html/css/js to be loaded into the page.
		 */
		loadApp:function(app, appAssets) {

			if (!app.instanceId || !_apps[app.instanceId]) {
				F2.log("\"F2.registerApp\" must be called before \"F2.loadApp\"");
				return;
			}

			var scripts = appAssets.Scripts || [];
			var styles = appAssets.Styles || [];
			var inlines = appAssets.InlineScripts || [];
			var scriptCount = scripts.length;
			var scriptsLoaded = 0;
			var loadEvent = function() {
				_events.emit(F2.Constants.Events.APPLICATION_LOAD + app.instanceId, app, appAssets);
			};

			// load styles
			var stylesFragment = [];
			$.each(styles, function(i, e) {
				stylesFragment.push('<link rel="stylesheet" type="text/css" href="' + e + '"/>');
			});
			$("head").append(stylesFragment.join(''));

			// load scripts and eval inlines once complete
			$.each(scripts, function(i, e) {
				$.getScript(e)
					.done(function() {
						if (++scriptsLoaded == scriptCount) {
							$.each(inlines, function(i, e) {
								//TODO: Remove this temporary work-around for working with the WidgetApi
								//remove outer function call b/c it overwrites itself
								e = e.replace('window["__modWidgetInit__"] = function() {','');
								//remove final "}" in string
								e = e.slice(0, -1);

								try {
									eval(e);
								} catch (exception) {
									F2.log("Error loading inline script (" + e + ")");
								}
							});
							// fire the load event to tell the App it can proceed
							loadEvent();
						}
					})
					.fail(function(jqxhr, settings, exception) {
						F2.log(["Failed to load script (" + e +")", exception.toString()]);
					});
			});

			//TODO: Remove the Widgets[0].Html as its a work-around for working with the WidgetApi
			// load html
			_writeAppHtml(app, _getAppHtml(app, appAssets.Widgets[0].Html));

			// init events
			_initAppEvents(app);

			// if no scripts were to be processed, fire the appLoad event
			if (!scriptCount) {
				loadEvent();
			}
		},
		/**
		 * Loads the App's html/css/javascript into an iframe
		 * @method loadSecureApp
		 * @param {F2.App} app The App's context object.
		 * @param {F2.AppAssets} appAssets The App's html/css/js to be loaded into the page.
		 */
		loadSecureApp:function(app, appAssets) {

			// make sure the Container is configured for secure apps
			if (_config.secureAppPagePath) {
				// create the html container for the iframe
				_writeAppHtml(app, _getAppHtml(app, "<div></div>"));
				// init events
				_initAppEvents(app);
				// setup the iframe/socket connection
				_apps[app.instanceId].socket = _createContainerToAppSocket(app, appAssets);
			} else {
				F2.log("Unable to load secure app: \"secureAppPagePath\" is not defined in ContainerConfiguration.");
			}
		},
		/**
		 * Loads the App's jsonp data to begin the App loading process. The App will
		 * be passed the {@link F2.App} object which will contain the App's unique
		 * instanceId within the Container.
		 * @method registerApp
		 * @param {F2.App} app The App's meta data object containing
		 * the url to be loaded.
		 * @param {F2.AppAssets} [appAssets] The AppAssets object. This can 
		 * be useful if Apps are loaded on the server-side and passed down to the
		 * client.
		 */
		registerApp:function(app, appAssets) {

				// check for valid App configurations
			if (!app) {
				F2.log("\"app\" is a required parameter");
				return;
			} else if (!app.appId) {
				F2.log("\"appId\" missing from App object");
				return;
			} else if (!app.url) {
				F2.log("\"url\" missing from App object");
				return;
			} else if (!app.views || !F2.inArray(F2.Constants.Views.HOME, app.views)) {
				F2.log("\"views\" not defined or missing \"F2.Constants.Views.HOME\" view.");
				return;
			}

			// create the instanceId for the App
			app.instanceId = F2.guid();

			// save app and appAssets
			_apps[app.instanceId] = {
				app:app
			};

			// function to toggle loading secure/unsecure app
			var _loadApp = function(appAssets) {
				if (app.isSecure) {
					F2.loadSecureApp(app, appAssets);
				} else {
					F2.loadApp(app, appAssets);	
				}
			};

			// fetch the app assets if they weren't already available
			if (appAssets) {
				_loadApp(appAssets);
			} else {
				$.ajax({
					url:app.url,
					data:{ app:F2.stringify(app) },
					dataType:"jsonp",
					success:_loadApp
				});
			}
		},
		/**
		 * Removes an App from the Container
		 * @method removeApp
		 * @param {string} instanceId The App's instanceId
		 */
		removeApp:function(instanceId) {
			if (_apps[instanceId]) {
				delete _apps[instanceId];
				$("#" + instanceId).fadeOut(function() {
					$(this).remove();
				});
			}
		}
	};
})());