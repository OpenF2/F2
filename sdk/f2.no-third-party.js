/*!
 * F2 License Goes Here
 */
if (!window.F2) {
	/**
	 * Open F2
	 * @module f2
	 * @main f2
	 */
	F2 = {
		/** 
		 * Generates a somewhat random id
		 * @method guid
		 * @return {string} A random id
		 * @for F2
		 */
		guid:function() {
			var S4 = function() {
				return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
			};
			return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
		},
		/**
		 * Wrapper logging function.
		 * @method log
		 * @param {Object} args The object to be logged to the console
		 */
		log:function(args) {
			if (window.console && window.console.log) {
				console.log(args);
			}
		},
		/**
		 * Search for a value within an array.
		 * @method inArray
		 * @param {object} value The value to search for
		 * @param {Array} array The array to search
		 */
		inArray:function(value, array) {
			return $.inArray(value, array) > -1;
		},

		/**
		 * Creates a namespace on F2 and copies the contents of an object into
		 * that namespace optionally overwriting existing properties.
		 * @method extend
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
		 * @method parse
		 * @param {string} str The JSON string to convert
		 * @returns {object} The parsed object
		 */
		parse:function(str) {
			return JSON.parse(str);
		},
		/**
		 * Wrapper to convert an object to JSON
		 * @method stringify
		 * @param {object} obj The object to convert
		 * @returns {string} The JSON string
		 */
		stringify:function(obj) {
			return JSON.stringify(obj);
		}
	};
}
/**
 * Class stubs for documentation purposes
 * @main F2
 */
F2.extend("", {
	/**
	 * The App object represents an App's meta data
	 * @class F2.App
	 */
	 App:{
	 	/**
	 	 * The unique ID of the App
	 	 * @property appId
	 	 * @type string
	 	 * @required
	 	 */
	 	appId:"",
	 	/**
	 	 * A JSON string of data that will be passed to the
	 	 * server when an App request is made.
	 	 * @property data
	 	 * @type string
	 	 */
	 	data:"",
	 	/**
	 	 * The description of the App
	 	 * @property description
	 	 * @type string
	 	 * @required
	 	 */
	 	description:"",
		/**
		 * The company of the developer
		 * @property developerCompany
		 * @type string
		 * @required
		 */
	 	developerCompany:"",
	 	/**
	 	 * The name of the developer
	   * @property developerName
	   * @type string
		 * @required
	 	 */
	 	developerName:"",
	 	/**
	 	 * The url of the developer
	 	 * @property developerUrl
	 	 * @type string
	 	 * @required
	 	 */
	 	developerUrl:"",
	 	/**
	 	 * True if the App should be requested in a single request with other Apps. The
	 	 * App must have isSecure = false.
	 	 * @property enableBatchRequests
	 	 * @type bool
	 	 * @default false
	 	 */
	 	enableBatchRequests:false,
	 	/**
	 	 * The height of the App. The initial height will be pulled from
	 	 * the {{#crossLink "F2.App"}}{{/crossLink}} object, but later modified by firing an 
	 	 * {{#crossLink "F2.Constants.Events"}}{{/crossLink}}.APP_HEIGHT_CHANGE event.
	 	 * @property height
	 	 * @type int
	 	 */
	 	height:0,
	 	/**
	 	 * The unique runtime ID of the App
	 	 * @property instanceId
	 	 * @type string
	 	 */
	 	instanceId:"",
	 	/**
	 	 * True if the App will be loaded in an iframe. This property
		 * will be true if the {{#crossLink "F2.App"}}{{/crossLink}} object sets isSecure = true. It will 
		 * also be true if the Container has decided to run Apps in iframes.
		 * @property isSecure
		 * @type bool
		 * @default false
	 	 */
	 	isSecure:false,
	 	/**
	 	 * The recommended maximum width in pixels that this app should be run.
	 	 * It is up to the Container to implement the logic to prevent an App
	 	 * from being run when the maxWidth requirements are not met.
	 	 * @property maxWidth
	 	 * @type int
	 	 */
	 	maxWidth:0,
	 	/**
	 	 * The recommended minimum grid size that this app should be run. This
	 	 * value corresponds to the 12-grid system that is used by the Container.
	 	 * This property should be set by Apps that require a certain number of 
	 	 * columns in their layout.
	 	 * @property minGridSize
	 	 * @type int
	 	 * @default 4
	 	 */
	 	minGridSize:4,
	 	/**
	 	 * The recommended minimum width in pixels that this app should be 
	 	 * run. It is up to the Container to implement the logic to prevent
	 	 * an App from being run when the minWidth requirements are not met.
	 	 * @property minWidth
	 	 * @type int
	 	 * @default 300
	 	 */
	 	minWidth:300,
	 	/**
	 	 * The name of the App
	 	 * @property name
	 	 * @type string
	 	 * @required
	 	 */
	 	name:"",
	 	/**
	 	 * The url of the App
	 	 * @property url
	 	 * @type string
	 	 * @required
	 	 */
	 	url:"",
	 	/**
	 	 * The views that this App supports. Available views
		 * are defined in {{#crossLink "F2.Constants.Views"}}{{/crossLink}}. The presence of a view can be checked
		 * via F2.{{#crossLink "F2/inArray"}}{{/crossLink}}:
		 * 
		 *     F2.inArray(F2.Constants.Views.SETTINGS, app.views)
		 *
		 * The {{#crossLink "F2.Constants.Views"}}{{/crossLink}}.HOME view should always be present.
		 * @property views
		 * @type Array
	 	 */
	 	views:[]
	},
	/**
	 * The assets needed to render an App on the page
	 * @class F2.AppAssets
	 */
	AppAssets:{
		/**
		 * The array of {{#crossLink "F2.AppAssets.AppContent"}}{{/crossLink}} objects
		 * @property Apps
		 * @type Array
		 * @required
		 */
		Apps:[],
		/**
		 * Any inline javascript tha should initially be run
		 * @property InlineScripts
		 * @type Array
		 */
		InlineScripts:[],
		/**
		 * Urls to javascript files required by the App
		 * @property Scripts
		 * @type Array
		 */
		Scripts:[],
		/**
		 * Urls to CSS files required by the App
		 * @property Styles
		 * @type Array
		 */
		Styles:[]
	},
	/**
	 * The AppContent object
	 * @class F2.AppAssets.AppContent
	 **/
	AppContent:{
		/**
		 * Arbitrary data to be passed along with the App
		 * @property Data
		 * @type object
		 */
		Data:{},
		/**
		 * The string of HTML representing the App
		 * @property Html
		 * @type string
		 * @required
		 */
		Html:"",
		/**
	 	 * The unique runtime ID of the App
	 	 * @property InstanceId
	 	 * @type string
	 	 * @required
	 	 */
	 	InstanceId:"",
		/**
		 * A status message
		 * @property Status
		 * @type string
		 */
		Status:""
	},
	/**
	 * An object containing configuration information for the Container
	 * @class F2.ContainerConfiguration
	 */
	ContainerConfiguration:{
		/**
		 * Allows the Container to wrap an App in extra html. The
		 * function should accept an {{#crossLink "F2.App"}}{{/crossLink}} object and also a string of html.
		 * The extra html can provide links to edit app settings and remove an app from the
		 * Container. See {{#crossLink "F2.Constants.Css"}}{{/crossLink}} for CSS classes that should be applied to elements.
		 * @property appWrapper
		 * @type function
		 */
		appWrapper:function() {},
		/**
		 * Allows the Container to override how an App's html is 
		 * inserted into the page. The function should accept an {{#crossLink "F2.App"}}{{/crossLink}} object
		 * and also a string of html
		 * @property appWriter
		 * @type function
		 */
		appWriter:function() {},
		/**
		 * Tells the Container that it is currently running within
		 * a secure app page
		 * @property isSecureAppPage
		 * @type bool
		 */
		isSecureAppPage:false,
		/**
		 * Allows the Container to specify which page is used when
		 * loading a secure app. The page must reside on a different domain than the Container
		 * @property secureAppPagePath
		 * @type string
		 */
		secureAppPagePath:"",
		/**
		 * Specifies what views a Container will provide buttons
		 * or liks to. Generally, the views will be switched via buttons or links in the App's
		 * header. The {{#crossLink "F2.Constants.Views"}}{{/crossLink}}.HOME view should always be present.
		 * @property supportedViews
		 * @type Array
		 * @required
		 */
		supportedViews:[]
	}
});
/**
 * Constants used throughout the Open Financial Framework
 * @class F2.Constants
 * @static
 */
F2.extend("Constants", {
	/**
	 * CSS class constants
	 * @class F2.Constants.Css
	 */
	Css:(function() {

		/** @private */
		var _PREFIX = "f2-";

		return {
			/**
			 * The APP class should be applied to the DOM Element that surrounds the entire App,
			 * including any extra html that surrounds the APP\_CONTAINER that is inserted 
			 * by the Container. See appWrapper property in the {{#crossLink "F2.ContainerConfiguration"}}{{/crossLink}}
			 * object.
			 * @property APP
			 * @type string
			 * @static
			 * @final
			 */
			APP:_PREFIX + "app",
			/**
			 * The APP\_CONTAINER class should be applied to the outermost DOM Element
			 * of the App.
			 * @property APP_CONTAINER
			 * @type string
			 * @static
			 * @final
			 */
			APP_CONTAINER:_PREFIX + "app-container",
			/**
			 * The APP\_VIEW class should be applied to the DOM Element that contains
			 * a view for an App. The DOM Element should also have a {{#crossLink "F2.Constants.Views"}}{{/crossLink}}.DATA_ATTRIBUTE
			 * attribute that specifies which {{#crossLink "F2.Constants.Views"}}{{/crossLink}} it is. 
			 * @property APP_VIEW
			 * @type string
			 * @static
			 * @final
			 */
			APP_VIEW:_PREFIX + "app-view",
			/**
			 * APP\_VIEW\_TRIGGER class shuld be applied to the DOM Elements that
			 * trigger an {{#crossLink "F2.Constants.Events"}}{{/crossLink}}.APP_VIEW_CHANGE event. The DOM Element
			 * should also have a {{#crossLink "F2.Constants.Views"}}{{/crossLink}}.DATA_ATTRIBUTE attribute that
			 * specifies which {{#crossLink "F2.Constants.Views"}}{{/crossLink}} it will trigger.
			 * @property APP_VIEW_TRIGGER
			 * @type string
			 * @static
			 * @final
			 */
			APP_VIEW_TRIGGER:_PREFIX + "app-view-trigger"
		};
	})(),
	
	/**
	 * Events constants
	 * @class F2.Constants.Events
	 */
	Events:(function() {
		/** @private */
		var _APP_EVENT_PREFIX = "App.";
		/** @private */
		var _CONTAINER_EVENT_PREFIX = "Container.";

		return {
			/**
			 * The APPLICATION\_LOAD event is fired once an App's Styles, Scripts, Inline 
			 * Scripts, and HTML have been inserted into the DOM. The App's instanceId should
			 * be concatenated to this constant.
			 *
			 *     F2.Events.once(F2.Constants.Events.APPLICATION_LOAD + app.instanceId, function (app, appAssets) {
			 *       var HelloWorldApp = new HelloWorldApp_Class(app, appAssets);
			 *       HelloWorldApp.init();
			 *     });
			 *
			 * @property APPLICATION_LOAD
			 * @type string
			 * @static
			 * @final
			 */
			APPLICATION_LOAD:"appLoad.",
			/**
			 * The APP\_HEIGHT\_CHANGE event should be fired by an App when the height of the
			 * App is changed.
			 *
			 *     { instanceId:"73603967-5f59-9fba-b611-e311d9fc7ee4", height:200 }
			 *
			 * @property APP_HEIGHT_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			APP_HEIGHT_CHANGE:_APP_EVENT_PREFIX + "heightChange",
			/**
			 * The APP\_WIDTH\_CHANGE event will be fired by the Container when the width
			 * of an App is changed. The App's instanceId should be concatenated to this
			 * constant.
			 * Returns an object with the gridSize and width in pixels:
			 *
			 *     { gridSize:8, width:620 }
			 *
			 * @property APP_WIDTH_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			APP_WIDTH_CHANGE:_APP_EVENT_PREFIX + "widthChange.",
			/**
			 * The APP\_SYMBOL\_CHANGE event is fired when the symbol is changed in an App. It 
			 * is up to the App developer to fire this event.
			 * Returns an object with the symbol and company name:
			 *
			 *     { symbol: "MSFT", name: "Microsoft Corp (NASDAQ)" }
			 *
			 * @property APP_SYMBOL_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			APP_SYMBOL_CHANGE:_APP_EVENT_PREFIX + "symbolChange",
			/**
			 * The APP\_VIEW\_CHANGE event will be fired by the Container when a user clicks
			 * to switch the view for an App. The App's instanceId should be concatenated
			 * to this constant.
			 * @property APP_VIEW_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			APP_VIEW_CHANGE:_APP_EVENT_PREFIX + "viewChange.",
			/**
			 * The CONTAINER\_SYMBOL\_CHANGE event is fired when the symbol is changed at the Container
			 * level. This event should only be fired by the Container or Container Provider.
			 * Returns an object with the symbol and company name:
			 *
			 *     { symbol: "MSFT", name: "Microsoft Corp (NASDAQ)" }
			 *
			 * @property CONTAINER_SYMBOL_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			CONTAINER_SYMBOL_CHANGE:_CONTAINER_EVENT_PREFIX + "symbolChange",
			/**
			 * The CONTAINER\_WIDTH\_CHANGE event will be fired by the Container when the width
			 * of the Container has changed.
			 * @property CONTAINER_WIDTH_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			CONTAINER_WIDTH_CHANGE:_CONTAINER_EVENT_PREFIX + "widthChange",
			/**
			 * The SOCKET\_LOAD event is fired when an iframe socket initially loads. It is only
			 * used with easyXDM and not with EventEmitter2
			 * Returns a JSON string that represents:
			 *
			 *     [ App, AppAssets]
			 * 
			 * @property SOCKET_LOAD
			 * @type string
			 * @static
			 * @final
			 */
			SOCKET_LOAD:"__socketLoad__"
		};
	})(),

	/**
	 * The available view types to Apps. The view should be specified by applying
	 * the {{#crossLink "F2.Constants.Css"}}{{/crossLink}}.APP_VIEW class to thecontaining DOM Element. A 
	 * DATA_ATTRIBUTE attribute should be added to the Element as well which defines
	 * what view type is represented.
	 * @class F2.Constants.Views
	 */
	Views:{
		/**
		 * 
		 * @property DATA_ATTRIBUTE
		 * @type string
		 * @static
		 * @final
		 */
		DATA_ATTRIBUTE:"data-f2-view",
		/**
		 * The ABOUT view gives details about the App.
		 * @property ABOUT
		 * @type string
		 * @static
		 * @final
		 */
		ABOUT:"about",
		/**
		 * The HELP view provides users with help information for using an App.
		 * @property HELP
		 * @type string
		 * @static
		 * @final
		 */
		HELP:"help",
		/**
		 * The HOME view is the main view for an App. This view should always
		 * be provided by an App.
		 * @property HOME
		 * @type string
		 * @static
		 * @final
		 */
		HOME:"home",
		/**
		 * The REMOVE view is a special view that handles the removal of an App
		 * from the Container.
		 * @property REMOVE
		 * @type string
		 * @static
		 * @final
		 */
		REMOVE:"remove",
		/**
		 * The SETTINGS view provides users the ability to modify advanced settings
		 * for an App.
		 * @property SETTINGS
		 * @type string
		 * @static
		 * @final
		 */
		SETTINGS:"settings"
	}
});
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

						_loadApps(app, appAssets);
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

		var iframeProps = {
			scrolling:"no",
			style:{
				width:"100%"
			}
		};

		if (app.height) {
			iframeProps.style.height = app.height + "px";
		}

		var socket = new easyXDM.Socket({
			remote: _config.secureAppPagePath,
			container: container.get(0),
			props:iframeProps,
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
		html = outerHtml($(html).addClass(F2.Constants.Css.APP_CONTAINER + " app" + app.appId));

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
	 * Loads the App's html/css/javascript
	 * @method loadApp
	 * @private
	 * @param {Array} apps An array of {{#crossLink "F2.App"}}{{/crossLink}} objects
	 * @param {F2.AppAssets} [appAssets] The AppAssets object
	 */
	var _loadApps = function(apps, appAssets) {

		// check for secure app
		if (apps.length == 1 && apps[0].isSecure) {
			_loadSecureApp(apps[0], appAssets);
			return;
		}

		var scripts = appAssets.Scripts || [];
		var styles = appAssets.Styles || [];
		var inlines = appAssets.InlineScripts || [];
		var scriptCount = scripts.length;
		var scriptsLoaded = 0;
		var loadEvent = function() {
			$.each(apps, function(i, a) {
				_events.emit(F2.Constants.Events.APPLICATION_LOAD + a.instanceId, a, appAssets);
			});
		};

		// load styles
		var stylesFragment = [];
		$.each(styles, function(i, e) {
			stylesFragment.push('<link rel="stylesheet" type="text/css" href="' + e + '"/>');
		});
		$("head").append(stylesFragment.join(''));

		// load html
		$.each(appAssets.Apps, function(i, a) {
			if (a.InstanceId && _apps[a.InstanceId]) {
				// load html
				_writeAppHtml(_apps[a.InstanceId].app, _getAppHtml(_apps[a.InstanceId].app, a.Html));
				// init events
				_initAppEvents(_apps[a.InstanceId].app);
			} else {
				F2.log(["Unable to load App.  Missing or invalid \"InstanceId\"\n\n", a]);
			}
		});

		// load scripts and eval inlines once complete
		$.each(scripts, function(i, e) {
			$.ajax({
				url:e,
				async:false,
				dataType:"script",
				type:"GET",
				success:function() {
					if (++scriptsLoaded == scriptCount) {
						$.each(inlines, function(i, e) {
							try {
								eval(e);
							} catch (exception) {
								F2.log("Error loading inline script: " + exception + "\n\n" + e);
							}
						});
						// fire the load event to tell the App it can proceed
						loadEvent();
					}
				},
				error:function(jqxhr, settings, exception) {
					F2.log(["Failed to load script (" + e +")", exception.toString()]);
				}
			});
		});

		// if no scripts were to be processed, fire the appLoad event
		if (!scriptCount) {
			loadEvent();
		}
	};

	/**
	 * Loads the App's html/css/javascript into an iframe
	 * @method loadSecureApp
	 * @private
	 * @param {F2.App} app The App's context object.
	 * @param {F2.AppAssets} appAssets The App's html/css/js to be loaded into the page.
	 */
	var _loadSecureApp = function(app, appAssets) {

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
		 * Begins the loading process for all Apps. The App will
		 * be passed the {{#crossLink "F2.App"}}{{/crossLink}} object which will contain the App's unique
		 * instanceId within the Container. Optionally, the {{#crossLink "F2.AppAssets"}}{{/crossLink}}
		 * can be passed in and those assets will be used instead of making a request.
		 * @method registerApps
		 * @param {Array} apps An array of {{#crossLink "F2.App"}}{{/crossLink}} objects
		 * @param {Array} [appAssets] An array of {{#crossLink "F2.AppAssets"}}{{/crossLink}}
		 * objects. This array must be the same length as the apps array that is passed in.
		 * This can be useful if Apps are loaded on the server-side and passed down to the
		 * client.
		 */
		registerApps:function(apps, appAssets) {

			var queue = [];
			var batches = {};
			var hasAssets = typeof appAssets !== "undefined";
			appAssets = appAssets || [];
			apps = [].concat(apps);

			// ensure that if appAssets is passed in, we get a full array of assets
			if (apps.length && appAssets.length && app.length != appAssets.length) {
				F2.log("The length of \"apps\" does not equal the length of \"appAssets\"");
				return;
			}

			// validate each app and assign it an instanceId
			// then determine which apps can be batched together
			$.each(apps, function(i, a) {

				// check for valid App configurations
				if (!a.appId) {
					F2.log("\"appId\" missing from App object");
					return;
				} else if (!a.url) {
					F2.log("\"url\" missing from App object");
					return;
				} else if (!a.views || !F2.inArray(F2.Constants.Views.HOME, a.views)) {
					F2.log("\"views\" not defined or missing \"F2.Constants.Views.HOME\" view.");
					return;
				}

				// create the instanceId for the App
				a.instanceId = F2.guid();

				// save app
				_apps[a.instanceId] = { app:a };

				if (!hasAssets) {
					// check if this app can be batched
					if (a.enableBatchRequests && !a.isSecure) {
						batches[a.url.toLowerCase()] = batches[a.url.toLowerCase()] || [];
						batches[a.url.toLowerCase()].push(a);
					} else {
						queue.push({
							url:a.url,
							apps:[a]
						});
					}
				}
			});

			// if we have the assets already, load the apps
			if (hasAssets) {
				$.each(apps, function(i, a) {
					_loadApps(a, appAssets[i]);
				});

			// else fetch the apps
			} else {
				// add the batches to the queue
				$.each(batches, function(i, b) {
					queue.push({ url:i, apps:b })
				});

				// form and make the requests
				$.each(queue, function(i, req) {
					$.ajax({
						url:req.url,
						data:{
							params:F2.stringify(req.apps)
						},
						dataType:"jsonp",
						success:function(appAssets) {
							_loadApps(req.apps, appAssets);
						}
					});
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