var F2 = require('./F2');

/**
  Constants used throughout the Open Financial Framework.
  @class F2.Constants
  @static
*/
module.exports = {
  /**
    A convenient collection of all available appHandler events.
    @class F2.Constants.AppHandlers
  */
  AppHandlers: {
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
  },
  /**
    CSS class constants
    @class F2.Constants.Css
  */
  Css: {
    /**
      The APP class should be applied to the DOM Element that surrounds the
      entire app, including any extra html that surrounds the APP\_CONTAINER
      that is inserted by the container. See the
      {{#crossLink "F2.ContainerConfig"}}{{/crossLink}} object.
      @property APP
      @type string
      @static
      @final
    */
    APP: 'f2-app',
    /**
      The APP\_CONTAINER class should be applied to the outermost DOM Element
      of the app.
      @property APP_CONTAINER
      @type string
      @static
      @final
    */
    APP_CONTAINER: 'f2-app-container',
    /**
      The APP\_TITLE class should be applied to the DOM Element that contains
      the title for an app. If this class is not present, then
      F2.UI.{{#crossLink "F2.UI/setTitle"}}{{/crossLink}} will not function.
      @property APP_TITLE
      @type string
      @static
      @final
    */
    APP_TITLE: 'f2-app-title',
    /**
      The APP\_VIEW class should be applied to the DOM Element that contains
      a view for an app. The DOM Element should also have a
      {{#crossLink "F2.Constants.Views"}}{{/crossLink}}.DATA_ATTRIBUTE
      attribute that specifies which
      {{#crossLink "F2.Constants.Views"}}{{/crossLink}} it is.
      @property APP_VIEW
      @type string
      @static
      @final
    */
    APP_VIEW: 'f2-app-view',
    /**
      APP\_VIEW\_TRIGGER class should be applied to the DOM Elements that
      trigger an
      {{#crossLink "F2.Constants.Events"}}{{/crossLink}}.APP\_VIEW\_CHANGE
      event. The DOM Element should also have a
      {{#crossLink "F2.Constants.Views"}}{{/crossLink}}.DATA_ATTRIBUTE
      attribute that specifies which
      {{#crossLink "F2.Constants.Views"}}{{/crossLink}} it will trigger.
      @property APP_VIEW_TRIGGER
      @type string
      @static
      @final
    */
    APP_VIEW_TRIGGER: 'f2-app-view-trigger',
    /**
      The MASK class is applied to the overlay element that is created
      when the F2.UI.{{#crossLink "F2.UI/showMask"}}{{/crossLink}} method is
      fired.
      @property MASK
      @type string
      @static
      @final
    */
    MASK: 'f2-mask',
    /**
      The MASK_CONTAINER class is applied to the Element that is passed into
      the F2.UI.{{#crossLink "F2.UI/showMask"}}{{/crossLink}} method.
      @property MASK_CONTAINER
      @type string
      @static
      @final
    */
    MASK_CONTAINER: 'f2-mask-container'
  },
  /**
    Events constants
    @class F2.Constants.Events
  */
  Events: {
    /**
      The APP\_SYMBOL\_CHANGE event is fired when the symbol is changed in an
      app. It is up to the app developer to fire this event. Returns an object
      with the symbol and company name:
      `{ symbol: 'MSFT', name: 'Microsoft Corp (NASDAQ)' }`
      @property APP_SYMBOL_CHANGE
      @type string
      @static
      @final
    */
    APP_SYMBOL_CHANGE: 'App.symbolChange',
    /**
      The APP\_WIDTH\_CHANGE event will be fired by the container when the
      width of an app is changed. The app's instanceId should be concatenated
      to this constant. Returns an object with the gridSize and width in pixels:
      `{ gridSize: 8, width: 620 }`
      @property APP_WIDTH_CHANGE
      @type string
      @static
      @final
    */
    APP_WIDTH_CHANGE: 'App.widthChange.',
    /**
      The CONTAINER\_SYMBOL\_CHANGE event is fired when the symbol is changed
      at the container level. This event should only be fired by the container
      or container provider. Returns an object with the symbol and company name:
      `{ symbol: 'MSFT', name: 'Microsoft Corp (NASDAQ)' }`
      @property CONTAINER_SYMBOL_CHANGE
      @type string
      @static
      @final
    */
    CONTAINER_SYMBOL_CHANGE: 'Container.symbolChange',
    /**
      The CONTAINER\_WIDTH\_CHANGE event will be fired by the container when
      the width of the container has changed.
      @property CONTAINER_WIDTH_CHANGE
      @type string
      @static
      @final
    */
    CONTAINER_WIDTH_CHANGE: 'Container.widthChange',
    /**
      The CONTAINER\_LOCALE\_CHANGE event will be fired by the container when
      the locale of the container has changed. This event should only be fired
      by the container or container provider. Returns an object with the
      updated locale (IETF-defined standard language tag):
      `{ locale: 'en-us' }`
      @property CONTAINER_LOCALE_CHANGE
      @type string
      @static
      @final
    */
    CONTAINER_LOCALE_CHANGE: 'Container.localeChange'
  },
  JSONP_CALLBACK: 'F2_jsonpCallback_',
  /**
    Constants for use with cross-domain sockets.
    @class F2.Constants.Sockets
    @protected
  */
  Sockets: {
    /**
      The EVENT message is sent whenever
      F2.Events.{{#crossLink "F2.Events/emit"}}{{/crossLink}} is fired.
      @property EVENT
      @type string
      @static
      @final
    */
    EVENT: '__event__',
    /**
      The LOAD message is sent when an iframe socket initially loads. Returns
      a JSON string that represents: `[ App, AppManifest]`
      @property LOAD
      @type string
      @static
      @final
    */
    LOAD: '__socketLoad__',
    /**
      The RPC message is sent when a method is passed up from within a secure
      app page.
      @property RPC
      @type string
      @static
      @final
    */
    RPC: '__rpc__',
    /**
      The RPC\_CALLBACK message is sent when a call back from an RPC method is
      fired.
      @property RPC_CALLBACK
      @type string
      @static
      @final
    */
    RPC_CALLBACK: '__rpcCallback__',
    /**
      The UI\_RPC message is sent when a UI method called.
      @property UI_RPC
      @type string
      @static
      @final
    */
    UI_RPC: '__uiRpc__'
  },
  /**
    The available view types to apps. The view should be specified by applying
    the {{#crossLink "F2.Constants.Css"}}{{/crossLink}}.APP\_VIEW class to the
    containing DOM Element. A DATA\_ATTRIBUTE attribute should be added to the
    Element as well which defines what view type is represented. The `hide`
    class can be applied to views that should be hidden by default.
    @class F2.Constants.Views
  */
  Views: {
    /**
      The DATA_ATTRIBUTE should be placed on the DOM Element that contains the
      view.
      @property DATA_ATTRIBUTE
      @type string
      @static
      @final
    */
    DATA_ATTRIBUTE: 'data-f2-view',
    /**
      The ABOUT view gives details about the app.
      @property ABOUT
      @type string
      @static
      @final
    */
    ABOUT: 'about',
    /**
      The HELP view provides users with help information for using an app.
      @property HELP
      @type string
      @static
      @final
    */
    HELP: 'help',
    /**
      The HOME view is the main view for an app. This view should always be
      provided by an app.
      @property HOME
      @type string
      @static
      @final
    */
    HOME: 'home',
    /**
      The REMOVE view is a special view that handles the removal of an app from
      the container.
      @property REMOVE
      @type string
      @static
      @final
    */
    REMOVE: 'remove',
    /**
      The SETTINGS view provides users the ability to modify advanced settings
      for an app.
      @property SETTINGS
      @type string
      @static
      @final
    */
    SETTINGS: 'settings'
  }
};
