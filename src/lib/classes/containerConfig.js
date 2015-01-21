var uiConfig = require('./uiConfig');
var xhrConfig = require('./xhrConfig');

/**
  An object containing configuration information for the
  [container](../../container-development.html).
  @class F2.ContainerConfig
*/
module.exports = {
  /**
    Allows the [container](../../container-development.html) to override how
    an app's html is inserted into the page. The function should accept an
    {{#crossLink "F2.AppConfig"}}{{/crossLink}} object and also a string of
    html.
    @method afterAppRender
    @deprecated This has been replaced with
    {{#crossLink "F2.AppHandlers"}}{{/crossLink}} and will be removed in v2.0
    @param {F2.AppConfig} appConfig The F2.AppConfig object
    @param {string} html The string of html representing the app
    @return {Element} The DOM Element surrounding the app
  */
  afterAppRender: null,
  /**
    Allows the [container](../../container-development.html) to wrap an app
    in extra html. The function should accept an
    {{#crossLink "F2.AppConfig"}}{{/crossLink}} object and also a string of
    html. The extra html can provide links to edit app settings and remove an
    app from the container. See
    {{#crossLink "F2.Constants.Css"}}{{/crossLink}} for CSS classes that
    should be applied to elements.
    @method appRender
    @deprecated This has been replaced with
    {{#crossLink "F2.AppHandlers"}}{{/crossLink}} and will be removed in v2.0
    @param {F2.AppConfig} appConfig The F2.AppConfig object
    @param {string} html The string of html representing the app
  */
  appRender: null,
  /**
    Allows the container to render html for an app before the AppManifest for
    an app has loaded. This can be useful if the design calls for loading
    icons to appear for each app before each app is loaded and rendered to
    the page.
    @method beforeAppRender
    @deprecated This has been replaced with
    {{#crossLink "F2.AppHandlers"}}{{/crossLink}} and will be removed in v2.0
    @param {F2.AppConfig} appConfig The F2.AppConfig object
    @return {Element} The DOM Element surrounding the app
  */
  beforeAppRender: null,
  /**
    True to enable debug mode in F2.js. Adds additional logging, resource
    cache busting, etc.
    @property debugMode
    @type bool
    @default false
  */
  debugMode: false,
  /**
    The default language and region specification for this container
    represented as an IETF-defined standard language tag, e.g. `"en-us"` or
    `"de-de"`. This value is passed to each app registered as
    `containerLocale`.
    @property locale
    @type string
    @default null
    @since 1.4.0
  */
  locale: null,
  /**
    Milliseconds before F2 fires callback on script resource load errors. Due
    to issue with the way Internet Explorer attaches load events to script
    elements, the error event doesn't fire.
    @property scriptErrorTimeout
    @type milliseconds
    @default 7000 (7 seconds)
  */
  scriptErrorTimeout: 7000,
  /**
    Tells the container that it is currently running within a secure app page.
    @property isSecureAppPage
    @type bool
  */
  isSecureAppPage: false,
  /**
    Allows the container to specify which page is used when loading a secure
    app. The page must reside on a different domain than the container.
    @property secureAppPagePath
    @type string
    @for F2.ContainerConfig
  */
  secureAppPagePath: '',
  /**
    Specifies what views a container will provide buttons or links to.
    Generally, the views will be switched via buttons or links in the app's
    header.
    @property supportedViews
    @type Array
    @required
  */
  supportedViews: [],
  UI: uiConfig,
  xhr: xhrConfig,
  /**
    Allows the container to override the script loader which requests
    dependencies defined in the {{#crossLink "F2.AppManifest"}}{{/crossLink}}.
    @method loadScripts
    @param {Array} scripts Script file urls to be loaded
    @param {Array} inlines Inline JavaScript to be run
    @param {Function} callback Should be called when loading is complete
    @example
      F2.init({
        loadScripts: function(scripts, inlines, callback) {
          // Load scripts using $.load() for each script or require(scripts)
          callback();
        }
      });
  */
  loadScripts: function(scripts, inlines, callback) {},
  /**
    Allows the container to override the stylesheet loader which requests
    dependencies defined in the {{#crossLink "F2.AppManifest"}}{{/crossLink}}.
    @method loadStyles
    @param {Array} styles CSS file urls to be loaded
    @param {Function} callback Should be called when loading is complete
    @example
      F2.init({
        loadStyles: function(styles, callback) {
          // Load styles using $.load() for each stylesheet or another method
          callback();
        }
      });
  */
  loadStyles: function(styles, callback) {}
};
