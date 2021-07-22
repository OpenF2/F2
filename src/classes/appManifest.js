/**
 * The assets needed to render an app on the page
 * @class F2.AppManifest
 */
export default {
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
};