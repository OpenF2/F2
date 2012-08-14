
/**
 * 
 */
if (!window.F2) {
	/**
	 * Open Financial Framework
	 * @namespace
	 */
	F2 = {
		/** 
		 * Generates a somewhat random id
		 */
		guid:function() {
			var S4 = function() {
				return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
			};
			return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
		},
		/**
		 * Wrapper logging function.
		 */
		log:function(args) {
			if (window.console && window.console.log) {
				console.log(args);
			}
		},
		/**
		 * Search for a value within an array.
		 * @param {object} The value to search for
		 * @param {Array} The array to search
		 */
		inArray:function(value, array) {
			return $.inArray(value, array) > -1;
		},

		/**
		 * Creates a namespace on F2 and copies the contents of an object into
		 * that namespace optionally overwriting existing properties.
		 * @param {string} ns The namespace to create. Pass a falsy value to 
		 * add properties to the F2 namespace directly.
		 * @param {object} obj The object to copy into the namespace.
		 * @param {bool} overwrite True if object properties should be overwritten
		 * @returns {object} The created object
		 */
		extend:function (ns, obj, overwrite) {
			var parts = ns ? ns.split('.') : [];
			var parent = window.F2;
			obj = obj || {};
			
			// ignore leading global
			if (parts[0] === "F2") {
				parts = parts.slice(1);
			}
			
			// create namespaces
			for (var i = 0; i < parts.length; i++) {
				if (typeof parent[parts[i]] === "undefined") {
					parent[parts[i]] = {};
				}
				parent = parent[parts[i]];
			}
			
			// copy object into namespace
			for (var prop in obj) {
				if (typeof parent[prop] === "undefined" || overwrite) {
					parent[prop] = obj[prop];
				} 
			}

			return parent;
		},

		/**
		 * Wrapper to convert a JSON string to an object
		 * @param {string} str The JSON string to convert
		 * @returns {object} The parsed object
		 */
		parse:function(str) {
			return JSON.parse(str);
		},
		/**
		 * Wrapper to convert an object to JSON
		 * @param {object} obj The object to convert
		 * @returns {string} The JSON string
		 */
		stringify:function(obj) {
			return JSON.stringify(obj);
		}
	};
}


F2.extend("Constants",
	/**
	 * Constants used throughout the Open Financial Framework
	 * @name F2.Constants
	 * @namespace
	 */
	{
		/**
		 * CSS class constants
		 * @memberOf F2.Constants
		 * @namespace
		 */
		Css:(function() {

			/** @private */
			var _PREFIX = "f2-";

			/** @scope F2.Constants.Css */
			return {
				/**
				 * The APP class should be applied to the DOM Element that surrounds the entire App,
				 * including any extra html that surrounds the APP_CONTAINER that is inserted 
				 * by the Container. See appWrapper property in the {@link F2.ContainerConfiguration}
				 * object.
				 */
				APP:_PREFIX + "app",
				/**
				 * The APP_CONTAINER class should be applied to the outermost DOM Element
				 * of the App.
				 */
				APP_CONTAINER:_PREFIX + "app-container",
				/**
				 * The APP_REMOVE_BUTTON class should be applied to the DOM Element that
				 * will remove an App.
				 */
				APP_REMOVE_BUTTON:_PREFIX + "btn-remove",
				/**
				 * The APP_VIEW class should be applied to the DOM Element that contains
				 * a view for an App. The DOM Element should also have a {@link F2.Constants.Views.DATA_ATTRIBUTE}
				 * attribute that specifies which {@link F2.Constants.Views} it is. 
				 */
				APP_VIEW: "app-view",
				/**
				 * APP_VIEW_TRIGGER class shuld be applied to the DOM Elements that
				 * trigger an {@link F2.Constants.Events}.APP_VIEW_CHANGE event. The DOM Element
				 * should also have a {@link F2.Constants.Views.DATA_ATTRIBUTE} attribute that
				 * specifies which {@link F2.Constants.Views} it will trigger.
				 */
				APP_VIEW_TRIGGER: "app-view-trigger"
			};
		})(),
		
		/**
		 * Events constants
		 * @memberOf F2.Constants
		 * @namespace
		 */
		Events:(function() {
			/** @private */
			var _APP_EVENT_PREFIX = "App.";
			/** @private */
			var _CONTAINER_EVENT_PREFIX = "Container.";

			/** @scope F2.Constants.Events */
			return {
				/**
				 * The APPLICATION_LOAD event is fired once an App's Styles, Scripts, Inline 
				 * Scripts, and HTML have been inserted into the DOM. The App's instanceId should
				 * be concatenated to this constant.
				 * @example
				 * F2.Events.once(F2.Constants.Events.APPLICATION_LOAD + app.instanceId, function (app, appAssets) {
				 *   var HelloWorldApp = new HelloWorldApp_Class(app, appAssets);
				 *   HelloWorldApp.init();
				 * });
				 * @returns {F2.App} The App object
				 * @returns {F2.AppAssets} The App's html/css/js to be loaded into the page.
				 */
				APPLICATION_LOAD:"appLoad.",
				/**
				 * The APP_HEIGHT_CHANGE event should be fired by an App when the height of the
				 * App is changed. 
				 * @returns {object} An object with the App's instanceId and height.
				 * <code>{ instanceId:"73603967-5f59-9fba-b611-e311d9fc7ee4", height:200 }</code>
				 */
				APP_HEIGHT_CHANGE:_APP_EVENT_PREFIX + "heightChange",
				/**
				 * The APP_SYMBOL_CHANGE event is fired when the symbol is changed in an App. It 
				 * is up to the App developer to fire this event.
				 * @returns {object} An object with the symbol and the company name. 
				 * <code>{ symbol: "MSFT", name: "Microsoft Corp (NAZDAQ)" }</code>
				 */
				APP_SYMBOL_CHANGE:_APP_EVENT_PREFIX + "symbolChange",
				/**
				 * The APP_VIEW_CHANGE event will be fired by the Container when a user clicks
				 * to switch the view for an App. The App's instanceId should be concatenated
				 * to this constant.
				 * @returns {string} The current view
				 */
				APP_VIEW_CHANGE:_APP_EVENT_PREFIX + "viewChange.",
				/**
				 * The CONTAINER_SYMBOL_CHANGE event is fired when the symbol is changed at the Container
				 * level. This event should only be fired by the Container or Container Provider.
				 * @returns {object} An object with the symbol and the company name.
				 * <code>{ symbol: "MSFT", name: "Microsoft Corp (NAZDAQ)" }</code>
				 */
				CONTAINER_SYMBOL_CHANGE:_CONTAINER_EVENT_PREFIX + "symbolChange",
				/**
				 * The SOCKET_LOAD event is fired when an iframe socket initially loads. It is only
				 * used with easyXDM and not with EventEmitter2
				 * @returns {string} A JSON string that represents an {@link F2.App}
				 * object and an {@link F2.AppAssets} object
				 */
				SOCKET_LOAD:"__socketLoad__"
			};
		})(),

		/**
		 * The available view types to Apps. The view should be specified by applying
		 * the {@link F2.Constants.Css.APP_VIEW} class to thecontaining DOM Element. A 
		 * DATA_ATTRIBUTE attribute should be added to the Element as well which defines
		 * what view type is represented.
		 * @memberOf F2.Constants
		 * @namespace
		 */
		Views:{
			/**
			 * @memberOf F2.Constants.Views
			 */
			DATA_ATTRIBUTE:"data-f2-view",
			/**
			 * The ABOUT view gives details about the App.
			 * @memberOf F2.Constants.Views
			 */
			ABOUT:"about",
			/**
			 * The HELP view provides users with help information for using an App.
			 * @memberOf F2.Constants.Views
			 */
			HELP:"help",
			/**
			 * The HOME view is the main view for an App. This view should always
			 * be provided by an App.
			 * @memberOf F2.Constants.Views
			 */
			HOME:"home",
			/**
			 * The REMOVE view is a special view that handles the removal of an App
			 * from the Container.
			 * @memberOf F2.Constants.Views
			 */
			REMOVE:"remove",
			/**
			 * The SETTINGS view provides users the ability to modify advanced settings
			 * for an App.
			 * @memberOf F2.Constants.Views
			 */
			SETTINGS:"settings"
		}
	}
);


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
								app:app,
								appAssets:appAssets
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
			 * Loads the App's jsonp data to begin the App loading process. The App will
			 * be passed the {@link F2.App} object which will contain the App's unique
			 * instanceId within the Container.
			 * @param {F2.App} app The App's meta data object containing
			 * the url to be loaded.
			 */
			registerApp:function(app) {

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

				app.instanceId = F2.guid();

				// fetch the app assets
				$.ajax({
					url:app.url,
					data:{ app:F2.stringify(app) },
					dataType:"jsonp",
					success:function(appAssets) {
						//TODO: is this necessary? Do we need this?
						// save app and appAssets
						_apps[app.instanceId] = {
							app:app,
							appAssets:appAssets
						};

						// if this is a secure app, we need to load it into an iframe
						if (app.isSecure) {
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

						// else load the app into the page as normal
						} else {
							F2.loadApp(app, appAssets);	
						}
					}
				});
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