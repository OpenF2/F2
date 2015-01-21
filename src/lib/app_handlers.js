var F2 = require('./F2');
var jQuery = require('jquery');

// Token used when adding, removing, or triggering handlers
var _containerToken = F2.guid();
var _f2Token = F2.guid();

var _handlerCollection = {
  appCreateRoot: [],
  appRenderBefore: [],
  appDestroyBefore: [],
  appRenderAfter: [],
  appDestroyAfter: [],
  appRender: [],
  appDestroy: [],
  appScriptLoadFailed: []
};

var _defaultMethods = {
  appRender: function(appConfig, appHtml) {
    // If no app root is defined use the app's outer most node
    if (F2.isNativeDOMNode(appConfig.root)) {
      jQuery(appConfig.root).append(appHtml);
    } else {
      appConfig.root = jQuery(appHtml).get(0);
    }

    document.body.appendChild(appConfig.root);
  },
  appDestroy: function(appInstance) {
    if (appInstance.app && appInstance.app.destroy) {
      if (typeof appInstance.app.destroy === 'function') {
        appInstance.app.destroy();
      } else {
        F2.log(appInstance.config.appId + ' has a destroy property, but destroy is not of type function and as such will not be executed.');
      }
    }

    jQuery(appInstance.config.root).fadeOut(500, function() {
      jQuery(this).remove();
    });
  }
};

function _createHandler(token, namespace, fnOrNode, domNodeAppropriate) {
  _validateToken(token);

  var handler = {
    domNode: null,
    func: null,
    namespace: namespace
  };

  if (F2.isNativeDOMNode(fnOrNode)) {
    handler.domNode = fnOrNode;
  } else if (typeof fnOrNode === 'function') {
    handler.func = fnOrNode;
  }

  if (!handler.func && !handler.domNode) {
    throw new Error('Invalid or null argument passed. Handler will not be added to collection. A valid dom element or callback function is required.');
  }

  if (handler.domNode && !domNodeAppropriate) {
    throw new Error('Invalid argument passed. Handler will not be added to collection. A callback function is required for this event type.');
  }

  return handler;
}

// Token must match F2 or container
function _validateToken(token) {
  if (_containerToken !== token && _f2Token !== token) {
    throw new Error('Invalid token passed. Please verify that you have correctly received and stored token from F2.AppHandlers.getToken().');
  }
}

// Token must match F2
function _validateF2Token(token) {
  if (token !== _f2Token) {
    throw new Error('Token passed is invalid. Only F2 is allowed to call F2.AppHandlers.__trigger().');
  }
}

function _filterHandlersByNamespace(handlers, namespace) {
  var newHandlers = handlers.slice();

  for (var i = newHandlers.length; i >= 0; i--) {
    if (!newHandlers[i] || (newHandlers[i].namespace && newHandlers[i].namespace.toLowerCase() === namespace)) {
      newHandlers.splice(i, 1);
    }
  }

  return newHandlers;
}

function _removeHandler(token, eventKey, namespace) {
  _validateToken(token);

  if (namespace) {
    namespace = namespace.toLowerCase();

    if (eventKey && eventKey in _handlerCollection) {
      _handlerCollection[eventKey] = _filterHandlersByNamespace(_handlerCollection[eventKey], namespace);
    } else {
      for (var key in _handlerCollection) {
        _removeHandler(token, key, namespace);
      }
    }
  } else if (eventKey) {
    _handlerCollection[eventKey] = [];
  }
}

function _parseEventKey(eventKey) {
  var namespace = '';

  if (eventKey.indexOf('.') !== -1) {
    var eventParts = eventKey.split('.');
    eventKey = eventParts[0];
    namespace = eventParts[1];
  }

  return {
    key: eventKey,
    namespace: namespace
  };
}

/**
  The new `AppHandlers` functionality provides Container Developers a higher
  level of control over configuring app rendering and interaction.

  <p class="alert alert-block alert-warning">
  The addition of `F2.AppHandlers` replaces the previous {{#crossLink "F2.ContainerConfig"}}{{/crossLink}} properties `beforeAppRender`, `appRender`, and `afterAppRender`. These methods were deprecated&mdash;but not removed&mdash;in version 1.2. They will be permanently removed in a future version of F2.
  </p>

  <p class="alert alert-block alert-info">
  Starting with F2 version 1.2, `AppHandlers` is the preferred method for
  Container Developers to manage app layout.
  </p>

  ### Order of Execution

  **App Rendering**

  0. {{#crossLink "F2/registerApps"}}F2.registerApps(){{/crossLink}} method is called by the Container Developer and the following methods are run for *each* {{#crossLink "F2.AppConfig"}}{{/crossLink}} passed.
  1. **'appCreateRoot'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_CREATE\_ROOT*) handlers are fired in the order they were attached.
  2. **'appRenderBefore'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_RENDER\_BEFORE*) handlers are fired in the order they were attached.
  3. Each app's `manifestUrl` is requested asynchronously; on success the following methods are fired.
  3. **'appRender'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_RENDER*) handlers are fired in the order they were attached.
  4. **'appRenderAfter'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_RENDER\_AFTER*) handlers are fired in the order they were attached.

  **App Removal**

  0. {{#crossLink "F2/removeApp"}}F2.removeApp(){{/crossLink}} with a specific {{#crossLink "F2.AppConfig/instanceId "}}{{/crossLink}} or {{#crossLink "F2/removeAllApps"}}F2.removeAllApps(){{/crossLink}} method is called by the Container Developer and the following methods are run.
  1. **'appDestroyBefore'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_DESTROY\_BEFORE*) handlers are fired in the order they were attached.
  2. **'appDestroy'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_DESTROY*) handlers are fired in the order they were attached.
  3. **'appDestroyAfter'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_DESTROY\_AFTER*) handlers are fired in the order they were attached.

  **Error Handling**

  0. **'appScriptLoadFailed'** (*{{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.APP\_SCRIPT\_LOAD\_FAILED*) handlers are fired in the order they were attached.

  @class F2.AppHandlers
*/
module.exports = {
  /**
    Allows Container Developer to retrieve a unique token which must be
    passed to all `on` and `off` methods. This function will self destruct
    and can only be called one time. Container Developers must store the
    return value inside of a closure.
    @method getToken
    @returns {string} A one-time container token
  */
  getToken: function() {
    /**
      Delete this method for security that way only the container has
      access to the token 1 time. Kind of Ethan Hunt-ish, this message will
      self-destruct immediately.
      */
    delete this.getToken;
    return _containerToken;
  },
  /**
    Allows F2 to get a token internally. Token is required to call
    {{#crossLink "F2.AppHandlers/\_\_trigger:method"}}{{/crossLink}}. This
    function will self destruct to eliminate other sources from using the
    {{#crossLink "F2.AppHandlers/\_\_trigger:method"}}{{/crossLink}} and
    additional internal methods.
    @method __f2GetToken
    @private
    @returns {string} A one-time container token
  */
  __f2GetToken: function() {
    /*
       Delete this method for security that way only the container has
       access to the token 1 time. Kind of Ethan Hunt-ish, this message will
       self-destruct immediately.
       */
    delete this.__f2GetToken;
    return _f2Token;
  },
  /**
    Allows F2 to trigger specific events internally.
    @method __trigger
    @private
    @chainable
    @param {String} token The token received from {{#crossLink "F2.AppHandlers/\_\_f2GetToken:method"}}{{/crossLink}}.
    @param {String} eventKey The event to fire. The complete list of event
    keys is available in {{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.
    @returns {object} The F2 instance for chaining purposes
  */
  __trigger: function(token, eventKey) {
    _validateF2Token(token);

    if (!_handlerCollection[eventKey]) {
      throw new Error('Invalid EventKey passed. Check your inputs and try again.');
    }

    var callbackArgs = Array.prototype.slice.call(arguments, 2);

    if (!_handlerCollection[eventKey].length && _defaultMethods[eventKey]) {
      _defaultMethods[eventKey].apply(F2, callbackArgs);
    } else {
      for (var i = 0; i < _handlerCollection[eventKey].length; i++) {
        var handler = _handlerCollection[eventKey][i];

        // Check for appRender
        if (handler.domNode && arguments.length >= 4) {
          var appConfig = arguments[2];
          var appHtml = arguments[3];

          if (appConfig.root) {
            jQuery(appConfig.root).append(appHtml);
          } else {
            appConfig.root = jQuery(appHtml).get(0);
          }

          jQuery(handler.domNode).append(appConfig.root);
        } else {
          handler.func.apply(F2, callbackArgs);
        }
      }
    }

    return this;
  },
  /**
    Allows Container Developer to add listener method that will be triggered
    when a specific event occurs.
    @method on
    @chainable
    @param {String} token The token received from
    {{#crossLink "F2.AppHandlers/getToken:method"}}{{/crossLink}}.
    @param {String} eventKey{.namespace} The event key used to determine
    which event to attach the listener to. The namespace is useful for
    removal purposes. At this time it does not affect when an event is fired.
    Complete list of event keys available in
    {{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.
    @param {Function} listener A function that will be triggered when a
    specific event occurs. For detailed argument definition refer to
    {{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.
    @returns {object} The F2 instance for chaining purposes
    @example
    var token = F2.AppHandlers.getToken();
    F2.AppHandlers.on(token, 'appRenderBefore', function() {
    F2.log('before app rendered!');
    });
    @example
    var token = F2.AppHandlers.getToken();
    F2.AppHandlers.on(token, 'appRenderBefore.myNamespace', function() {
    F2.log('before app rendered!');
    });
  */
  on: function(token, eventKey, listener) {
    if (!eventKey) {
      throw new Error('eventKey must be of type string and not null. For available appHandlers check F2.Constants.AppHandlers.');
    }

    var event = _parseEventKey(eventKey);

    if (!_handlerCollection[event.key]) {
      throw new Error('Invalid eventKey passed. Check your inputs and try again.');
    }

    var isAppRender = (event.key === 'appRender');
    var handler = _createHandler(token, event.namespace, listener, isAppRender);
    _handlerCollection[event.key].push(handler);

    return this;
  },
  /**
    Allows Container Developer to remove listener methods for specific events
    @method off
    @chainable
    @param {String} token The token received from {{#crossLink "F2.AppHandlers/getToken:method"}}{{/crossLink}}.
    @param {String} eventKey{.namespace} The event key used to determine
    which event to attach the listener to. If no namespace is provided all
    listeners for the specified event type will be removed. Complete list
    available in {{#crossLink "F2.Constants.AppHandlers"}}{{/crossLink}}.
    @returns {object} The F2 instance for chaining purposes
    @example
    var token = F2.AppHandlers.getToken();
    F2.AppHandlers.off(token, 'appRenderBefore');
  */
  off: function(token, eventKey) {
    if (!eventKey) {
      throw new Error('eventKey must be of type string and not null. For available appHandlers check F2.Constants.AppHandlers.');
    }

    var event = _parseEventKey(eventKey);

    if (!_handlerCollection[event.key]) {
      throw new Error('Invalid EventKey passed. Check your inputs and try again.');
    }

    _removeHandler(token, event.key, event.namespace);

    return this;
  }
};
