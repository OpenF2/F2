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