define("F2.Classes", [], function() {
	return {
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
				init: function() { }
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
			appId: '',
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
			instanceId: '',
			/**
			 * The url to retrieve the {{#crossLink "F2.AppManifest"}}{{/crossLink}}
			 * object.
			 * @property manifestUrl
			 * @type string
			 * @required
			 */
			manifestUrl: '',
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
			name: '',
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
			html: '',
			/**
			 * A status message
			 * @property status
			 * @type string
			 * @optional
			 */
			status: ''
		},
		/**
		 * An object containing configuration information for the
		 * [container](../../container-development.html)
		 * @class F2.ContainerConfig
		 */
		ContainerConfig: {
			/**
			 * True to enable debug mode in F2.js. Adds additional logging, resource cache busting, etc.
			 * @property debugMode
			 * @type bool
			 * @default false
			 */
			debugMode: false,
			// TODO: add documentation
			loadScripts: function(paths, inlineScripts, callback) { },
			// TODO: add documentation
			loadStyles: function(paths) { },
			/**
			 * Milliseconds before F2 fires callback on script resource load errors. Due to issue with the way Internet Explorer attaches load events to script elements, the error event doesn't fire.
			 * @property scriptErrorTimeout
			 * @type milliseconds
			 * @default 7000 (7 seconds)
			 */
			scriptErrorTimeout: 7000,
			/**
			 * Specifies what views a container will provide buttons
			 * or links to. Generally, the views will be switched via buttons or links
			 * in the app's header.
			 * @property supportedViews
			 * @type Array
			 * @required
			 */
			supportedViews: [],
			/**
			 * Allows the container to override individual parts of the AppManifest
			 * request.  See properties and methods with the `xhr.` prefix.
			 * @property xhr
			 * @type Object
			 *
			 * @example
			 *     F2.init({
			 *         xhr: {
			 *             url: function(url, appConfigs) {
			 *                 return 'http://example.com/proxy.php?url=' + encocdeURIComponent(url);
			 *             }
			 *         }
			 *     });
			 */
			xhr: {
				/**
				 * Allows the container to override the request data type (JSON or JSONP)
				 * that is used for the request
				 * @method xhr.dataType
				 * @param {string} url The manifest url
				 * @param {Array} appConfigs An array of {{#crossLink "F2.AppConfig"}}{{/crossLink}}
				 * objects
				 * @return {string} The request data type that should be used
				 *
				 * @example
				 *     F2.init({
				 *         xhr: {
				 *             dataType: function(url) {
				 *                 return F2.isLocalRequest(url) ? 'json' : 'jsonp';
				 *             },
				 *             type: function(url) {
				 *                 return F2.isLocalRequest(url) ? 'POST' : 'GET';
				 *             }
				 *         }
				 *     });
				 */
				dataType: function(url, appConfigs) { },
				/**
				 * Allows the container to override the request method that is used (just
				 * like the `type` parameter to `jQuery.ajax()`.
				 * @method xhr.type
				 * @param {string} url The manifest url
				 * @param {Array} appConfigs An array of {{#crossLink "F2.AppConfig"}}{{/crossLink}}
				 * objects
				 * @return {string} The request method that should be used
				 *
				 * @example
				 *     F2.init({
				 *         xhr: {
				 *             dataType: function(url) {
				 *                 return F2.isLocalRequest(url) ? 'json' : 'jsonp';
				 *             },
				 *             type: function(url) {
				 *                 return F2.isLocalRequest(url) ? 'POST' : 'GET';
				 *             }
				 *         }
				 *     });
				 */
				type: function(url, appConfigs) { },
				/**
				 * Allows the container to override the url that is used to request an
				 * app's F2.{{#crossLink "F2.AppManifest"}}{{/crossLink}}
				 * @method xhr.url
				 * @param {string} url The manifest url
				 * @param {Array} appConfigs An array of {{#crossLink "F2.AppConfig"}}{{/crossLink}}
				 * objects
				 * @return {string} The url that should be used for the request
				 *
				 * @example
				 *     F2.init({
				 *         xhr: {
				 *             url: function(url, appConfigs) {
				 *                 return 'http://example.com/proxy.php?url=' + encocdeURIComponent(url);
				 *             }
				 *         }
				 *     });
				 */
				url: function(url, appConfigs) { }
			}
		}
	};
});