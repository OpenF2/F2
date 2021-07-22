/**
 * Constants used throughout the Open Financial Framework
 * @class F2.Constants.Events
 * @static
 */
export default {
	/**
	 * The APP_SCRIPTS_LOADED event is fired when all the scripts defined in
	 * the AppManifest have been loaded.
	 * @property APP_SCRIPTS_LOADED
	 * @type string
	 * @static
	 * @final
	 */
	APP_SCRIPTS_LOADED: 'App.scriptsLoaded',
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
	APP_SYMBOL_CHANGE: 'App.symbolChange',
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
	APP_WIDTH_CHANGE: 'App.widthChange.',
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
	CONTAINER_SYMBOL_CHANGE: 'Container.symbolChange',
	/**
	 * The CONTAINER\_WIDTH\_CHANGE event will be fired by the container when
	 * the width of the container has changed.
	 * @property CONTAINER_WIDTH_CHANGE
	 * @type string
	 * @static
	 * @final
	 */
	CONTAINER_WIDTH_CHANGE: 'Container.widthChange',
	/**
	 * The CONTAINER\_LOCALE\_CHANGE event will be fired by the container when
	 * the locale of the container has changed. This event should only be fired by the
	 * container or container provider.
	 * Returns an object with the updated locale (IETF-defined standard language tag):
	 *
	 *     { locale: 'en-us' }
	 *
	 * @property CONTAINER_LOCALE_CHANGE
	 * @type string
	 * @static
	 * @final
	 */
	CONTAINER_LOCALE_CHANGE: 'Container.localeChange'
};
