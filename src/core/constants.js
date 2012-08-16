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
			 * including any extra html that surrounds the APP_CONTAINER that is inserted 
			 * by the Container. See appWrapper property in the {@link F2.ContainerConfiguration}
			 * object.
			 * @property APP
			 * @type string
			 * @static
			 * @final
			 */
			APP:_PREFIX + "app",
			/**
			 * The APP_CONTAINER class should be applied to the outermost DOM Element
			 * of the App.
			 * @property APP_CONTAINER
			 * @type string
			 * @static
			 * @final
			 */
			APP_CONTAINER:_PREFIX + "app-container",
			/**
			 * The APP_REMOVE_BUTTON class should be applied to the DOM Element that
			 * will remove an App.
			 * @property APP_REMOVE_BUTTON
			 * @type string
			 * @static
			 * @final
			 */
			APP_REMOVE_BUTTON:_PREFIX + "btn-remove",
			/**
			 * The APP_VIEW class should be applied to the DOM Element that contains
			 * a view for an App. The DOM Element should also have a {@link F2.Constants.Views.DATA_ATTRIBUTE}
			 * attribute that specifies which {@link F2.Constants.Views} it is. 
			 * @property APP_VIEW
			 * @type string
			 * @static
			 * @final
			 */
			APP_VIEW: "app-view",
			/**
			 * APP_VIEW_TRIGGER class shuld be applied to the DOM Elements that
			 * trigger an {@link F2.Constants.Events}.APP_VIEW_CHANGE event. The DOM Element
			 * should also have a {@link F2.Constants.Views.DATA_ATTRIBUTE} attribute that
			 * specifies which {@link F2.Constants.Views} it will trigger.
			 * @property APP_VIEW_TRIGGER
			 * @type string
			 * @static
			 * @final
			 */
			APP_VIEW_TRIGGER: "app-view-trigger"
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
			 * The APPLICATION_LOAD event is fired once an App's Styles, Scripts, Inline 
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
			 * The APP_HEIGHT_CHANGE event should be fired by an App when the height of the
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
			 * The APP_SYMBOL_CHANGE event is fired when the symbol is changed in an App. It 
			 * is up to the App developer to fire this event.
			 * Returns an object with the symbol and company name:
			 *
			 *     { symbol: "MSFT", name: "Microsoft Corp (NAZDAQ)" }
			 *
			 * @property APP_SYMBOL_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			APP_SYMBOL_CHANGE:_APP_EVENT_PREFIX + "symbolChange",
			/**
			 * The APP_VIEW_CHANGE event will be fired by the Container when a user clicks
			 * to switch the view for an App. The App's instanceId should be concatenated
			 * to this constant.
			 * @property APP_VIEW_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			APP_VIEW_CHANGE:_APP_EVENT_PREFIX + "viewChange.",
			/**
			 * The CONTAINER_SYMBOL_CHANGE event is fired when the symbol is changed at the Container
			 * level. This event should only be fired by the Container or Container Provider.
			 * Returns an object with the symbol and company name:
			 *
			 *     { symbol: "MSFT", name: "Microsoft Corp (NAZDAQ)" }
			 *
			 * @property CONTAINER_SYMBOL_CHANGE
			 * @type string
			 * @static
			 * @final
			 */
			CONTAINER_SYMBOL_CHANGE:_CONTAINER_EVENT_PREFIX + "symbolChange",
			/**
			 * The SOCKET_LOAD event is fired when an iframe socket initially loads. It is only
			 * used with easyXDM and not with EventEmitter2
			 * Returns a JSON string that represents an {@link F2.App}
			 * object and an {@link F2.AppAssets} object
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
	 * the {@link F2.Constants.Css.APP_VIEW} class to thecontaining DOM Element. A 
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