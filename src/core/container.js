/**
 * Core Container functionality
 */
F2.extend("",
	(function(){

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
			$("#" + obj.instanceId).find("iframe").height(obj.height);
		});

		/**
		 * Override the emit function so that events can be privateassed down into iframes
		 * @private
		 * @ignore
		 */
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
		 * Attach App events
		 * @private
		 */
		var _attachAppEvents = function (app) {

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
		 * Creates a socket connection from the App to the Container
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

							// save app and appAssets
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
		 * @private
		 * @see The <a href="http://easyxdm.net" target="_blank">easyXDM</a> project.
		 * @param {F2.App} app The App object
		 * @param {F2.AppAssets} app The AppAssets object
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
				props:{ scrolling: "no" },
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
		 * @private
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

		/** @private */
		var _initError = function() {
			F2.log("\"F2.init\" must be called first");
		};

		/**
		 * Appends the App's html to the DOM
		 * @private
		 */
		var _writeAppHtml = function(app, html) {
			var handler = _config.appWriter || function(app, html) {
				$("body").append(html);
			};
			handler(app, html);
		};

		/** @lends F2 */
		return {
			/**
			 * The App object represents an App's meta data
			 * @class App
			 * @property {string} appId The unique ID of the App
			 * @property {string} description The description of the App
			 * @property {string} developerCompany The company of the developer
			 * @property {string} developerName The name of the developer
			 * @property {string} developerUrl The url of the developer
			 * @property {int} height The height of the App. The initial height will be pulled from
			 * the {@link F2.App} object, but later modified by firing an 
			 * {@link F2.Constants.Events.APP_HEIGHT_CHANGE} event.
			 * @property {string} instanceId The unique runtime ID of the App
			 * @property {bool} isSecure True if the App will be loaded in an iframe. This property
			 * will be true if the {@link F2.App} object sets isSecure = true. It will 
			 * also be true if the Container has decided to run Apps in iframes.
			 * @property {string} name The name of the App
			 * @property {string} url The url of the App
			 * @property {Array} views The views that this App supports. Available views
			 * are defined in {@link F2.Constants.Views}. The presence of a view can be checked
			 * via {@link F2.inArray}:
			 * 
			 * <code>F2.inArray(F2.Constants.Views.SETTINGS, app.views)</code>
			 *
			 * The {@link F2.Constants.Views}.HOME view should always be present.
			 */
			App:function(){},
			/**
			 * The assets needed to render an App on the page
			 * @class AppAssets
			 * @property {Array} Scripts Urls to javascript files required by the App
			 * @property {Array} Styles Urls to CSS files required by the App
			 * @property {Array} InlineScripts Any inline javascript tha should initially be run
			 * @property {string} Html The html of the App
			 */
			AppAssets:function(){},
			/**
			 * An object containing configuration information for the Container
			 * @class ContainerConfiguration
			 * @property {function} appWrapper Allows the Container to wrap an App in extra html. The
			 * function should accept an {@link F2.App} object and also a string of html.
			 * The extra html can provide links to edit app settings and remove an app from the
			 * Container. See {@link F2.Constants.Css} for CSS classes that should be applied to elements.
			 * @property {function} appWriter Allows the Container to override how an App's html is 
			 * inserted into the page. The function should accept an {@link F2.App} object
			 * and also a string of html
			 * @property {string} instanceId The unique DOM id of the App. This property is set at runtime
			 * by the Container
			 * @property {bool} isSecureAppPage Tells the Container that it is currently running within
			 * a secure app page
			 * @property {string} secureAppPagePath Allows the Container to specify which page is used when
			 * loading a secure app. The page must reside on a different domain than the Container
			 * @property {Array} supportedViews Specifies what views a Container will provide buttons
			 * or liks to. Generally, the views will be switched via buttons or links in the App's
			 * header. The {@link F2.Constants.Views}.HOME view should always be present.
			 */
			ContainerConfiguration:function() {},
			/**
			 * Description of Events goes here
			 * @see The <a href="https://github.com/hij1nx/EventEmitter2" target="_blank">EventEmitter2</a> project.
			 */
			Events:_events,
			/**
			 * Initializes the Container. This method must be called before performing any other
			 * actions in the Container.
			 * @param {F2.ContainerConfiguration} config The configuration object
			 */
			init:function(config) {
				_config = config;

				if (_config.isSecureAppPage) {
					_createAppToContainerSocket();
				}

				_isInit = true;
			},
			/**
			 * Loads the App's html/css/javascript
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
				_attachAppEvents(app);

				// if no scripts were to be processed, fire the appLoad event
				if (!scriptCount) {
					loadEvent();
				}
			},
			/**
			 * Loads the App's html/css/javascript into an iframe
			 * @param {F2.App} app The App's context object.
			 * @param {F2.AppAssets} appAssets The App's html/css/js to be loaded into the page.
			 */
			loadSecureApp:function(app, appAssets) {

				// make sure the Container is configured for secure apps
				if (_config.secureAppPagePath) {
					// create the html container for the iframe
					_writeAppHtml(app, _getAppHtml(app, "<div></div>"));
					// init events
					_attachAppEvents(app);
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
			 * @param {F2.App} app The App's meta data object containing
			 * the url to be loaded.
			 * @param {F2.AppAssets} appAssets Optionally, the AppAssets object. This can 
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
	})()
);