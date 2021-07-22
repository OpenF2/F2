/**
 * Constants used throughout the Open Financial Framework
 * @class F2.Constants.AppHandlers
 * @static
 */
module.exports = {
	/**
	* When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the
	* following argument(s): ( {{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}} )
	* @property APP_MANIFEST_REQUEST_FAIL
	* @type string
	* @static
	* @final
	* @example
	*	var _token = F2.AppHandlers.getToken();
	*	F2.AppHandlers.on(
	*		_token,
	*		F2.Constants.AppHandlers.APP_MANIFEST_REQUEST_FAIL,
	*		function(appConfig)
	*		{
	*			You can use information from the appConfig to surface a custom error message in the dom
	*			Or display some kind of default error placeholder element rather than having a blank spot in the dom
	*		}
	*	);
	*/
	APP_MANIFEST_REQUEST_FAIL: 'appManifestRequestFail',
	/**
	* Identifies the create root method for use in AppHandlers.on/off.
	* When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the
	* following argument(s): ( {{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}} )
	* @property APP_CREATE_ROOT
	* @type string
	* @static
	* @final
	* @example
	*	var _token = F2.AppHandlers.getToken();
	*	F2.AppHandlers.on(
	*		_token,
	*		F2.Constants.AppHandlers.APP_CREATE_ROOT,
	*		function(appConfig)
	*		{
	*			// If you want to create a custom root. By default F2 uses the app's outermost HTML element.
	*			// the app's html is not available until after the manifest is retrieved so this logic occurs in F2.Constants.AppHandlers.APP_RENDER
	*			appConfig.root = document.createElement('section');
	*		}
	*	);
	*/
	APP_CREATE_ROOT: 'appCreateRoot',
	/**
	 * Identifies the before app render method for use in AppHandlers.on/off.
	 * When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the
	 * following argument(s): ( {{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}} )
	 * @property APP_RENDER_BEFORE
	 * @type string
	 * @static
	 * @final
	 * @example
	 *	var _token = F2.AppHandlers.getToken();
	 *	F2.AppHandlers.on(
	 *		_token,
	 *		F2.Constants.AppHandlers.APP_RENDER_BEFORE,
	 *		function(appConfig)
	 *		{
	 *			F2.log(appConfig);
	 *		}
	 *	);
	 */
	APP_RENDER_BEFORE: 'appRenderBefore',
	/**
	* Identifies the app render method for use in AppHandlers.on/off.
	* When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the
	* following argument(s): ( {{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}}, [appHtml](../../app-development.html#app-design) )
	* @property APP_RENDER
	* @type string
	* @static
	* @final
	* @example
	*   var _token = F2.AppHandlers.getToken();
            *   F2.AppHandlers.on(
            *       _token,
            *       F2.Constants.AppHandlers.APP_RENDER,
            *       function(appConfig, appHtml)
            *       {
            *           // if no app root is defined use the app's outer most node
            *           if(!appConfig.root)
            *           {
            *               appConfig.root = domify(appHtml);                               
            *           }
            *           else
            *           {                       
            *               // append the app html to the root
            *               appConfig.root.appendChild(domify(appHtml));
            *           }           
            *           
            *           // append the root to the body by default.
            *           document.body.appendChild(appConfig.root);
            *       }
            *   );
            */
	APP_RENDER: 'appRender',
	/**
	* Identifies the after app render method for use in AppHandlers.on/off.
	* When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the
	* following argument(s): ( {{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}} )
	* @property APP_RENDER_AFTER
	* @type string
	* @static
	* @final
	* @example
	*	var _token = F2.AppHandlers.getToken();
	*	F2.AppHandlers.on(
	*		_token,
	*		F2.Constants.AppHandlers.APP_RENDER_AFTER,
	*		function(appConfig)
	*		{
	*			F2.log(appConfig);
	*		}
	*	);
	*/
	APP_RENDER_AFTER: 'appRenderAfter',
	/**
	* Identifies the before app destroy method for use in AppHandlers.on/off.
	* When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the
	* following argument(s): ( appInstance )
	* @property APP_DESTROY_BEFORE
	* @type string
	* @static
	* @final
	* @example
	*	var _token = F2.AppHandlers.getToken();
	*	F2.AppHandlers.on(
	*		_token,
	*		F2.Constants.AppHandlers.APP_DESTROY_BEFORE,
	*		function(appInstance)
	*		{
	*			F2.log(appInstance);
	*		}
	*	);
	*/
	APP_DESTROY_BEFORE: 'appDestroyBefore',
	/**
	* Identifies the app destroy method for use in AppHandlers.on/off.
	* When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the
	* following argument(s): ( appInstance )
	* @property APP_DESTROY
	* @type string
	* @static
	* @final
	* @example
	*   var _token = F2.AppHandlers.getToken();
            *   F2.AppHandlers.on(
            *       _token,
            *       F2.Constants.AppHandlers.APP_DESTROY,
            *       function(appInstance)
            *       {
            *           // call the apps destroy method, if it has one
            *           if(appInstance && appInstance.app && appInstance.app.destroy && typeof(appInstance.app.destroy) == 'function')
            *           {
            *               appInstance.app.destroy();
            *           }
            *           else if(appInstance && appInstance.app && appInstance.app.destroy)
            *           {
            *               F2.log(appInstance.config.appId + ' has a destroy property, but destroy is not of type function and as such will not be executed.');
            *           }
            *           
            *           // remove the root          
            *           appInstance.config.root.parentNode.removeChild(appInstance.config.root);
            *       }
            *   );
            */
	APP_DESTROY: 'appDestroy',
	/**
	* Identifies the after app destroy method for use in AppHandlers.on/off.
	* When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the
	* following argument(s): ( appInstance )
	* @property APP_DESTROY_AFTER
	* @type string
	* @static
	* @final
	* @example
	*   var _token = F2.AppHandlers.getToken();
            *   F2.AppHandlers.on(
            *       _token,
            *       F2.Constants.AppHandlers.APP_DESTROY_AFTER,
            *       function(appInstance)
            *       {
            *           F2.log(appInstance);
            *       }
            *   );
            */
	APP_DESTROY_AFTER: 'appDestroyAfter',
	/**
	* Identifies the app script load failed method for use in AppHandlers.on/off.
	* When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the listener function passed will receive the
	* following argument(s): ( {{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}}, scriptInfo )
	* @property APP_SCRIPT_LOAD_FAILED
	* @type string
	* @static
	* @final
	* @example
	* var _token = F2.AppHandlers.getToken();
	* F2.AppHandlers.on(
	*     _token,
	*     F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED,
	*     function(appConfig, scriptInfo) {
	*         F2.log(appConfig.appId);
	*     }
	* );
	*/
	APP_SCRIPT_LOAD_FAILED: 'appScriptLoadFailed'
};