/* eslint-disable no-unused-vars */

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
export default function (appConfig, appContent, root) {
	return {
		/**
		 * An optional init function that will automatically be called when
		 *{{#crossLink "F2/registerApps"}}F2.registerApps(){{/crossLink}} is called.
		 * @method init
		 * @optional
		 */
		init: function () {},
		/**
		 * An optional destroy function that will automatically be called when
		 * {{#crossLink "F2/removeApp"}}F2.removeApp(){{/crossLink}} and subsequently
		 * the {{#crossLink "F2.Constants.AppHandlers/APP_DESTROY:property"}}F2.Constants.AppHandlers.APP_DESTROY{{/crossLink}} AppHandler.
		 * @method destroy
		 * @optional
		 */
		destroy: function () {}
	};
}
