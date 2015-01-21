/**
  A convenient collection of all available appHandler events.
  @class F2.Constants.AppHandlers
*/
module.exports = {
  /**
    Equivalent to `appCreateRoot`. Identifies the create root method for use
    in AppHandlers.on/off. When bound using
    {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the
    listener function passed will receive the following argument(s):
    ({{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}}).
    @property APP_CREATE_ROOT
    @type string
    @static
    @final
    @example
      var token = F2.AppHandlers.getToken();
      F2.AppHandlers.on(
        token,
        F2.Constants.AppHandlers.APP_CREATE_ROOT,
        function(appConfig) {
          // If you want to create a custom root. By default F2 uses the app's outermost HTML element.
          // The app's html is not available until after the manifest is retrieved so this logic occurs in F2.Constants.AppHandlers.APP_RENDER
          appConfig.root = jQuery('<section></section>').get(0);
        }
      );
  */
  APP_CREATE_ROOT: 'appCreateRoot',
  /**
    Equivalent to `appRenderBefore`. Identifies the before app render method
    for use in AppHandlers.on/off. When bound using
    {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the
    listener function passed will receive the following argument(s):
    ({{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}}).
    @property APP_RENDER_BEFORE
    @type string
    @static
    @final
    @example
      var token = F2.AppHandlers.getToken();
      F2.AppHandlers.on(
        token,
        F2.Constants.AppHandlers.APP_RENDER_BEFORE,
        function(appConfig) {
          F2.log(appConfig);
        }
      );
  */
  APP_RENDER_BEFORE: 'appRenderBefore',
  /**
    Equivalent to `appRender`. Identifies the app render method for use in
    AppHandlers.on/off. When bound using
    {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the
    listener function passed will receive the following argument(s):
    ({{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}},
    [appHtml](../../app-development.html#app-design)).
    @property APP_RENDER
    @type string
    @static
    @final
    @example
      var token = F2.AppHandlers.getToken();
      F2.AppHandlers.on(
        token,
        F2.Constants.AppHandlers.APP_RENDER,
        function(appConfig, appHtml) {
          var $root;

          // If no app root is defined use the app's outer most node
          if (!F2.isNativeDOMNode(appConfig.root)) {
            appConfig.root = jQuery(appHtml).get(0);
            // Get a handle on the root in jQuery
            $root = jQuery(appConfig.root);
          } else {
            // Get a handle on the root in jQuery
            $root = jQuery(appConfig.root);
            // Append the app html to the root
            $root.append(appHtml);
          }

          // Append the root to the body by default.
          jQuery('body').append($root);
        }
      );
  */
  APP_RENDER: 'appRender',
  /**
    Equivalent to `appRenderAfter`. Identifies the after app render method
    for use in AppHandlers.on/off. When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}}
    the listener function passed will receive the following argument(s):
    ({{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}})
    @property APP_RENDER_AFTER
    @type string
    @static
    @final
    @example
      var token = F2.AppHandlers.getToken();
      F2.AppHandlers.on(
        token,
        F2.Constants.AppHandlers.APP_RENDER_AFTER,
        function(appConfig) {
          F2.log(appConfig);
        }
      );
  */
  APP_RENDER_AFTER: 'appRenderAfter',
  /**
    Equivalent to `appDestroyBefore`. Identifies the before app destroy
    method for use in AppHandlers.(on|off). When bound using
    {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the
    listener function passed will receive the following argument(s):
    (appInstance).
    @property APP_DESTROY_BEFORE
    @type string
    @static
    @final
    @example
      var token = F2.AppHandlers.getToken();
      F2.AppHandlers.on(
        token,
        F2.Constants.AppHandlers.APP_DESTROY_BEFORE,
        function(appInstance) {
          F2.log(appInstance);
        }
      );
  */
  APP_DESTROY_BEFORE: 'appDestroyBefore',
  /**
    Equivalent to `appDestroy`. Identifies the app destroy method for use in
    AppHandlers.on/off. When bound using {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}}
    the listener function passed will receive the following argument(s):
    (appInstance)
    @property APP_DESTROY
    @type string
    @static
    @final
    @example
      var token = F2.AppHandlers.getToken();
      F2.AppHandlers.on(
        token,
        F2.Constants.AppHandlers.APP_DESTROY,
        function(appInstance) {
          // Call the apps destroy method, if it has one
          if (appInstance && appInstance.app && appInstance.app.destroy && typeof(appInstance.app.destroy) == 'function') {
            appInstance.app.destroy();
          } else if (appInstance && appInstance.app && appInstance.app.destroy) {
            F2.log(appInstance.config.appId + ' has a destroy property, but destroy is not of type function and as such will not be executed.');
          }

          // Fade out and remove the root
          jQuery(appInstance.config.root).fadeOut(500, function() {
            jQuery(this).remove();
          });
        }
      );
  */
  APP_DESTROY: 'appDestroy',
  /**
    Equivalent to `appDestroyAfter`. Identifies the after app destroy method
    for use in AppHandlers.on/off. When bound using
    {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}} the
    listener function passed will receive the following argument(s):
    (appInstance)
    @property APP_DESTROY_AFTER
    @type string
    @static
    @final
    @example
      var token = F2.AppHandlers.getToken();
      F2.AppHandlers.on(
        token,
        F2.Constants.AppHandlers.APP_DESTROY_AFTER,
        function(appInstance) {
          F2.log(appInstance);
        }
      );
  */
  APP_DESTROY_AFTER: 'appDestroyAfter',
  /**
    Equivalent to `appScriptLoadFailed`. Identifies the app script load
    failed method for use in AppHandlers.on/off. When bound using
    {{#crossLink "F2.AppHandlers/on"}}F2.AppHandlers.on(){{/crossLink}}
    the listener function passed will receive the following argument(s):
    ({{#crossLink "F2.AppConfig"}}appConfig{{/crossLink}}, scriptInfo)
    @property APP_SCRIPT_LOAD_FAILED
    @type string
    @static
    @final
    @example
      var token = F2.AppHandlers.getToken();
      F2.AppHandlers.on(
        token,
        F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED,
        function(appConfig, scriptInfo) {
          F2.log(appConfig.appId);
        }
      );
  */
  APP_SCRIPT_LOAD_FAILED: 'appScriptLoadFailed'
};
