/**
 * An object containing configuration information for the
 * [container](../../container-development.html)
 * @class F2.ContainerConfig
 */
module.exports = {
	/**
	 * True to enable debug mode in F2.js. Adds additional logging, resource cache busting, etc.
	 * @property debugMode
	 * @type bool
	 * @default false
	 */
	debugMode: false,
	/**
	 * The default language and region specification for this container
	 * represented as an IETF-defined standard language tag,
	 * e.g. `"en-us"` or `"de-de"`. This value is passed to each app
	 * registered as `containerLocale`.
	 *
	 * @property locale
	 * @type string
	 * @default null
	 * @since 1.4.0
	 */
	locale: null,
	/**
	 * Milliseconds before F2 fires callback on script resource load errors. Due to issue with the way Internet Explorer attaches load events to script elements, the error event doesn't fire.
	 * @property scriptErrorTimeout
	 * @type milliseconds
	 * @default 7000 (7 seconds)
	 */
	scriptErrorTimeout: 7000,
	/**
	 * Allows the container to fully override how the AppManifest request is
	 * made inside of F2.
	 *
	 * @method xhr
	 * @param {string} url The manifest url
	 * @param {Array} appConfigs An array of {{#crossLink "F2.AppConfig"}}{{/crossLink}}
	 * objects
	 * @param {function} success The function to be called if the request
	 * succeeds
	 * @param {function} error The function to be called if the request fails
	 * @param {function} complete The function to be called when the request
	 * finishes (after success and error callbacks have been executed)
	 * @return {XMLHttpRequest} The XMLHttpRequest object
	 *
	 * @example
         *     F2.init({
         *         xhr: function(url, appConfigs,successCallback, errorCallback, completeCallback) {
         *          var jsonpCallback = F2.Constants.JSONP_CALLBACK + appConfigs[0].appId, // Unique function name
			 *          var fetchUrl = url + '?params=' + F2.stringify(appConfigs.apps, F2.appConfigReplacer);
         *          var fetchFunc = fetchJsonp(fetchUrl, {
         *                          timeout: 3000,
         *                          jsonpCallbackFunction: jsonpCallback
         *                          });                
         *           fetchFunc.then(function(response) {
         *                          return response.json();
         *                      })
         *                      .then(function(data) {
         *                      	successCallback(data);
         *                      	completeCallback();                         
         *                  })
         *                  .catch(function(error) {
         *                      F2.log('Failed to load app(s)', error.toString());
         *                      errorCallback();
         *                  });
         *         }
         *     });
	 *
	 * @for F2.ContainerConfig
	 */
	//xhr: function(url, appConfigs, success, error, complete) {},
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
		dataType: function(url, appConfigs) {},
		/**
		 * Allows the container to override the request method that is used.
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
		type: function(url, appConfigs) {},
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
		url: function(url, appConfigs) {}
	},
	/**
	 * Allows the container to override the script loader which requests
	 * dependencies defined in the {{#crossLink "F2.AppManifest"}}{{/crossLink}}.
	 * @property loadScripts
	 * @type function
	 *
	 * @example
	 *     F2.init({
	 *			loadScripts: function(scripts,inlines,callback){
	 *				//load scripts using $.load() for each script or require(scripts)
	 *				callback();
	 *			}
	 *     });
	 */
	loadScripts: function(scripts,inlines,callback){},
	/**
	 * Allows the container to override the stylesheet loader which requests
	 * dependencies defined in the {{#crossLink "F2.AppManifest"}}{{/crossLink}}.
	 * @property loadStyles
	 * @type function
	 *
	 * @example
	 *     F2.init({
	 *			loadStyles: function(styles,callback){
	 *				//load styles using $.load() for each stylesheet or another method
	 *				callback();
	 *			}
	 *     });
	 */
	loadStyles: function(styles,callback){}
};