;(function(exports) {

  if (exports.F2) {
    return;
  }
  

/*!
 * F2 v1.0.3
 * Copyright (c) 2013 Markit On Demand, Inc. http://www.openf2.org
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var F2;
/**
 * Open F2
 * @module f2
 * @main f2
 */

F2 = {
	/**
	 * A function to pass into F2.stringify which will prevent circular
	 * reference errors when serializing objects
	 * @method appConfigReplacer
	 */
	appConfigReplacer: function(key, value) {
		if (key == 'root' || key == 'ui' || key == 'height') {
			return undefined;
		} else {
			return value;
		}
	},
	/**
	 * The apps namespace is a place for app developers to put the javascript
	 * class that is used to initialize their app. The javascript classes should
	 * be namepaced with the {{#crossLink "F2.AppConfig"}}{{/crossLink}}.appId. 
	 * It is recommended that the code be placed in a closure to help keep the
	 * global namespace clean.
	 *
	 * If the class has an 'init' function, that function will be called 
	 * automatically by F2.
	 * @property Apps
	 * @type object
	 * @example
	 *     F2.Apps["com_example_helloworld"] = (function() {
	 *         var App_Class = function(appConfig, appContent, root) {
	 *             this._app = appConfig; // the F2.AppConfig object
	 *             this._appContent = appContent // the F2.AppManifest.AppContent object
	 *             this.$root = $(root); // the root DOM Element that contains this app
	 *         }
	 *
	 *         App_Class.prototype.init = function() {
	 *             // perform init actions
	 *         }
	 *
	 *         return App_Class;
	 *     })();
	 * @example
	 *     F2.Apps["com_example_helloworld"] = function(appConfig, appContent, root) {
	 *        return {
	 *            init:function() {
	 *                // perform init actions
	 *            }
	 *        };
	 *     };
	 * @for F2
	 */
	Apps: {},
	/**
	 * Creates a namespace on F2 and copies the contents of an object into
	 * that namespace optionally overwriting existing properties.
	 * @method extend
	 * @param {string} ns The namespace to create. Pass a falsy value to 
	 * add properties to the F2 namespace directly.
	 * @param {object} obj The object to copy into the namespace.
	 * @param {bool} overwrite True if object properties should be overwritten
	 * @return {object} The created object
	 */
	extend: function (ns, obj, overwrite) {
		var isFunc = typeof obj === 'function';
		var parts = ns ? ns.split('.') : [];
		var parent = this;
		obj = obj || {};
		
		// ignore leading global
		if (parts[0] === 'F2') {
			parts = parts.slice(1);
		}

		// create namespaces
		for (var i = 0, len = parts.length; i < len; i++) {
			if (!parent[parts[i]]) {
				parent[parts[i]] = isFunc && i + 1 == len ? obj : {};
			}
			parent = parent[parts[i]];
		}

		// copy object into namespace
		if (!isFunc) {
			for (var prop in obj) {
				if (typeof parent[prop] === 'undefined' || overwrite) {
					parent[prop] = obj[prop];
				} 
			}
		}

		return parent;
	},
	/** 
	 * Generates a somewhat random id
	 * @method guid
	 * @return {string} A random id
	 * @for F2
	 */
	guid: function() {
		var S4 = function() {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	},
	/**
	 * Search for a value within an array.
	 * @method inArray
	 * @param {object} value The value to search for
	 * @param {Array} array The array to search
	 * @return {bool} True if the item is in the array
	 */
	inArray: function(value, array) {
		return jQuery.inArray(value, array) > -1;
	},
	/**
	 * Wrapper logging function.
	 * @method log
	 * @param {object} obj An object to be logged
	 * @param {object} [obj2]* An object to be logged
	 */
	log: function() {
		if (window.console && window.console.log) {
			console.log([].slice.call(arguments));
		}
	},
	/**
	 * Wrapper to convert a JSON string to an object
	 * @method parse
	 * @param {string} str The JSON string to convert
	 * @return {object} The parsed object
	 */
	parse: function(str) {
		return JSON.parse(str);
	},
	/**
	 * Wrapper to convert an object to JSON
	 *
	 * **Note: When using F2.stringify on an F2.AppConfig object, it is
	 * recommended to pass F2.appConfigReplacer as the replacer function in
	 * order to prevent circular serialization errors.**
	 * @method stringify
	 * @param {object} value The object to convert
	 * @param {function|Array} replacer An optional parameter that determines
	 * how object values are stringified for objects. It can be a function or an 
	 * array of strings.
	 * @param {int|string} space An optional parameter that specifies the
	 * indentation of nested structures. If it is omitted, the text will be
	 * packed without extra whitespace. If it is a number, it will specify the
	 * number of spaces to indent at each level. If it is a string (such as '\t'
	 * or '&nbsp;'), it contains the characters used to indent at each level.
	 * @return {string} The JSON string
	 */
	stringify: function(value, replacer, space) {
		return JSON.stringify(value, replacer, space);
	},
	/** 
	 * Function to get the F2 version number
	 * @method version
	 * @return {string} F2 version number
	 */
	version: function() { return "1.0.3"; }
};


/**
 * Class stubs for documentation purposes
 * @main F2
 */
F2.extend("", {
	/**
	 * The App Class is an optional class that can be namespaced onto the 
	 * {{#crossLink "F2\Apps"}}{{/crossLink}} namespace.  The 
	 * [F2 Docs](../../app-development.html#app-class)
	 * has more information on the usage of the App Class.
	 * @class F2.App
	 * @constructor
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object for the app
	 * @param {F2.AppManifest.AppContent} appContent The F2.AppManifest.AppContent
	 * object
	 * @param {Element} root The root DOM Element for the app
	 */
	App: function(appConfig, appContent, root) {
		return {
			/**
			 * An optional init function that will automatically be called when
			 * F2.{{#crossLink "F2\registerApps"}}{{/crossLink}} is called.
			 * @method init
			 * @optional
			 */
			init:function() {}
		};
	},
	/**
	 * The AppConfig object represents an app's meta data
	 * @class F2.AppConfig
	 */
	AppConfig: {
		/**
		 * The unique ID of the app. More information can be found
		 * [here](../../app-development.html#f2-appid)
		 * @property appId
		 * @type string
		 * @required
		 */
		appId: "",
		/**
		 * An object that represents the context of an app
		 * @property context
		 * @type object
		 */
		context: {},
		/**
		 * True if the app should be requested in a single request with other apps.
		 * @property enableBatchRequests
		 * @type bool
		 * @default false
		 */
		enableBatchRequests: false,
		/**
		 * The height of the app. The initial height will be pulled from
		 * the {{#crossLink "F2.AppConfig"}}{{/crossLink}} object, but later
		 * modified by calling
		 * F2.UI.{{#crossLink "F2.UI/updateHeight"}}{{/crossLink}}. This is used
		 * for secure apps to be able to set the initial height of the iframe.
		 * @property height
		 * @type int
		 */
		height: 0,
		/**
		 * The unique runtime ID of the app.
		 *
		 * **This property is populated during the
		 * F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process**
		 * @property instanceId
		 * @type string
		 */
		instanceId: "",
		/**
		 * True if the app will be loaded in an iframe. This property
		 * will be true if the {{#crossLink "F2.AppConfig"}}{{/crossLink}} object
		 * sets isSecure = true. It will also be true if the
		 * [container](../../container-development.html) has made the decision to
		 * run apps in iframes.
		 * @property isSecure
		 * @type bool
		 * @default false
		 */
		isSecure: false,
		/**
		 * The url to retrieve the {{#crossLink "F2.AppManifest"}}{{/crossLink}}
		 * object.
		 * @property manifestUrl
		 * @type string
		 * @required
		 */
		manifestUrl: "",
		/**
		 * The recommended maximum width in pixels that this app should be run.
		 * **It is up to the [container](../../container-development.html) to
		 * implement the logic to prevent an app from being run when the maxWidth
		 * requirements are not met.**
		 * @property maxWidth
		 * @type int
		 */
		maxWidth: 0,
		/**
		 * The recommended minimum grid size that this app should be run. This
		 * value corresponds to the 12-grid system that is used by the
		 * [container](../../container-development.html). This property should be
		 * set by apps that require a certain number of columns in their layout.
		 * @property minGridSize
		 * @type int
		 * @default 4
		 */
		minGridSize: 4,
		/**
		 * The recommended minimum width in pixels that this app should be run. **It
		 * is up to the [container](../../container-development.html) to implement
		 * the logic to prevent an app from being run when the minWidth requirements
		 * are not met.
		 * @property minWidth
		 * @type int
		 * @default 300
		 */
		minWidth: 300,
		/**
		 * The name of the app
		 * @property name
		 * @type string
		 * @required
		 */
		name: "",
		/**
		 * The root DOM element that contains the app
		 *
		 * **This property is populated during the
		 * F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process**
		 * @property root
		 * @type Element
		 */
		root: undefined,
		/**
		 * The instance of F2.UI providing easy access to F2.UI methods
		 *
		 * **This property is populated during the
		 * F2.{{#crossLink "F2/registerApps"}}{{/crossLink}} process**
		 * @property ui
		 * @type F2.UI
		 */
		ui: undefined,
		/**
		 * The views that this app supports. Available views
		 * are defined in {{#crossLink "F2.Constants.Views"}}{{/crossLink}}. The
		 * presence of a view can be checked via
		 * F2.{{#crossLink "F2/inArray"}}{{/crossLink}}:
		 * 
		 *     F2.inArray(F2.Constants.Views.SETTINGS, app.views)
		 *
		 * @property views
		 * @type Array
		 */
		views: []
	},
	/**
	 * The assets needed to render an app on the page
	 * @class F2.AppManifest
	 */
	AppManifest: {
		/**
		 * The array of {{#crossLink "F2.AppManifest.AppContent"}}{{/crossLink}}
		 * objects
		 * @property apps
		 * @type Array
		 * @required
		 */
		apps: [],
		/**
		 * Any inline javascript tha should initially be run
		 * @property inlineScripts
		 * @type Array
		 * @optional
		 */
		inlineScripts: [],
		/**
		 * Urls to javascript files required by the app
		 * @property scripts
		 * @type Array
		 * @optional
		 */
		scripts: [],
		/**
		 * Urls to CSS files required by the app
		 * @property styles
		 * @type Array
		 * @optional
		 */
		styles: []
	},
	/**
	 * The AppContent object
	 * @class F2.AppManifest.AppContent
	 **/
	AppContent: {
		/**
		 * Arbitrary data to be passed along with the app
		 * @property data
		 * @type object
		 * @optional
		 */
		data: {},
		/**
		 * The string of HTML representing the app
		 * @property html
		 * @type string
		 * @required
		 */
		html: "",
		/**
		 * A status message
		 * @property status
		 * @type string
		 * @optional
		 */
		status: ""
	},
	/**
	 * An object containing configuration information for the
	 * [container](../../container-development.html)
	 * @class F2.ContainerConfig
	 */
	ContainerConfig: {		
		/**
		 * Allows the [container](../../container-development.html) to override how
		 * an app's html is inserted into the page. The function should accept an
		 * {{#crossLink "F2.AppConfig"}}{{/crossLink}} object and also a string of
		 * html
		 * @method afterAppRender
		 * @param {F2.AppConfig} appConfig The F2.AppConfig object
		 * @param {string} html The string of html representing the app 
		 * @return {Element} The DOM Element surrounding the app
		 */
		afterAppRender: function(appConfig, html) {},
		/**
		 * Allows the [container](../../container-development.html) to wrap an app
		 * in extra html. The function should accept an
		 * {{#crossLink "F2.AppConfig"}}{{/crossLink}} object and also a string of
		 * html. The extra html can provide links to edit app settings and remove an
		 * app from the container. See
		 * {{#crossLink "F2.Constants.Css"}}{{/crossLink}} for CSS classes that
		 * should be applied to elements.
		 * @method appRender
		 * @param {F2.AppConfig} appConfig The F2.AppConfig object
		 * @param {string} html The string of html representing the app
		 */
		appRender: function(appConfig, html) {},
		/**
		 * Allows the container to render html for an app before the AppManifest for
		 * an app has loaded. This can be useful if the design calls for loading
		 * icons to appear for each app before each app is loaded and rendered to
		 * the page.
		 * @method beforeAppRender
		 * @param {F2.AppConfig} appConfig The F2.AppConfig object
		 * @return {Element} The DOM Element surrounding the app
		 */
		beforeAppRender: function(appConfig) {},
		/**
		 * Tells the container that it is currently running within
		 * a secure app page
		 * @property isSecureAppPage
		 * @type bool
		 */
		isSecureAppPage: false,
		/**
		 * An object containing configuration defaults for F2.UI
		 * @class F2.ContainerConfig.UI
		 */
		UI: {
			/**
			 * An object containing configuration defaults for the 
			 * F2.UI.{{#crossLink "F2.UI/showMask"}}{{/crossLink}} and
			 * F2.UI.{{#crossLink "F2.UI/hideMask"}}{{/crossLink}} methods.
			 * @class F2.ContainerConfig.UI.Mask
			 */
			Mask: {
				/**
				 * The backround color of the overlay
				 * @property backgroundColor
				 * @type string
				 * @default #FFF
				 */
				backgroundColor: '#FFF',
				/**
				 * The path to the loading icon
				 * @property loadingIcon
				 * @type string
				 */
				loadingIcon: '',
				/**
				 * The opacity of the background overlay
				 * @property opacity
				 * @type int
				 * @default .6
				 */
				opacity: .6,
				/**
				 * Do not use inline styles for mask functinality. Instead classes will
				 * be applied to the elements and it is up to the container provider to
				 * implement the class definitions.
				 * @property useClasses
				 * @type bool
				 * @default false
				 */
				useClasses: false,
				/**
				 * The z-index to use for the overlay
				 * @property zIndex
				 * @type int
				 * @default 2
				 */
				zIndex: 2
			}
		},
		/**
		 * Allows the container to specify which page is used when
		 * loading a secure app. The page must reside on a different domain than the
		 * container
		 * @property secureAppPagePath
		 * @type string
		 * @for F2.ContainerConfig
		 */
		secureAppPagePath: '',
		/**
		 * Specifies what views a container will provide buttons
		 * or links to. Generally, the views will be switched via buttons or links
		 * in the app's header.
		 * @property supportedViews
		 * @type Array
		 * @required
		 */
		supportedViews: []
	}
});
/**
 * Constants used throughout the Open Financial Framework
 * @class F2.Constants
 * @static
 */
F2.extend('Constants', {
	/**
	 * CSS class constants
	 * @class F2.Constants.Css
	 */
	Css: (function() {

		/** @private */
		var _PREFIX = 'f2-';

		return {
			/**
			 * The APP class should be applied to the DOM Element that surrounds the
			 * entire app, including any extra html that surrounds the APP\_CONTAINER
			 * that is inserted by the container. See the 
			 * {{#crossLink "F2.ContainerConfig"}}{{/crossLink}} object.
			 * @property APP
			 * @type string
			 * @static
			 * @final
			 */
			APP: _PREFIX + 'app',
			/**
			 * The APP\_CONTAINER class should be applied to the outermost DOM Element
			 * of the app.
			 * @property APP_CONTAINER
			 * @type string
			 * @static
			 * @final
			 */
			APP_CONTAINER: _PREFIX + 'app-container',
			/**
			 * The APP\_TITLE class should be applied to the DOM Element that contains
			 * the title for an app.  If this class is not present, then
			 * F2.UI.{{#crossLink "F2.UI/setTitle"}}{{/crossLink}} will not function.
			 * @property APP_TITLE
			 * @type string
			 * @static
			 * @final
			 */
			APP_TITLE: _PREFIX + 'app-title',
			/**
			 * The APP\_VIEW class should be applied to the DOM Element that contains
			 * a view for an app. The DOM Element should also have a
			 * {{#crossLink "F2.Constants.Views"}}{{/crossLink}}.DATA_ATTRIBUTE
			 * attribute that specifies which
			 * {{#crossLink "F2.Constants.Views"}}{{/crossLink}} it is. 
			 * @property APP_VIEW
			 * @type string
			 * @static
			 * @final
			 */
			APP_VIEW: _PREFIX + 'app-view',
			/**
			 * APP\_VIEW\_TRIGGER class should be applied to the DOM Elements that
			 * trigger an
			 * {{#crossLink "F2.Constants.Events"}}{{/crossLink}}.APP\_VIEW\_CHANGE
			 * event. The DOM Element should also have a
			 * {{#crossLink "F2.Constants.Views"}}{{/crossLink}}.DATA_ATTRIBUTE
			 * attribute that specifies which
			 * {{#crossLink "F2.Constants.Views"}}{{/crossLink}} it will trigger.
			 * @property APP_VIEW_TRIGGER
			 * @type string
			 * @static
			 * @final
			 */
			APP_VIEW_TRIGGER: _PREFIX + 'app-view-trigger',
			/**
			 * The MASK class is applied to the overlay element that is created
			 * when the F2.UI.{{#crossLink "F2.UI/showMask"}}{{/crossLink}} method is
			 * fired.
			 * @property MASK
			 * @type string
			 * @static
			 * @final
			 */
			MASK: _PREFIX + 'mask',
			/**
			 * The MASK_CONTAINER class is applied to the Element that is passed into
			 * the F2.UI.{{#crossLink "F2.UI/showMask"}}{{/crossLink}} method.
			 * @property MASK_CONTAINER
			 * @type string
			 * @static
			 * @final
			 */
			MASK_CONTAINER: _PREFIX + 'mask-container'
		};
	})(),
	
	/**
	 * Events constants
	 * @class F2.Constants.Events
	 */
	Events: (function() {
		/** @private */
		var _APP_EVENT_PREFIX = 'App.';
		/** @private */
		var _CONTAINER_EVENT_PREFIX = 'Container.';

		return {
			/**
			 * The APP\_SYMBOL\_CHANGE event is fired when the symbol is changed in an
			 * app. It is up to the app developer to fire this event.
			 * Returns an object with the symbol and company name:
			 *
			 *     { symbol: 'MSFT', name: 'Microsoft Corp (NASDAQ)' }
			 *
			 * @property APP_SYMBOL_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			APP_SYMBOL_CHANGE: _APP_EVENT_PREFIX + 'symbolChange',
			/**
			 * The APP\_WIDTH\_CHANGE event will be fired by the container when the
			 * width of an app is changed. The app's instanceId should be concatenated
			 * to this constant.
			 * Returns an object with the gridSize and width in pixels:
			 *
			 *     { gridSize:8, width:620 }
			 *
			 * @property APP_WIDTH_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			APP_WIDTH_CHANGE: _APP_EVENT_PREFIX + 'widthChange.',
			/**
			 * The CONTAINER\_SYMBOL\_CHANGE event is fired when the symbol is changed
			 * at the container level. This event should only be fired by the
			 * container or container provider.
			 * Returns an object with the symbol and company name:
			 *
			 *     { symbol: 'MSFT', name: 'Microsoft Corp (NASDAQ)' }
			 *
			 * @property CONTAINER_SYMBOL_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			CONTAINER_SYMBOL_CHANGE: _CONTAINER_EVENT_PREFIX + 'symbolChange',
			/**
			 * The CONTAINER\_WIDTH\_CHANGE event will be fired by the container when
			 * the width of the container has changed.
			 * @property CONTAINER_WIDTH_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			CONTAINER_WIDTH_CHANGE: _CONTAINER_EVENT_PREFIX + 'widthChange'
		};
	})(),

	JSONP_CALLBACK: 'F2_jsonpCallback_',

	/**
	 * Constants for use with cross-domain sockets
	 * @class F2.Constants.Sockets
	 * @protected
	 */
	Sockets: {
		/**
		 * The EVENT message is sent whenever
		 * F2.Events.{{#crossLink "F2.Events/emit"}}{{/crossLink}} is fired
		 * @property EVENT
		 * @type string
		 * @static
		 * @final
		 */
		EVENT: '__event__',
		/**
		 * The LOAD message is sent when an iframe socket initially loads.
		 * Returns a JSON string that represents:
		 *
		 *     [ App, AppManifest]
		 * 
		 * @property LOAD
		 * @type string
		 * @static
		 * @final
		 */
		LOAD: '__socketLoad__',
		/**
		 * The RPC message is sent when a method is passed up from within a secure
		 * app page.
		 * @property RPC
		 * @type string
		 * @static
		 * @final
		 */
		RPC: '__rpc__',
		/**
		 * The RPC\_CALLBACK message is sent when a call back from an RPC method is
		 * fired.
		 * @property RPC_CALLBACK
		 * @type string
		 * @static
		 * @final
		 */
		RPC_CALLBACK: '__rpcCallback__',
		/**
		 * The UI\_RPC message is sent when a UI method called.
		 * @property UI_RPC
		 * @type string
		 * @static
		 * @final
		 */
		UI_RPC: '__uiRpc__'
	},

	/**
	 * The available view types to apps. The view should be specified by applying
	 * the {{#crossLink "F2.Constants.Css"}}{{/crossLink}}.APP\_VIEW class to the
	 * containing DOM Element. A DATA\_ATTRIBUTE attribute should be added to the
	 * Element as well which defines what view type is represented.
	 * The `hide` class can be applied to views that should be hidden by default.
	 * @class F2.Constants.Views
	 */
	Views: {
		/**
		 * The DATA_ATTRIBUTE should be placed on the DOM Element that contains the
		 * view.
		 * @property DATA_ATTRIBUTE
		 * @type string
		 * @static
		 * @final
		 */
		DATA_ATTRIBUTE: 'data-f2-view',
		/**
		 * The ABOUT view gives details about the app.
		 * @property ABOUT
		 * @type string
		 * @static
		 * @final
		 */
		ABOUT: 'about',
		/**
		 * The HELP view provides users with help information for using an app.
		 * @property HELP
		 * @type string
		 * @static
		 * @final
		 */
		HELP: 'help',
		/**
		 * The HOME view is the main view for an app. This view should always
		 * be provided by an app.
		 * @property HOME
		 * @type string
		 * @static
		 * @final
		 */
		HOME: 'home',
		/**
		 * The REMOVE view is a special view that handles the removal of an app
		 * from the container.
		 * @property REMOVE
		 * @type string
		 * @static
		 * @final
		 */
		REMOVE: 'remove',
		/**
		 * The SETTINGS view provides users the ability to modify advanced settings
		 * for an app.
		 * @property SETTINGS
		 * @type string
		 * @static
		 * @final
		 */
		SETTINGS: 'settings'
	}
});
/**
 * Handles [Context](../../app-development.html#context) passing from
 * containers to apps and apps to apps.
 * @class F2.Events
 */
F2.extend('Events', (function() {
	// init EventEmitter
	var _events = new EventEmitter2({
		wildcard:true
	});

	// unlimited listeners, set to > 0 for debugging
	_events.setMaxListeners(0);

	return {
		/**
		 * Same as F2.Events.emit except that it will not send the event
		 * to all sockets.
		 * @method _socketEmit
		 * @private
		 * @param {string} event The event name
		 * @param {object} [arg]* The arguments to be passed
		 */
		_socketEmit: function() {
			return EventEmitter2.prototype.emit.apply(_events, [].slice.call(arguments));
		},
		/**
		 * Execute each of the listeners that may be listening for the specified
		 * event name in order with the list of arguments.
		 * @method emit
		 * @param {string} event The event name
		 * @param {object} [arg]* The arguments to be passed
		 */
		emit: function() {
			F2.Rpc.broadcast(F2.Constants.Sockets.EVENT, [].slice.call(arguments));
			return EventEmitter2.prototype.emit.apply(_events, [].slice.call(arguments));
		},
		/**
		 * Adds a listener that will execute n times for the event before being 
		 * removed. The listener is invoked only the first time the event is 
		 * fired, after which it is removed.
		 * @method many
		 * @param {string} event The event name
		 * @param {int} timesToListen The number of times to execute the event
		 * before being removed
		 * @param {function} listener The function to be fired when the event is
		 * emitted
		 */
		many: function(event, timesToListen, listener) {
			return _events.many(event, timesToListen, listener);
		},
		/**
		 * Remove a listener for the specified event.
		 * @method off
		 * @param {string} event The event name
		 * @param {function} listener The function that will be removed
		 */
		off: function(event, listener) {
			return _events.off(event, listener);
		},
		/**
		 * Adds a listener for the specified event
		 * @method on
		 * @param {string} event The event name
		 * @param {function} listener The function to be fired when the event is
		 * emitted
		 */
		on: function(event, listener){
			return _events.on(event, listener);
		},
		/**
		 * Adds a one time listener for the event. The listener is invoked only
		 * the first time the event is fired, after which it is removed.
		 * @method once
		 * @param {string} event The event name
		 * @param {function} listener The function to be fired when the event is
		 * emitted
		 */
		once: function(event, listener) {
			return _events.once(event, listener);
		}
	};
})());
/**
 * Handles socket communication between the container and secure apps
 * @class F2.Rpc
 */
F2.extend('Rpc', (function(){
	var _callbacks = {};
	var _secureAppPagePath = '';
	var _apps = {};
	var _rEvents = new RegExp('^' + F2.Constants.Sockets.EVENT);
	var _rRpc = new RegExp('^' + F2.Constants.Sockets.RPC);
	var _rRpcCallback = new RegExp('^' + F2.Constants.Sockets.RPC_CALLBACK);
	var _rSocketLoad = new RegExp('^' + F2.Constants.Sockets.LOAD);
	var _rUiCall = new RegExp('^' + F2.Constants.Sockets.UI_RPC);

	/**
	 * Creates a socket connection from the app to the container using 
	 * <a href="http://easyxdm.net" target="_blank">easyXDM</a>.
	 * @method _createAppToContainerSocket
	 * @private
	 */
	var _createAppToContainerSocket = function() {

		var appConfig; // socket closure
		var isLoaded = false;
		// its possible for messages to be received before the socket load event has
		// happened.  We'll save off these messages and replay them once the socket
		// is ready
		var messagePlayback = [];

		var socket = new easyXDM.Socket({
			onMessage: function(message, origin){

				// handle Socket Load
				if (!isLoaded && _rSocketLoad.test(message)) {
					message = message.replace(_rSocketLoad, '');
					var appParts = F2.parse(message);

					// make sure we have the AppConfig and AppManifest
					if (appParts.length == 2) {
						appConfig = appParts[0];

						// save socket
						_apps[appConfig.instanceId] = {
							config:appConfig,
							socket:socket
						};	

						// register app
						F2.registerApps([appConfig], [appParts[1]]);

						// socket message playback
						jQuery.each(messagePlayback, function(i, e) {
							_onMessage(appConfig, message, origin);
						});
						
						isLoaded = true;
					}
				} else if (isLoaded) {
					// pass everyting else to _onMessage
					_onMessage(appConfig, message, origin);
				} else {
					//F2.log('socket not ready, queuing message', message);
					messagePlayback.push(message);
				}
			}
		});
	};

	/**
	 * Creates a socket connection from the container to the app using 
	 * <a href="http://easyxdm.net" target="_blank">easyXDM</a>.
	 * @method _createContainerToAppSocket
	 * @private
	 * @param {appConfig} appConfig The F2.AppConfig object
	 * @param {F2.AppManifest} appManifest The F2.AppManifest object
	 */
	var _createContainerToAppSocket = function(appConfig, appManifest) {

		var container = jQuery(appConfig.root);
		container = container.is('.' + F2.Constants.Css.APP_CONTAINER)
			? container
			: container.find('.' + F2.Constants.Css.APP_CONTAINER);

		if (!container.length) {
			F2.log('Unable to locate app in order to establish secure connection.');
			return;
		}

		var iframeProps = {
			scrolling:'no',
			style:{
				width:'100%'
			}
		};

		if (appConfig.height) {
			iframeProps.style.height = appConfig.height + 'px';
		}

		var socket = new easyXDM.Socket({
			remote: _secureAppPagePath,
			container: container.get(0),
			props:iframeProps,
			onMessage: function(message, origin) {
				// pass everything to _onMessage
				_onMessage(appConfig, message, origin);
			},
			onReady: function() {
				socket.postMessage(F2.Constants.Sockets.LOAD + F2.stringify([appConfig, appManifest], F2.appConfigReplacer));
			}
		});

		return socket;
	};

	/**
	 * @method _createRpcCallback
	 * @private
	 * @param {string} instanceId The app's Instance ID
	 * @param {function} callbackId The callback ID
	 * @return {function} A function to make the RPC call
	 */
	var _createRpcCallback = function(instanceId, callbackId) {
		return function() {
			F2.Rpc.call(
				instanceId,
				F2.Constants.Sockets.RPC_CALLBACK,
				callbackId,
				[].slice.call(arguments).slice(2)
			);
		};
	};

	/**
	 * Handles messages that come across the sockets
	 * @method _onMessage
	 * @private
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 * @param {string} message The socket message
	 * @param {string} origin The originator
	 */
	var _onMessage = function(appConfig, message, origin) {

		var obj;

		function parseFunction(parent, functionName) {
			var path = String(functionName).split('.');
			for (var i = 0; i < path.length; i++) {
				if (parent[path[i]] === undefined) {
					parent = undefined;
					break;
				}
				parent = parent[path[i]];
			}
			return parent;
		};

		function parseMessage(regEx, message, instanceId) {
			var o = F2.parse(message.replace(regEx, ''));

			// if obj.callbacks
			//   for each callback
			//     for each params
			//       if callback matches param
			//        replace param with _createRpcCallback(app.instanceId, callback)
			if (o.params && o.params.length && o.callbacks && o.callbacks.length) {
				jQuery.each(o.callbacks, function(i, c) {
					jQuery.each(o.params, function(i, p) {
						if (c == p) {
							o.params[i] = _createRpcCallback(instanceId, c);
						}
					});
				});
			}

			return o;
		};

		// handle UI Call
		if (_rUiCall.test(message)) {
			obj = parseMessage(_rUiCall, message, appConfig.instanceId);
			var func = parseFunction(appConfig.ui, obj.functionName);
			// if we found the function, call it
			if (func !== undefined) {
				func.apply(appConfig.ui, obj.params);
			} else {
				F2.log('Unable to locate UI RPC function: ' + obj.functionName);
			}

		// handle RPC
		} else if (_rRpc.test(message)) {
			obj = parseMessage(_rRpc, message, appConfig.instanceId);
			var func = parseFunction(window, obj.functionName);
			if (func !== undefined) {
				func.apply(func, obj.params);
			} else {
				F2.log('Unable to locate RPC function: ' + obj.functionName);
			}

		// handle RPC Callback
		} else if (_rRpcCallback.test(message)) {
			obj = parseMessage(_rRpcCallback, message, appConfig.instanceId);
			if (_callbacks[obj.functionName] !== undefined) {
				_callbacks[obj.functionName].apply(_callbacks[obj.functionName], obj.params);
				delete _callbacks[obj.functionName];
			}

		// handle Events
		} else if (_rEvents.test(message)) {
			obj = parseMessage(_rEvents, message, appConfig.instanceId);
			F2.Events._socketEmit.apply(F2.Events, obj);
		}
	};

	/**
	 * Registers a callback function
	 * @method _registerCallback
	 * @private
	 * @param {function} callback The callback function
	 * @return {string} The callback ID
	 */
	var _registerCallback = function(callback) {
		var callbackId = F2.guid();
		_callbacks[callbackId] = callback;
		return callbackId;
	};

	return {
		/**
		 * Broadcast an RPC function to all sockets
		 * @method broadcast
		 * @param {string} messageType The message type
		 * @param {Array} params The parameters to broadcast
		 */
		broadcast: function(messageType, params) {
			// check valid messageType
			var message = messageType + F2.stringify(params);
			jQuery.each(_apps, function(i, a) {
				a.socket.postMessage(message);
			});
		},
		/**
		 * Calls a remote function
		 * @method call
		 * @param {string} instanceId The app's Instance ID
		 * @param {string} messageType The message type
		 * @param {string} functionName The name of the remote function
		 * @param {Array} params An array of parameters to pass to the remote
		 * function. Any functions found within the params will be treated as a
		 * callback function.
		 */
		call: function(instanceId, messageType, functionName, params) {
			// loop through params and find functions and convert them to callbacks
			var callbacks = [];
			jQuery.each(params, function(i, e) {
				if (typeof e === "function") {
					var cid = _registerCallback(e);
					params[i] = cid;
					callbacks.push(cid);
				}
			});
			// check valid messageType
			_apps[instanceId].socket.postMessage(
				messageType + F2.stringify({
					functionName:functionName,
					params:params,
					callbacks:callbacks
				})
			);
		},

		/**
		 * Init function which tells F2.Rpc whether it is running at the container-
		 * level or the app-level. This method is generally called by
		 * F2.{{#crossLink "F2/init"}}{{/crossLink}}
		 * @method init
		 * @param {string} [secureAppPagePath] The
		 * {{#crossLink "F2.ContainerConfig"}}{{/crossLink}}.secureAppPagePath
		 * property
		 */
		init: function(secureAppPagePath) {
			_secureAppPagePath = secureAppPagePath;
			if (!_secureAppPagePath) {
				_createAppToContainerSocket();
			}
		},

		/**
		 * Determines whether the Instance ID is considered to be 'remote'. This is
		 * determined by checking if 1) the app has an open socket and 2) whether
		 * F2.Rpc is running inside of an iframe
		 * @method isRemote
		 * @param {string} instanceId The Instance ID
		 * @return {bool} True if there is an open socket
		 */
		isRemote: function(instanceId) {
			return (
				// we have an app
				_apps[instanceId] !== undefined &&
				// the app is secure
				_apps[instanceId].config.isSecure &&
				// we can't access the iframe
				jQuery(_apps[instanceId].config.root).find('iframe').length == 0
			);
		},

		/**
		 * Creates a container-to-app or app-to-container socket for communication
		 * @method register
		 * @param {F2.AppConfig} [appConfig] The F2.AppConfig object
		 * @param {F2.AppManifest} [appManifest] The F2.AppManifest object
		 */
		register: function(appConfig, appManifest) {
			if (!!appConfig && !!appManifest) {
				_apps[appConfig.instanceId] = {
					config:appConfig,
					socket:_createContainerToAppSocket(appConfig, appManifest)
				};
			} else {
				F2.log("Unable to register socket connection. Please check container configuration.");
			}
		}
	};
})());
F2.extend('UI', (function(){

	var _containerConfig;

	/**
	 * UI helper methods
	 * @class F2.UI
	 * @constructor
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 */
	var UI_Class = function(appConfig) {

		var _appConfig = appConfig;
		var $root = jQuery(appConfig.root);

		var _updateHeight = function(height) {
			height = height || jQuery(_appConfig.root).outerHeight();

			if (F2.Rpc.isRemote(_appConfig.instanceId)) {
				F2.Rpc.call(
					_appConfig.instanceId,
					F2.Constants.Sockets.UI_RPC,
					'updateHeight',
					[
						height
					]
				);
			} else {
				_appConfig.height = height;
				$root.find('iframe').height(_appConfig.height);
			}
		};

		return {
			/**
			 * Removes a overlay from an Element on the page
			 * @method hideMask
			 * @param {string|Element} selector The Element or selector to an Element
			 * that currently contains the loader
			 */
			hideMask: function(selector) {
				F2.UI.hideMask(_appConfig.instanceId, selector);
			},
			/**
			 * Helper methods for creating and using Modals
			 * @class F2.UI.Modals
			 * @for F2.UI
			 */
			Modals: (function(){

				var _renderAlert = function(message) {
					return [
						'<div class="modal">',
							'<header class="modal-header">',
								'<h3>Alert!</h3>',
							'</header>',
							'<div class="modal-body">',
								'<p>',
									message,
								'</p>',
							'</div>',
							'<div class="modal-footer">',
								'<button class="btn btn-primary btn-ok">OK</button>',
							'</div>',
						'</div>'
					].join('');
				};

				var _renderConfirm = function(message) {
					return [
						'<div class="modal">',
							'<header class="modal-header">',
								'<h3>Confirm</h3>',
							'</header>',
							'<div class="modal-body">',
								'<p>',
									message,
								'</p>',
							'</div>',
							'<div class="modal-footer">',
								'<button type="button" class="btn btn-primary btn-ok">OK</button>',
								'<button type="button" class="btn btn-cancel">Cancel</button">',
							'</div>',
						'</div>'
					].join('');
				};

				return {
					/**
					 * Display an alert message on the page
					 * @method alert
					 * @param {string} message The message to be displayed
					 * @param {function} [callback] The callback to be fired when the user
					 * closes the dialog
					 * @for F2.UI.Modals
					 */
					alert: function(message, callback) {

						if (!F2.isInit()) {
							F2.log('F2.init() must be called before F2.UI.Modals.alert()');
							return;
						}

						if (F2.Rpc.isRemote(_appConfig.instanceId)) {
							F2.Rpc.call(
								_appConfig.instanceId,
								F2.Constants.Sockets.UI_RPC,
								'Modals.alert',
								[].slice.call(arguments)
							);
						} else {
							// display the alert
							jQuery(_renderAlert(message))
								.on('show', function() {
									var modal = this;
									jQuery(modal).find('.btn-primary').on('click', function() {
										jQuery(modal).modal('hide').remove();
										(callback || jQuery.noop)();
									});
								})
								.modal({backdrop:true});
						}
					},
					/**
					 * Display a confirm message on the page
					 * @method confirm
					 * @param {string} message The message to be displayed
					 * @param {function} okCallback The function that will be called when the OK
					 * button is pressed
					 * @param {function} cancelCallback The function that will be called when
					 * the Cancel button is pressed
					 * @for F2.UI.Modals
					 */
					confirm: function(message, okCallback, cancelCallback) {

						if (!F2.isInit()) {
							F2.log('F2.init() must be called before F2.UI.Modals.confirm()');
							return;
						}

						if (F2.Rpc.isRemote(_appConfig.instanceId)) {
							F2.Rpc.call(
								_appConfig.instanceId,
								F2.Constants.Sockets.UI_RPC,
								'Modals.confirm',
								[].slice.call(arguments)
							);
						} else {
							// display the alert
							jQuery(_renderConfirm(message))
								.on('show', function() {
									var modal = this;

									jQuery(modal).find('.btn-ok').on('click', function() {
										jQuery(modal).modal('hide').remove();
										(okCallback || jQuery.noop)();
									});

									jQuery(modal).find('.btn-cancel').on('click', function() {
										jQuery(modal).modal('hide').remove();
										(cancelCallback || jQuery.noop)();
									});
								})
								.modal({backdrop:true});
						}
					}
				};
			})(),
			/**
			 * Sets the title of the app as shown in the browser. Depending on the
			 * container HTML, this method may do nothing if the container has not been
			 * configured properly or else the container provider does not allow Title's
			 * to be set.
			 * @method setTitle
			 * @params {string} title The title of the app
			 * @for F2.UI
			 */
			setTitle: function(title) {

				if (F2.Rpc.isRemote(_appConfig.instanceId)) {
					F2.Rpc.call(
						_appConfig.instanceId,
						F2.Constants.Sockets.UI_RPC,
						'setTitle',
						[
							title
						]
					);
				} else {
					jQuery(_appConfig.root).find('.' + F2.Constants.Css.APP_TITLE).text(title);
				}
			},
			/**
			 * Display an ovarlay over an Element on the page
			 * @method showMask
			 * @param {string|Element} selector The Element or selector to an Element
			 * over which to display the loader
			 * @param {bool} showLoading Display a loading icon
			 */
			showMask: function(selector, showLoader) {
				F2.UI.showMask(_appConfig.instanceId, selector, showLoader);
			},
			/**
			 * For secure apps, this method updates the size of the iframe that
			 * contains the app. **Note: It is recommended that app developers call
			 * this method anytime Elements are added or removed from the DOM**
			 * @method updateHeight
			 * @params {int} height The height of the app
			 */
			updateHeight: _updateHeight,
			/**
			 * Helper methods for creating and using Views
			 * @class F2.UI.Views
			 * @for F2.UI
			 */
			Views: (function(){

				var _events = new EventEmitter2();
				var _rValidEvents = /change/i;

				// unlimited listeners, set to > 0 for debugging
				_events.setMaxListeners(0);

				var _isValid = function(eventName) {
					if (_rValidEvents.test(eventName)) {
						return true;
					} else {
						F2.log('"' + eventName + '" is not a valid F2.UI.Views event name');
						return false;
					}
				};

				return {
					/**
					 * Change the current view for the app or add an event listener
					 * @method change
					 * @param {string|function} [input] If a string is passed in, the view
					 * will be changed for the app. If a function is passed in, a change
					 * event listener will be added.
					 * @for F2.UI.Views
					 */
					change: function(input) {

						if (typeof input === 'function') {
							this.on('change', input);
						} else if (typeof input === 'string') {

							if (_appConfig.isSecure && !F2.Rpc.isRemote(_appConfig.instanceId)) {
								F2.Rpc.call(
									_appConfig.instanceId,
									F2.Constants.Sockets.UI_RPC,
									'Views.change',
									[].slice.call(arguments)
								);
							} else if (F2.inArray(input, _appConfig.views)) {
								jQuery('.' + F2.Constants.Css.APP_VIEW, $root)
									.addClass('hide')
									.filter('[data-f2-view="' + input + '"]', $root)
									.removeClass('hide');
								
								_updateHeight();
								_events.emit('change', input);
							}							
						}
					},
					/**
					 * Removes a view event listener
					 * @method off
					 * @param {string} event The event name
		 			 * @param {function} listener The function that will be removed
		 			 * @for F2.UI.Views
					 */
					off: function(event, listener) {
						if (_isValid(event)) {
							_events.off(event, listener);
						}
					},
					/**
					 * Adds a view event listener
					 * @method on
					 * @param {string} event The event name
					 * @param {function} listener The function to be fired when the event is
					 * emitted
					 * @for F2.UI.Views
					 */
					on: function(event, listener) {
						if (_isValid(event)) {
							_events.on(event, listener);
						}
					}
				}
			})()
		};
	};

	/**
	 * Removes a overlay from an Element on the page
	 * @method hideMask
	 * @static
	 * @param {string} instanceId The Instance ID of the app
	 * @param {string|Element} selector The Element or selector to an Element
	 * that currently contains the loader
	 * @for F2.UI
	 */
	UI_Class.hideMask = function(instanceId, selector) {

		if (!F2.isInit()) {
			F2.log('F2.init() must be called before F2.UI.hideMask()');
			return;
		}

		if (F2.Rpc.isRemote(instanceId) && !jQuery(selector).is('.' + F2.Constants.Css.APP)) {
			F2.Rpc.call(
				instanceId,
				F2.Constants.Sockets.RPC,
				'F2.UI.hideMask',
				[
					instanceId,
					// must only pass the selector argument. if we pass an Element there
					// will be F2.stringify() errors
					jQuery(selector).selector
				]
			);
		} else {
			
			var container = jQuery(selector);
			var mask = container.find('> .' + F2.Constants.Css.MASK).remove();
			container.removeClass(F2.Constants.Css.MASK_CONTAINER);

			// if the element contains this data property, we need to reset static
			// position
			if (container.data(F2.Constants.Css.MASK_CONTAINER)) {
				container.css({'position':'static'});
			}
		}
	};

	/**
	 *
	 * @method init
	 * @static
	 * @param {F2.ContainerConfig} containerConfig The F2.ContainerConfig object
	 */
	UI_Class.init = function(containerConfig) {
		_containerConfig = containerConfig;

		// set defaults
		_containerConfig.UI = jQuery.extend(true, {}, F2.ContainerConfig.UI, _containerConfig.UI || {});
	};

	/**
	 * Display an ovarlay over an Element on the page
	 * @method showMask
	 * @static
	 * @param {string} instanceId The Instance ID of the app
	 * @param {string|Element} selector The Element or selector to an Element
	 * over which to display the loader
	 * @param {bool} showLoading Display a loading icon
	 */
	UI_Class.showMask = function(instanceId, selector, showLoading) {

		if (!F2.isInit()) {
			F2.log('F2.init() must be called before F2.UI.showMask()');
			return;
		}

		if (F2.Rpc.isRemote(instanceId) && jQuery(selector).is('.' + F2.Constants.Css.APP)) {
			F2.Rpc.call(
				instanceId,
				F2.Constants.Sockets.RPC,
				'F2.UI.showMask',
				[
					instanceId,
					// must only pass the selector argument. if we pass an Element there
					// will be F2.stringify() errors
					jQuery(selector).selector,
					showLoading
				]
			);
		} else {

			if (showLoading && !_containerConfig.UI.Mask.loadingIcon) {
				F2.log('Unable to display loading icon. Please set F2.ContainerConfig.UI.Mask.loadingIcon	when calling F2.init();');
			}

			var container = jQuery(selector).addClass(F2.Constants.Css.MASK_CONTAINER);
			var mask = jQuery('<div>')
				.height('100%' /*container.outerHeight()*/)
				.width('100%' /*container.outerWidth()*/)
				.addClass(F2.Constants.Css.MASK);

			// set inline styles if useClasses is false
			if (!_containerConfig.UI.Mask.useClasses) {
				mask.css({
					'background-color':_containerConfig.UI.Mask.backgroundColor,
					'background-image': !!_containerConfig.UI.Mask.loadingIcon ? ('url(' + _containerConfig.UI.Mask.loadingIcon + ')') : '',
					'background-position':'50% 50%',
					'background-repeat':'no-repeat',
					'display':'block',
					'left':0,
					'min-height':30,
					'padding':0,
					'position':'absolute',
					'top':0,
					'z-index':_containerConfig.UI.Mask.zIndex,

					'filter':'alpha(opacity=' + (_containerConfig.UI.Mask.opacity * 100) + ')',
					'opacity':_containerConfig.UI.Mask.opacity
				});
			}

			// only set the position if the container is currently static
			if (container.css('position') === 'static') {
				container.css({'position':'relative'});
				// setting this data property tells hideMask to set the position
				// back to static
				container.data(F2.Constants.Css.MASK_CONTAINER, true);
			}

			// add the mask to the container
			container.append(mask);
		}
	};

	return UI_Class;
})());
/**
 * Root namespace of the F2 SDK
 * @module f2
 * @class F2
 */
F2.extend('', (function(){

	var _apps = {};
	var _config = false;

	/**
	 * Appends the app's html to the DOM
	 * @method _afterAppRender
	 * @private
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 * @param {string} html The string of html
	 * @return {Element} The DOM Element that contains the app
	 */
	var _afterAppRender = function(appConfig, html) {

		var handler = _config.afterAppRender || function(appConfig, html) {
			return jQuery(html).appendTo('body');
		};
		var appContainer = handler(appConfig, html);

		if (!!_config.afterAppRender && !appContainer) {
			F2.log('F2.ContainerConfig.afterAppRender() must return the DOM Element that contains the app');
			return;
		} else {
			// apply APP class and Instance ID
			jQuery(appContainer).addClass(F2.Constants.Css.APP);
			return appContainer.get(0);
		}
	};

	/**
	 * Renders the html for an app.
	 * @method _appRender
	 * @private
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 * @param {string} html The string of html
	 */
	var _appRender = function(appConfig, html) {

		function outerHtml(html) {
			return jQuery('<div></div>').append(html).html();
		}

		// apply APP_CONTAINER class
		html = outerHtml(jQuery(html).addClass(F2.Constants.Css.APP_CONTAINER + ' ' + appConfig.appId));

		// optionally apply wrapper html
		if (_config.appRender) {
			html = _config.appRender(appConfig, html);
		}

		// apply APP class and instanceId
		return outerHtml(html);
	};

	/**
	 * Rendering hook to allow containers to render some html prior to an app
	 * loading
	 * @method _beforeAppRender
	 * @private
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 * @return {Element} The DOM Element surrounding the app
	 */
	var _beforeAppRender = function(appConfig) {
		var handler = _config.beforeAppRender || jQuery.noop;
		return handler(appConfig);
	};

	/**
	 * Adds properties to the AppConfig object
	 * @method _hydrateAppConfig
	 * @private
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 */
	var _hydrateAppConfig = function(appConfig) {

		// create the instanceId for the app
		appConfig.instanceId = appConfig.instanceId || F2.guid();

		// default the views if not provided
		appConfig.views = appConfig.views || [];
		if (!F2.inArray(F2.Constants.Views.HOME, appConfig.views)) {
			appConfig.views.push(F2.Constants.Views.HOME);
		}
	};

	/**
	 * Attach app events
	 * @method _initAppEvents
	 * @private
	 */
	var _initAppEvents = function (appConfig) {

		jQuery(appConfig.root).on('click', '.' + F2.Constants.Css.APP_VIEW_TRIGGER + '[' + F2.Constants.Views.DATA_ATTRIBUTE + ']', function(event) {

			event.preventDefault();

			var view = jQuery(this).attr(F2.Constants.Views.DATA_ATTRIBUTE).toLowerCase();

			// handle the special REMOVE view
			if (view == F2.Constants.Views.REMOVE) {
				F2.removeApp(appConfig.instanceId);
			} else {
				appConfig.ui.Views.change(view);
			}
		});
	};

	/**
	 * Attach container Events
	 * @method _initContainerEvents
	 * @private
	 */
	var _initContainerEvents = function() {

		var resizeTimeout;
		var resizeHandler = function() {
			F2.Events.emit(F2.Constants.Events.CONTAINER_WIDTH_CHANGE);
		};

		jQuery(window).on('resize', function() {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(resizeHandler, 100);
		});
	};

	/**
	 * Has the container been init?
	 * @method _isInit
	 * @private
	 * @return {bool} True if the container has been init
	 */
	var _isInit = function() {
		return !!_config;
	};

	/**
	 * Loads the app's html/css/javascript
	 * @method loadApp
	 * @private
	 * @param {Array} appConfigs An array of
	 * {{#crossLink "F2.AppConfig"}}{{/crossLink}} objects
	 * @param {F2.AppManifest} [appManifest] The AppManifest object
	 */
	var _loadApps = function(appConfigs, appManifest) {

		appConfigs = [].concat(appConfigs);

		// check for secure app
		if (appConfigs.length == 1 && appConfigs[0].isSecure && !_config.isSecureAppPage) {
			_loadSecureApp(appConfigs[0], appManifest);
			return;
		}

		// check that the number of apps in manifest matches the number requested
		if (appConfigs.length != appManifest.apps.length) {
			F2.log('The number of apps defined in the AppManifest do not match the number requested.', appManifest);
			return;
		}

		var scripts = appManifest.scripts || [];
		var styles = appManifest.styles || [];
		var inlines = appManifest.inlineScripts || [];
		var scriptCount = scripts.length;
		var scriptsLoaded = 0;
		var appInit = function() {
			jQuery.each(appConfigs, function(i, a) {
				// instantiate F2.UI
				a.ui = new F2.UI(a);

				// instantiate F2.App
				if (F2.Apps[a.appId] !== undefined) {
					if (typeof F2.Apps[a.appId] === 'function') {

						// 
						setTimeout(function() {
							_apps[a.instanceId].app = new F2.Apps[a.appId](a, appManifest.apps[i], a.root);
							if (_apps[a.instanceId].app['init'] !== undefined) {
								_apps[a.instanceId].app.init();
							}
						}, 0);
						
					} else {
						F2.log('app initialization class is defined but not a function. (' + a.appId + ')');
					}
				}
			});
		};

		// load styles
		var stylesFragment = [];
		jQuery.each(styles, function(i, e) {
			stylesFragment.push('<link rel="stylesheet" type="text/css" href="' + e + '"/>');
		});
		jQuery('head').append(stylesFragment.join(''));

		// load html
		jQuery.each(appManifest.apps, function(i, a) {
			// load html and save the root node
			appConfigs[i].root = _afterAppRender(appConfigs[i], _appRender(appConfigs[i], a.html));
			// init events
			_initAppEvents(appConfigs[i]);
		});

		// load scripts and eval inlines once complete
		jQuery.each(scripts, function(i, e) {
			jQuery.ajax({
				url:e,
				/*	we want any scripts added this way to be cached by the browser. 
				 	if you don't add 'cache:true' here, jquery adds a number on a URL param (?_=1353339224904)*/
				cache:true,
				async:false,
				dataType:'script',
				type:'GET',
				success:function() {
					if (++scriptsLoaded == scriptCount) {
						jQuery.each(inlines, function(i, e) {
							try {
								eval(e);
							} catch (exception) {
								F2.log('Error loading inline script: ' + exception + '\n\n' + e);
							}
						});
						// fire the load event to tell the app it can proceed
						appInit();
					}
				},
				error:function(jqxhr, settings, exception) {
					F2.log(['Failed to load script (' + e +')', exception.toString()]);
				}
			});
		});

		// if no scripts were to be processed, fire the appLoad event
		if (!scriptCount) {
			appInit();
		}
	};

	/**
	 * Loads the app's html/css/javascript into an iframe
	 * @method loadSecureApp
	 * @private
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 * @param {F2.AppManifest} appManifest The app's html/css/js to be loaded into the
	 * page.
	 */
	var _loadSecureApp = function(appConfig, appManifest) {

		// make sure the container is configured for secure apps
		if (_config.secureAppPagePath) {
			// create the html container for the iframe
			appConfig.root = _afterAppRender(appConfig, _appRender(appConfig, '<div></div>'));
			// instantiate F2.UI
			appConfig.ui = new F2.UI(appConfig);
			// init events
			_initAppEvents(appConfig);
			// create RPC socket
			F2.Rpc.register(appConfig, appManifest);
		} else {
			F2.log('Unable to load secure app: \"secureAppPagePath\" is not defined in F2.ContainerConfig.');
		}
	};

	/**
	 * Checks if the app is valid
	 * @method _validateApp
	 * @private
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 * @returns {bool} True if the app is valid
	 */
	var _validateApp = function(appConfig) {

		// check for valid app configurations
		if (!appConfig.appId) {
			F2.log('"appId" missing from app object');
			return false;
		} else if (!appConfig.manifestUrl) {
			F2.log('manifestUrl" missing from app object');
			return false;
		}

		return true;
	};

	return {
		/**
		 * Gets the current list of apps in the container
		 * @method getContainerState
		 * @returns {Array} An array of objects containing the appId
		 */
		getContainerState: function() {
			if (!_isInit()) {
				F2.log('F2.init() must be called before F2.getContainerState()');
				return;
			}

			return jQuery.map(_apps, function(e, i) {
				return { appId: e.config.appId };
			});
		},
		/**
		 * Initializes the container. This method must be called before performing
		 * any other actions in the container.
		 * @method init
		 * @param {F2.ContainerConfig} config The configuration object
		 */
		init: function(config) {
			_config = config || {};

			if (!!_config.secureAppPagePath) {
				F2.Rpc.init(_config.secureAppPagePath);
			}
			
			F2.UI.init(_config);

			if (!_config.isSecureAppPage) {
				_initContainerEvents();
			}
		},
		/**
		 * Has the container been init?
		 * @method isInit
		 * @return {bool} True if the container has been init
		 */
		isInit: _isInit,
		/**
		 * Begins the loading process for all apps. The app will
		 * be passed the {{#crossLink "F2.AppConfig"}}{{/crossLink}} object which will
		 * contain the app's unique instanceId within the container. Optionally, the
		 * {{#crossLink "F2.AppManifest"}}{{/crossLink}} can be passed in and those
		 * assets will be used instead of making a request.
		 * @method registerApps
		 * @param {Array} appConfigs An array of {{#crossLink "F2.AppConfig"}}{{/crossLink}}
		 * objects
		 * @param {Array} [appManifests] An array of
		 * {{#crossLink "F2.AppManifest"}}{{/crossLink}}
		 * objects. This array must be the same length as the apps array that is
		 * objects. This array must be the same length as the apps array that is
		 * passed in. This can be useful if apps are loaded on the server-side and
		 * passed down to the client.
		 */
		registerApps: function(appConfigs, appManifests) {

			if (!_isInit()) {
				F2.log('F2.init() must be called before F2.registerApps()');
				return;
			} else if (!appConfigs) {
				F2.log('At least one AppConfig must be passed when calling F2.registerApps()');
				return;
			}

			var appStack = [];
			var batches = {};
			var callbackStack = {};
			var haveManifests = false;
			appConfigs = [].concat(appConfigs);
			appManifests = appManifests || [];
			haveManifests = !!appManifests.length;

			// appConfigs must have a length
			if (!appConfigs.length) {
				F2.log('At least one AppConfig must be passed when calling F2.registerApps()');
				return;
			// ensure that the array of apps and manifests are qual
			} else if (appConfigs.length && haveManifests && appConfigs.length != appManifests.length) {
				F2.log('The length of "apps" does not equal the length of "appManifests"');
				return;
			}

			// validate each app and assign it an instanceId
			// then determine which apps can be batched together
			jQuery.each(appConfigs, function(i, a) {

				if (!_validateApp(a)) {
					return; // move to the next app
				}

				// add properties and methods
				_hydrateAppConfig(a);

				// fire beforeAppRender
				a.root = _beforeAppRender(a);

				// save app
				_apps[a.instanceId] = { config:a };

				// if we have the manifest, go ahead and load the app
				if (haveManifests) {
					_loadApps(a, appManifests[i]);
				} else {
					// check if this app can be batched
					if (a.enableBatchRequests && !a.isSecure) {
						batches[a.manifestUrl.toLowerCase()] = batches[a.manifestUrl.toLowerCase()] || [];
						batches[a.manifestUrl.toLowerCase()].push(a);
					} else {
						appStack.push({
							apps:[a],
							url:a.manifestUrl
						});
					}
				}
			});

			// we don't have the manifests, go ahead and load them
			if (!haveManifests) {
				// add the batches to the appStack
				jQuery.each(batches, function(i, b) {
					appStack.push({ url:i, apps:b })
				});

				// if an app is being loaded more than once on the page, there is the
				// potential that the jsonp callback will be clobbered if the request
				// for the AppManifest for the app comes back at the same time as
				// another request for the same app.  We'll create a callbackStack
				// that will ensure that requests for the same app are loaded in order
				// rather than at the same time
				jQuery.each(appStack, function(i, req) {
					// define the callback function based on the first app's App ID
					var jsonpCallback = F2.Constants.JSONP_CALLBACK + req.apps[0].appId;

					// push the request onto the callback stack
					callbackStack[jsonpCallback] = callbackStack[jsonpCallback] || [];
					callbackStack[jsonpCallback].push(req);
				});

				// loop through each item in the callback stack and make the request
				// for the AppManifest. When the request is complete, pop the next 
				// request off the stack and make the request.
				jQuery.each(callbackStack, function(i, requests) {

					var manifestRequest = function(jsonpCallback, req) {
						if (!req) { return; }

						jQuery.ajax({
							url:req.url,
							data:{
								params:F2.stringify(req.apps, F2.appConfigReplacer)
							},
							jsonp:false, /* do not put 'callback=' in the query string */
							jsonpCallback:jsonpCallback, /* Unique function name */
							dataType:'jsonp',
							success:function(appManifest) {
								_loadApps(req.apps, appManifest);
							},
							error:function(jqxhr, settings, exception) {
								F2.log('Failed to load app(s)', exception.toString(), req.apps);
								//remove failed app(s)
								jQuery.each(req.apps, function(idx,item){
									F2.log('Removed failed ' +item.name+ ' app', item);
									F2.removeApp(item.instanceId);
								});
							},
							complete:function() {
								manifestRequest(i, requests.pop());
							}
						});
					};

					manifestRequest(i, requests.pop());
				});
			}
		},
		/**
		 * Removes all apps from the container
		 * @method removeAllApps
		 */
		removeAllApps: function() {

			if (!_isInit()) {
				F2.log('F2.init() must be called before F2.removeAllApps()');
				return;
			}

			jQuery.each(_apps, function(i, a) {
				F2.removeApp(a.config.instanceId);
			});
		},
		/**
		 * Removes an app from the container
		 * @method removeApp
		 * @param {string} instanceId The app's instanceId
		 */
		removeApp: function(instanceId) {

			if (!_isInit()) {
				F2.log('F2.init() must be called before F2.removeApp()');
				return;
			}

			if (_apps[instanceId]) {
				jQuery(_apps[instanceId].config.root).fadeOut(function() {
					jQuery(this).remove();
				});

				delete _apps[instanceId];
			}
		}
	};
})());

  exports.F2 = F2;

  // if (typeof require !== 'undefined' && require.amd) {
  //   define(function() {
  //     return F2;
  //   });

  //   exports.requirejs = requirejs;
  //   exports.require = require;
  //   exports.define = define;
  // }

})(typeof exports !== 'undefined' ? exports : window);
