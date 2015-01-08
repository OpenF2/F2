/**
  Root namespace of the F2 SDK
  @module f2
  @class F2
*/
F2.extend('', (function() {

  var _apps = {};
  var _config = false;
  var _usesAppHandlers = false;
  var _appHandlerToken = F2.AppHandlers.__f2GetToken();
  var _loadedScripts = {};
  var _loadedStyles = {};
  var _loadingScripts = {};

  /**
    Appends the app's html to the DOM.
    @method _afterAppRender
    @deprecated This has been replaced with
    {{#crossLink "F2.AppHandlers"}}{{/crossLink}} and will be removed in v2.0
    @private
    @param {F2.AppConfig} appConfig The F2.AppConfig object
    @param {string} html The string of html
    @return {Element} The DOM Element that contains the app
  */
  function _afterAppRender(appConfig, html) {
    var handler = _config.afterAppRender || function(_appConfig, _html) {
      return jQuery(_html).appendTo('body');
    };
    var $appContainer = handler(appConfig, html);

    if (_config.afterAppRender && !$appContainer) {
      F2.log('F2.ContainerConfig.afterAppRender() must return the DOM Element that contains the app');
      return;
    }

    jQuery($appContainer).addClass(F2.Constants.Css.APP);

    return $appContainer.get(0);
  }

  /**
    Renders the html for an app.
    @method _appRender
    @deprecated This has been replaced with
    {{#crossLink "F2.AppHandlers"}}{{/crossLink}} and will be removed in v2.0.
    @private
    @param {F2.AppConfig} appConfig The F2.AppConfig object
    @param {string} html The string of html
    @returns {string} HTML for the app
  */
  function _appRender(appConfig, html) {
    // Apply APP_CONTAINER class and AppID
    html = _outerHtml(jQuery(html).addClass(F2.Constants.Css.APP_CONTAINER + ' ' + appConfig.appId));

    // Optionally apply wrapper html
    if (_config.appRender) {
      html = _config.appRender(appConfig, html);
    }

    return _outerHtml(html);
  }

  /**
    Rendering hook to allow containers to render some html prior to an app
    loading.
    @method _beforeAppRender
    @deprecated This has been replaced with
    {{#crossLink "F2.AppHandlers"}}{{/crossLink}} and will be removed in v2.0.
    @private
    @param {F2.AppConfig} appConfig The F2.AppConfig object
    @return {Element} The DOM Element surrounding the app
  */
  function _beforeAppRender(appConfig) {
    var handler = _config.beforeAppRender || jQuery.noop;
    return handler(appConfig);
  }

  /**
    Handler to inform the container that a script failed to load.
    @method _onScriptLoadFailure
    @deprecated This has been replaced with
    {{#crossLink "F2.AppHandlers"}}{{/crossLink}} and will be removed in v2.0.
    @private
    @param {F2.AppConfig} appConfig The F2.AppConfig object
    @param {string} scriptInfo The path of the script that failed to load or
    the exception info for the inline script that failed to execute.
  */
  function _appScriptLoadFailed(appConfig, scriptInfo) {
    if (_config.appScriptLoadFailed) {
      _config.appScriptLoadFailed(appConfig, scriptInfo);
    }
  }

  /**
    Adds properties to the AppConfig object.
    @method _createAppConfig
    @private
    @param {F2.AppConfig} appConfig The F2.AppConfig object
    @return {F2.AppConfig} The new F2.AppConfig object, prepopulated with
    necessary properties.
  */
  function _createAppConfig(appConfig) {
    // Make a copy of the app config to ensure that the original is not modified
    appConfig = jQuery.extend(true, {}, appConfig);

    // Create the instanceId for the app
    appConfig.instanceId = appConfig.instanceId || F2.guid();

    // Default the views if not provided
    appConfig.views = appConfig.views || [];
    if (!F2.inArray(F2.Constants.Views.HOME, appConfig.views)) {
      appConfig.views.push(F2.Constants.Views.HOME);
    }

    // Pass container-defined locale to each app
    if (F2.ContainerConfig.locale) {
      appConfig.containerLocale = F2.ContainerConfig.locale;
    }

    return appConfig;
  }

  /**
    Generate an AppConfig from the element's attributes.
    @method _getAppConfigFromElement
    @private
    @param {Element} node The DOM node from which to generate the F2.AppConfig
    object
    @return {F2.AppConfig} The new F2.AppConfig object
  */
  function _getAppConfigFromElement(node) {
    var appConfig;

    if (node) {
      var appId = node.getAttribute('data-f2-appid');
      var manifestUrl = node.getAttribute('data-f2-manifesturl');

      if (appId && manifestUrl) {
        appConfig = {
          appId: appId,
          enableBatchRequests: node.hasAttribute('data-f2-enablebatchrequests'),
          isSecure: node.hasAttribute('data-f2-issecure'),
          manifestUrl: manifestUrl,
          root: node
        };

        // See if the user passed in a block of serialized json
        var contextJson = node.getAttribute('data-f2-context');

        if (contextJson) {
          try {
            appConfig.context = F2.parse(contextJson);
          } catch (e) {
            console.warn('F2: "data-f2-context" of node is not valid JSON', '"' + e + '"');
          }
        }
      }
    }

    return appConfig;
  }

  /**
    Returns true if the DOM node has children that are not text nodes
    @method _hasNonTextChildNodes
    @private
    @param {Element} node The DOM node
    @return {bool} True if there are non-text children
  */
  function _hasNonTextChildNodes(node) {
    var hasNodes = false;

    if (node.hasChildNodes()) {
      for (var i = 0, len = node.childNodes.length; i < len; i++) {
        if (node.childNodes[i].nodeType === 1) {
          hasNodes = true;
          break;
        }
      }
    }

    return hasNodes;
  }

  /**
    Adds properties to the ContainerConfig object to take advantage of defaults.
    @method _hydrateContainerConfig
    @private
    @param {F2.ContainerConfig} containerConfig The F2.ContainerConfig object
  */
  function _hydrateContainerConfig(containerConfig) {
    if (!containerConfig.scriptErrorTimeout) {
      containerConfig.scriptErrorTimeout = F2.ContainerConfig.scriptErrorTimeout;
    }

    if (containerConfig.debugMode !== true) {
      containerConfig.debugMode = F2.ContainerConfig.debugMode;
    }

    if (containerConfig.locale && typeof containerConfig.locale === 'string') {
      F2.ContainerConfig.locale = containerConfig.locale;
    }
  }

  /**
    Attach app events.
    @method _initAppEvents
    @private
    @param {F2.AppConfig} appConfig The F2.AppConfig object
  */
  function _initAppEvents(appConfig) {
    var elementFilter = '.' + F2.Constants.Css.APP_VIEW_TRIGGER + '[' + F2.Constants.Views.DATA_ATTRIBUTE + ']';

    jQuery(appConfig.root).on('click', elementFilter, function(e) {
      e.preventDefault();

      var view = jQuery(this).attr(F2.Constants.Views.DATA_ATTRIBUTE).toLowerCase();

      // Handle the special REMOVE view
      if (view === F2.Constants.Views.REMOVE) {
        F2.removeApp(appConfig.instanceId);
      } else {
        appConfig.ui.Views.change(view);
      }
    });
  }

  /**
    Attach container Events
    @method _initContainerEvents
    @private
  */
  function _initContainerEvents() {
    function resizeHandler() {
      F2.Events.emit(F2.Constants.Events.CONTAINER_WIDTH_CHANGE);
    }

    var resizeTimeout;

    jQuery(window).on('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeHandler, 100);
    });

    // Listen for container-broadcasted locale changes
    F2.Events.on(F2.Constants.Events.CONTAINER_LOCALE_CHANGE, function(data) {
      if (data.locale && typeof data.locale === 'string') {
        F2.ContainerConfig.locale = data.locale;
      }
    });
  }

  /**
    Checks if an element is a placeholder element.
    @method _isPlaceholderElement
    @private
    @param {Element} node The DOM element to check
    @return {bool} True if the element is a placeholder
  */
  function _isPlaceholderElement(node) {
    return (
      F2.isNativeDOMNode(node) &&
      !_hasNonTextChildNodes(node) &&
      !!node.getAttribute('data-f2-appid') &&
      !!node.getAttribute('data-f2-manifesturl')
    );
  }

  /**
    Has the container been init?
    @method _isInit
    @private
    @return {bool} True if the container has been init
  */
  function _isInit() {
    return !!_config;
  }

  /**
    Instantiates app from its appConfig and stores that in a private collection.
    @method _createAppInstance
    @private
    @param {object} appConfig An {{#crossLink "F2.AppConfig"}}{{/crossLink}}
    @param {F2.AppManifest.AppContent} appContent The F2.AppManifest.AppContent
    object.
  */
  function _createAppInstance(appConfig, appContent) {
    appConfig.ui = new F2.UI(appConfig);

    // instantiate F2.App
    if (F2.Apps[appConfig.appId] !== undefined) {
      if (typeof F2.Apps[appConfig.appId] === 'function') {
        // IE
        setTimeout(function() {
          _apps[appConfig.instanceId].app = new F2.Apps[appConfig.appId](appConfig, appContent, appConfig.root);

          if (_apps[appConfig.instanceId].app.init !== undefined) {
            _apps[appConfig.instanceId].app.init();
          }
        }, 0);
      } else {
        F2.log('app initialization class is defined but not a function. (' + appConfig.appId + ')');
      }
    }
  }

  /**
    Loads the app's html/css/javascript.
    @method loadApp
    @private
    @param {Array} appConfigs An array of
    {{#crossLink "F2.AppConfig"}}{{/crossLink}} objects.
    @param {F2.AppManifest} [appManifest] The AppManifest object
  */
  function _loadApps(appConfigs, appManifest) {
    appConfigs = [].concat(appConfigs);

    // Check for secure app
    if (appConfigs.length === 1 && appConfigs[0].isSecure && !_config.isSecureAppPage) {
      _loadSecureApp(appConfigs[0], appManifest);
      return;
    }

    // Check that the number of apps in manifest matches the number requested
    if (appConfigs.length !== appManifest.apps.length) {
      F2.log('The number of apps defined in the AppManifest do not match the number requested.', appManifest);
      return;
    }

    function _loadStyles(styles, cb) {
      if (_config.loadStyles) {
        return _config.loadStyles(styles, cb);
      }

      // Load styles, see #101
      var stylesFragment;
      var useCreateStyleSheet = !!document.createStyleSheet;

      jQuery.each(styles, function(i, e) {
        var resourceUrl = e;
        var resourceKey = e.toLowerCase();

        if (_loadedStyles[resourceKey]) {
          return;
        }

        if (useCreateStyleSheet) {
          document.createStyleSheet(resourceUrl);
        } else {
          stylesFragment = stylesFragment || [];
          stylesFragment.push('<link rel="stylesheet" type="text/css" href="' + resourceUrl + '"/>');
        }

        _loadedStyles[resourceKey] = true;
      });

      if (stylesFragment) {
        jQuery('head').append(stylesFragment.join(''));
      }

      cb();
    }

    function _loadScripts(scripts, cb) {
      if (_config.loadScripts) {
        return _config.loadScripts(scripts, cb);
      }

      if (!scripts.length) {
        return cb();
      }

      var doc = window.document;
      var scriptCount = scripts.length;
      var scriptsLoaded = 0;
      // http://caniuse.com/#feat=script-async
      var head = doc && (doc.head || doc.getElementsByTagName('head')[0]);
      // For IE, put scripts before any <base> elements, but after any <meta>
      var insertBeforeEl = head && head.getElementsByTagName('base')[0] || null;
      // Check for IE10+ so that we don't rely on onreadystatechange, readyStates for IE6-9
      var readyStates = (window.addEventListener) ? {} : {
        'loaded': true,
        'complete': true
      };

      // Log and emit event for the failed (400,500) scripts
      function _error(e) {
        setTimeout(function() {
          var evtData = {
            src: e.target.src,
            appId: appConfigs[0].appId
          };

          // Send error to console
          F2.log('Script defined in \'' + evtData.appId + '\' failed to load \'' + evtData.src + '\'');

          // Emit events
          F2.Events.emit('RESOURCE_FAILED_TO_LOAD', evtData);

          if (!_usesAppHandlers) {
            _appScriptLoadFailed(appConfigs[0], evtData.src);
          } else {
            F2.AppHandlers.__trigger(
              _appHandlerToken,
              F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED,
              appConfigs[0],
              evtData.src
            );
          }
        }, _config.scriptErrorTimeout); // Defaults to 7000
      }

      function _checkComplete() {
        // Are we done loading all scripts for this app?
        if (++scriptsLoaded === scriptCount) {
          // success
          cb();
        }
      }

      function _emptyWaitlist(resourceKey, errorEvt) {
        var waiting;
        var waitlist = _loadingScripts[resourceKey];

        if (!waitlist) {
          return;
        }

        for (var i = 0; i < waitlist.length; i++) {
          waiting = waitlist  [i];

          if (errorEvt) {
            waiting.error(errorEvt);
          } else {
            waiting.success();
          }
        }

        _loadingScripts[resourceKey] = null;
      }

      // Load scripts and eval inlines once complete
      jQuery.each(scripts, function(i, url) {
        var script = doc.createElement('script');
        var resourceUrl = url;
        var resourceKey = resourceUrl.toLowerCase();

        // Already finished loading, trigger callback
        if (_loadedScripts[resourceKey]) {
          return _checkComplete();
        }

        // This script is actively loading, add this app to the wait list
        if (_loadingScripts[resourceKey]) {
          _loadingScripts[resourceKey].push({
            success: _checkComplete,
            error: _error
          });

          return;
        }

        // Create the waitlist
        _loadingScripts[resourceKey] = [];

        // If in debugMode, add cache buster to each script URL
        if (_config.debugMode) {
          resourceUrl += '?cachebuster=' + new Date().getTime();
        }

        // Scripts are loaded asynchronously and executed in order
        // in supported browsers: http://caniuse.com/#feat=script-async
        script.async = false;
        script.type = 'text/javascript';
        script.charset = 'utf-8';

        script.onerror = function(e) {
          _error(e);
          _emptyWaitlist(resourceKey, e);
        };

        // Use a closure for the load event so that we can dereference the original script
        script.onload = script.onreadystatechange = function(e) {
          e = e || window.event; // For older IE

          // Detect when it's done loading
          // ev.type == 'load' is for all browsers except IE6-9
          // IE6-9 need to use onreadystatechange and look for
          // el.readyState in {loaded, complete} (yes, we need both)
          if (e.type === 'load' || readyStates[script.readyState]) {
            // Done, cleanup
            script.onload = script.onreadystatechange = script.onerror = '';
            // Loaded
            _loadedScripts[resourceKey] = true;
            // Increment and check if scripts are done
            _checkComplete();
            // Empty wait list
            _emptyWaitlist(resourceKey);
            // Dereference script
            script = null;
          }
        };

        // Set the src, start loading
        script.src = resourceUrl;

        // <head> really is the best
        head.insertBefore(script, insertBeforeEl);
      });
    }

    function _loadInlineScripts(inlines, cb) {
      // Attempt to use the user provided method
      if (_config.loadInlineScripts) {
        _config.loadInlineScripts(inlines, cb);
      } else {
        for (var i = 0, len = inlines.length; i < len; i++) {
          try {
            eval(inlines[i]);
          } catch ( exception ) {
            F2.log('Error loading inline script: ' + exception + '\n\n' + inlines[i]);

            // Emit events
            F2.Events.emit('RESOURCE_FAILED_TO_LOAD', {
              appId: appConfigs[0].appId,
              src: inlines[i],
              err: exception
            });

            if (!_usesAppHandlers) {
              _appScriptLoadFailed(appConfigs[0], exception);
            } else {
              F2.AppHandlers.__trigger(
                _appHandlerToken,
                F2.Constants.AppHandlers.APP_SCRIPT_LOAD_FAILED,
                appConfigs[0],
                exception
              );
            }
          }
        }
        cb();
      }
    }

    // Determine whether an element has been added to the page
    function elementInDocument(element) {
      if (element) {
        while (element.parentNode) {
          element = element.parentNode;

          if (element === document) {
            return true;
          }
        }
      }

      return false;
    }

    function _loadHtml(apps) {
      jQuery.each(apps, function(i, a) {
        if (_isPlaceholderElement(appConfigs[i].root)) {
          jQuery(appConfigs[i].root)
            .addClass(F2.Constants.Css.APP)
            .append(jQuery(a.html).addClass(F2.Constants.Css.APP_CONTAINER + ' ' + appConfigs[i].appId));
        } else if (!_usesAppHandlers) {
          // Load html and save the root node
          appConfigs[i].root = _afterAppRender(appConfigs[i], _appRender(appConfigs[i], a.html));
        } else {
          F2.AppHandlers.__trigger(
            _appHandlerToken,
            F2.Constants.AppHandlers.APP_RENDER,
            appConfigs[i], // the app config
            _outerHtml(jQuery(a.html).addClass(F2.Constants.Css.APP_CONTAINER + ' ' + appConfigs[i].appId))
          );

          var appId = appConfigs[i].appId;
          var root = appConfigs[i].root;

          if (!root) {
            throw new Error('Root for ' + appId + ' must be a native DOM element and cannot be null or undefined. Check your AppHandler callbacks to ensure you have set App root to a native DOM element.');
          }

          if (!elementInDocument(root)) {
            throw new Error('App root for ' + appId + ' was not appended to the DOM. Check your AppHandler callbacks to ensure you have rendered the app root to the DOM.');
          }

          F2.AppHandlers.__trigger(
            _appHandlerToken,
            F2.Constants.AppHandlers.APP_RENDER_AFTER,
            appConfigs[i] // the app config
          );

          if (!F2.isNativeDOMNode(root)) {
            throw new Error('App root for ' + appId + ' must be a native DOM element. Check your AppHandler callbacks to ensure you have set app root to a native DOM element.');
          }
        }

        // init events
        _initAppEvents(appConfigs[i]);
      });
    }

    // Pull out the manifest data
    var manifestScripts = appManifest.scripts || [];
    var manifestStyles = appManifest.styles || [];
    var manifestInlines = appManifest.inlineScripts || [];
    var manifestApps = appManifest.apps || [];

    // Finally, load the styles, html, and scripts
    _loadStyles(manifestStyles, function() {
      _loadHtml(manifestApps);
      _loadScripts(manifestScripts, function() {
        // Emit event we're done with scripts
        if (appConfigs[0]) {
          F2.Events.emit('APP_SCRIPTS_LOADED', {
            appId: appConfigs[0].appId,
            scripts: manifestScripts
          });
        }

        _loadInlineScripts(manifestInlines, function() {
          // Create the apps
          jQuery.each(appConfigs, function(i, a) {
            _createAppInstance(a, manifestApps[i]);
          });
        });
      });
    });
  }

  /**
    Loads the app's html/css/javascript into an iframe.
    @method loadSecureApp
    @private
    @param {F2.AppConfig} appConfig The F2.AppConfig object
    @param {F2.AppManifest} appManifest The app's html/css/js to be loaded into
    the page.
  */
  function _loadSecureApp(appConfig, appManifest) {
    // Make sure the container is configured for secure apps
    if (_config.secureAppPagePath) {
      if (_isPlaceholderElement(appConfig.root)) {
        jQuery(appConfig.root)
          .addClass(F2.Constants.Css.APP)
          .append(jQuery('<div></div>')
          .addClass(F2.Constants.Css.APP_CONTAINER + ' ' + appConfig.appId));
      } else if (!_usesAppHandlers) {
        // Create the html container for the iframe
        appConfig.root = _afterAppRender(appConfig, _appRender(appConfig, '<div></div>'));
      } else {
        var $root = jQuery(appConfig.root);

        F2.AppHandlers.__trigger(
          _appHandlerToken,
          F2.Constants.AppHandlers.APP_RENDER,
          appConfig,
          _outerHtml(jQuery(appManifest.html).addClass(F2.Constants.Css.APP_CONTAINER + ' ' + appConfig.appId))
        );

        if ($root.parents('body:first').length === 0) {
          throw new Error('App was never rendered on the page. Please check your AppHandler callbacks to ensure you have rendered the app root to the DOM.');
        }

        F2.AppHandlers.__trigger(
          _appHandlerToken,
          F2.Constants.AppHandlers.APP_RENDER_AFTER,
          appConfig // the app config
        );

        if (!appConfig.root) {
          throw new Error('App Root must be a native dom node and can not be null or undefined. Please check your AppHandler callbacks to ensure you have set App Root to a native dom node.');
        }

        if (!F2.isNativeDOMNode(appConfig.root)) {
          throw new Error('App Root must be a native dom node. Please check your AppHandler callbacks to ensure you have set App Root to a native dom node.');
        }
      }

      // Instantiate F2.UI
      appConfig.ui = new F2.UI(appConfig);
      // Init events
      _initAppEvents(appConfig);
      // Create RPC socket
      F2.Rpc.register(appConfig, appManifest);
    } else {
      F2.log('Unable to load secure app: "secureAppPagePath" is not defined in F2.ContainerConfig.');
    }
  }

  function _outerHtml(html) {
    return jQuery('<div></div>').append(html).html();
  }

  /**
    Checks if the app is valid.
    @method _validateApp
    @private
    @param {F2.AppConfig} appConfig The F2.AppConfig object
    @returns {bool} True if the app is valid
  */
  function _validateApp(appConfig) {
    // Check for valid app configurations
    if (!appConfig.appId) {
      F2.log('"appId" missing from app object');
      return false;
    } else if (!appConfig.root && !appConfig.manifestUrl) {
      F2.log('"manifestUrl" missing from app object');
      return false;
    }

    return true;
  }

  /**
    Checks if the ContainerConfig is valid.
    @method _validateContainerConfig
    @private
    @returns {bool} True if the config is valid
  */
  function _validateContainerConfig() {
    if (_config) {
      if (_config.xhr) {
        if (!(typeof _config.xhr === 'function' || typeof _config.xhr === 'object')) {
          throw new Error('ContainerConfig.xhr should be a function or an object');
        }
        if (_config.xhr.dataType && typeof _config.xhr.dataType !== 'function') {
          throw new Error('ContainerConfig.xhr.dataType should be a function');
        }
        if (_config.xhr.type && typeof _config.xhr.type !== 'function') {
          throw new Error('ContainerConfig.xhr.type should be a function');
        }
        if (_config.xhr.url && typeof _config.xhr.url !== 'function') {
          throw new Error('ContainerConfig.xhr.url should be a function');
        }
      }
    }

    return true;
  }

  return {
    /**
      Gets the current list of apps in the container.
      @method getContainerState
      @returns {Array} An array of objects containing the appId
    */
    getContainerState: function() {
      if (!_isInit()) {
        F2.log('F2.init() must be called before F2.getContainerState()');
        return;
      }

      return jQuery.map(_apps, function(app) {
        return {
          appId: app.config.appId
        };
      });
    },
    /**
      Gets the current locale defined by the container.
      @method getContainerLocale
      @returns {String} IETF-defined standard language tag
    */
    getContainerLocale: function() {
      if (!_isInit()) {
        F2.log('F2.init() must be called before F2.getContainerLocale()');
        return;
      }

      return F2.ContainerConfig.locale;
    },
    /**
      Initializes the container. This method must be called before performing
      any other actions in the container.
      @method init
      @param {F2.ContainerConfig} config The configuration object
    */
    init: function(config) {
      _config = config || {};
      _validateContainerConfig();
      _hydrateContainerConfig(_config);

      // Dictates whether we use the old logic or the new logic.
      // TODO: Remove in v2.0
      _usesAppHandlers = (_config.beforeAppRender || _config.appRender || _config.afterAppRender || _config.appScriptLoadFailed);

      // Only establish RPC connection if the container supports the secure app page
      if (!!_config.secureAppPagePath || _config.isSecureAppPage) {
        F2.Rpc.init(_config.secureAppPagePath ? _config.secureAppPagePath : false);
      }

      F2.UI.init(_config);

      if (!_config.isSecureAppPage) {
        _initContainerEvents();
      }
    },
    /**
      Has the container been init?
      @method isInit
      @return {bool} True if the container has been init
    */
    isInit: _isInit,
    /**
      Automatically load apps that are already defined in the DOM. Elements will
      be rendered into the location of the placeholder DOM element. Any
      AppHandlers that are defined will be bypassed.
      @method loadPlaceholders
      @param {Element} parentNode The element to search for placeholder apps
    */
    loadPlaceholders: function(parentNode) {
      if (parentNode && !F2.isNativeDOMNode(parentNode)) {
        throw new Error('"parentNode" must be null or a DOM node');
      }

      var elements = [];
      var appConfigs = [];

      /**
        If the passed in element has a data-f2-appid attribute add it to the
        list of elements but to not search within that element for other
        placeholders
      */
      if (parentNode) {
        if (parentNode.hasAttribute('data-f2-appid')) {
          elements.push(parentNode);
        }
      } else if (document.querySelectorAll) {
        elements = elements.concat(document.querySelectorAll('[data-f2-appid]'));
      }

      for (var i = 0, len = elements.length; i < len; i++) {
        var appConfig = _getAppConfigFromElement(elements[i]);
        appConfigs.push(appConfig);
      }

      if (appConfigs.length) {
        F2.registerApps(appConfigs);
      }
    },
    /**
      Begins the loading process for all apps and/or initialization process for
      pre-loaded apps. The app will be passed the
      {{#crossLink "F2.AppConfig"}}{{/crossLink}} object which will contain the
      app's unique instanceId within the container. If the
      {{#crossLink "F2.AppConfig"}}{{/crossLink}}.root property is populated
      the app is considered to be a pre-loaded app and will be handled
      accordingly. Optionally, the
      {{#crossLink "F2.AppManifest"}}{{/crossLink}} can be passed in and those
      assets will be used instead of making a request.
      @method registerApps
      @param {Array} appConfigs An array of
      {{#crossLink "F2.AppConfig"}}{{/crossLink}} objects
      @param {Array} [appManifests] An array of
      {{#crossLink "F2.AppManifest"}}{{/crossLink}}
      objects. This array must be the same length as the apps array that is
      passed in. This can be useful if apps are loaded on the server-side and
      passed down to the client.
      @example
        // Traditional App requests.
        var configs = [{
          appId: 'com_externaldomain_example_app',
          context: {},
          manifestUrl: 'http://www.externaldomain.com/F2/AppManifest'
        }, {
          appId: 'com_externaldomain_example_app',
          context: {},
          manifestUrl: 'http://www.externaldomain.com/F2/AppManifest'
        }, {
          appId: 'com_externaldomain_example_app2',
          context: {},
          manifestUrl: 'http://www.externaldomain.com/F2/AppManifest'
        }];

        F2.init();
        F2.registerApps(configs);
      @example
        // Pre-loaded and tradition apps mixed.
        // You can preload the same app multiple times as long as you have a unique root for each
        var configs = [{
          appId: 'com_mydomain_example_app',
          context: {},
          root: 'div#example-app-1',
          manifestUrl: ''
        }, {
          appId: 'com_mydomain_example_app',
          context: {},
          root: 'div#example-app-2',
          manifestUrl: ''
        }, {
          appId: 'com_externaldomain_example_app',
          context: {},
          manifestUrl: 'http://www.externaldomain.com/F2/AppManifest'
        }];

        F2.init();
        F2.registerApps(configs);
      @example
        // Apps with predefined manifests.
        var configs = [
          { appId: 'com_externaldomain_example_app', context: {} },
          { appId: 'com_externaldomain_example_app', context: {} },
          { appId: 'com_externaldomain_example_app2', context: {} }
        ];

        // Pre requested manifest responses
        var manifests = [{
          apps: ['<div>Example App!</div>'],
          inlineScripts: [],
          scripts: ['http://www.domain.com/js/AppClass.js'],
          styles: ['http://www.domain.com/css/AppStyles.css']
        }, {
          apps: ['<div>Example App!</div>'],
          inlineScripts: [],
          scripts: ['http://www.domain.com/js/AppClass.js'],
          styles: ['http://www.domain.com/css/AppStyles.css']
        }, {
          apps: ['<div>Example App 2!</div>'],
          inlineScripts: [],
          scripts: ['http://www.domain.com/js/App2Class.js'],
          styles: ['http://www.domain.com/css/App2Styles.css']
        }];

        F2.init();
        F2.registerApps(configs, manifests);
    */
    registerApps: function(appConfigs, appManifests) {
      if (!_isInit()) {
        F2.log('F2.init() must be called before F2.registerApps()');
        return;
      } else if (!appConfigs) {
        F2.log('At least one AppConfig must be passed when calling F2.registerApps()');
        return;
      }

      var appStack = [];
      var batches = {};
      var callbackStack = {};
      var haveManifests = false;
      appConfigs = [].concat(appConfigs);
      appManifests = [].concat(appManifests || []);
      haveManifests = !!appManifests.length;

      // AppConfigs must have a length
      if (!appConfigs.length) {
        F2.log('At least one AppConfig must be passed when calling F2.registerApps()');
        return;
      } else if (appConfigs.length && haveManifests && appConfigs.length !== appManifests.length) {
        // Ensure that the array of apps and manifests are equal
        F2.log('The length of "apps" does not equal the length of "appManifests"');
        return;
      }

      // Validate apps, assign instanceId, then determine which apps can be batched together
      jQuery.each(appConfigs, function(i, a) {
        // Add properties and methods
        a = _createAppConfig(a);

        // Set to itself for preloaded apps
        a.root = a.root || null;

        // Validate the app after setting the root because preloaded apps do not require manifest url
        if (!_validateApp(a)) {
          return;
        }

        _apps[a.instanceId] = {
          config: a
        };

        // If the root property is defined then this app is considered to be preloaded and we will run it through that logic.
        if (a.root && !_isPlaceholderElement(a.root)) {
          if ((!a.root && typeof a.root !== 'string') && !F2.isNativeDOMNode(a.root)) {
            F2.log('AppConfig invalid for pre-load, not a valid string and not dom node');
            F2.log('AppConfig instance:', a);
            throw new Error('Preloaded appConfig.root property must be a native dom node or a string representing a sizzle selector. Please check your inputs and try again.');
          } else if (jQuery(a.root).length !== 1) {
            F2.log('AppConfig invalid for pre-load, root not unique');
            F2.log('AppConfig instance:', a);
            F2.log('Number of dom node instances:', jQuery(a.root).length);
            throw new Error('Preloaded appConfig.root property must map to a unique dom node. Please check your inputs and try again.');
          }

          // Instantiate F2.App
          _createAppInstance(a);
          _initAppEvents(a);

          return;
        }

        if (!_isPlaceholderElement(a.root)) {
          if (!_usesAppHandlers) {
            a.root = _beforeAppRender(a);
          } else {
            F2.AppHandlers.__trigger(
              _appHandlerToken,
              F2.Constants.AppHandlers.APP_CREATE_ROOT,
              a
            );

            F2.AppHandlers.__trigger(
              _appHandlerToken,
              F2.Constants.AppHandlers.APP_RENDER_BEFORE,
              a
            );
          }
        }

        // Load the page if we have the manifest
        if (haveManifests) {
          _loadApps(a, appManifests[i]);
        } else {
          // Check if this app can be batched
          if (a.enableBatchRequests && !a.isSecure) {
            batches[a.manifestUrl.toLowerCase()] = batches[a.manifestUrl.toLowerCase()] || [];
            batches[a.manifestUrl.toLowerCase()].push(a);
          } else {
            appStack.push({
              apps: [a],
              url: a.manifestUrl
            });
          }
        }
      });

      if (!haveManifests) {
        // Add the batches to the appStack
        jQuery.each(batches, function(i, b) {
          appStack.push({
            url: i,
            apps: b
          });
        });

        /*
          If an app is being loaded more than once on the page, there is the
          potential that the jsonp callback will be clobbered if the request
          for the AppManifest for the app comes back at the same time as
          another request for the same app. We'll create a callbackStack
          that will ensure that requests for the same app are loaded in order
          rather than at the same time
        */
        jQuery.each(appStack, function(i, req) {
          // Define the callback function based on the first app's App ID
          var jsonpCallback = F2.Constants.JSONP_CALLBACK + req.apps[0].appId;

          // Push the request onto the callback stack
          callbackStack[jsonpCallback] = callbackStack[jsonpCallback] || [];
          callbackStack[jsonpCallback].push(req);
        });

        /*
          Loop through each item in the callback stack and make the request
          for the AppManifest. When the request is complete, pop the next
          request off the stack and make the request.
        */
        jQuery.each(callbackStack, function(i, requests) {
          function manifestRequest(jsonpCallback, req) {
            if (!req) {
              return;
            }

            // Setup defaults and callbacks
            var type = 'GET';
            var dataType = 'jsonp';

            function completeFunc() {
              manifestRequest(i, requests.pop());
            }

            function errorFunc() {
              jQuery.each(req.apps, function(idx, item) {
                item.name = item.name || item.appId;
                F2.log('Removed failed ' + item.name + ' app', item);
                F2.removeApp(item.instanceId);
              });
            }

            function successFunc(appManifest) {
              _loadApps(req.apps, appManifest);
            }

            // Optionally fire xhr overrides
            if (_config.xhr) {
              if (_config.xhr.dataType) {
                dataType = _config.xhr.dataType(req.url, req.apps);

                if (typeof dataType !== 'string') {
                  throw new Error('ContainerConfig.xhr.dataType should return a string');
                }
              }

              if (_config.xhr.type) {
                type = _config.xhr.type(req.url, req.apps);

                if (typeof type !== 'string') {
                  throw new Error('ContainerConfig.xhr.type should return a string');
                }
              }

              if (_config.xhr.url) {
                req.url = _config.xhr.url(req.url, req.apps);

                if (typeof req.url !== 'string') {
                  throw new Error('ContainerConfig.xhr.url should return a string');
                }
              }
            }

            // Setup the default request function if an override is not present
            var requestFunc = _config.xhr;

            if (typeof requestFunc !== 'function') {
              requestFunc = function(url, apps, successCallback, errorCallback, completeCallback) {
                jQuery.ajax({
                  url: url,
                  type: type,
                  data: {
                    params: F2.stringify(req.apps, F2.appConfigReplacer)
                  },
                  jsonp: false, // do not put 'callback=' in the query string
                  jsonpCallback: jsonpCallback, // Unique function name
                  dataType: dataType,
                  success: successCallback,
                  error: function(jqxhr, settings, exception) {
                    F2.log('Failed to load app(s)', exception.toString(), req.apps);
                    errorCallback();
                  },
                  complete: completeCallback
                });
              };
            }

            requestFunc(req.url, req.apps, successFunc, errorFunc, completeFunc);
          }

          manifestRequest(i, requests.pop());
        });
      }
    },
    /**
      Removes all apps from the container
      @method removeAllApps
    */
    removeAllApps: function() {
      if (!_isInit()) {
        F2.log('F2.init() must be called before F2.removeAllApps()');
        return;
      }

      jQuery.each(_apps, function(i, a) {
        F2.removeApp(a.config.instanceId);
      });
    },
    /**
      Removes an app from the container.
      @method removeApp
      @param {string} instanceId The app's instanceId
    */
    removeApp: function(instanceId) {
      if (!_isInit()) {
        F2.log('F2.init() must be called before F2.removeApp()');
        return;
      }

      if (_apps[instanceId]) {
        F2.AppHandlers.__trigger(
          _appHandlerToken,
          F2.Constants.AppHandlers.APP_DESTROY_BEFORE,
          _apps[instanceId]
        );

        F2.AppHandlers.__trigger(
          _appHandlerToken,
          F2.Constants.AppHandlers.APP_DESTROY,
          _apps[instanceId]
        );

        F2.AppHandlers.__trigger(
          _appHandlerToken,
          F2.Constants.AppHandlers.APP_DESTROY_AFTER,
          _apps[instanceId]
        );

        delete _apps[instanceId];
      }
    }
  };
})());
