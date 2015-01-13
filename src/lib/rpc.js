/* global F2, easyXDM, jQuery */

/**
  Handles socket communication between the container and secure apps
  @class F2.Rpc
*/
F2.extend('Rpc', (function() {
  var _callbacks = {};
  var _secureAppPagePath = '';
  var _apps = {};
  var _rEvents = new RegExp('^' + F2.Constants.Sockets.EVENT);
  var _rRpc = new RegExp('^' + F2.Constants.Sockets.RPC);
  var _rRpcCallback = new RegExp('^' + F2.Constants.Sockets.RPC_CALLBACK);
  var _rSocketLoad = new RegExp('^' + F2.Constants.Sockets.LOAD);
  var _rUiCall = new RegExp('^' + F2.Constants.Sockets.UI_RPC);

  /**
    Creates a socket connection from the app to the container using
    <a href="http://easyxdm.net" target="_blank">easyXDM</a>.
    @method _createAppToContainerSocket
    @private
  */
  function _createAppToContainerSocket() {
    var appConfig;
    var isLoaded = false;
    /**
     It's possible for messages to be received before the socket load event has
     happened. We'll save off these messages and replay them once the socket is
     ready.
    */
    var messagePlayback = [];

    var socket = new easyXDM.Socket({
      onMessage: function(message, origin) {
        // Handle Socket Load
        if (!isLoaded && _rSocketLoad.test(message)) {
          message = message.replace(_rSocketLoad, '');
          var appParts = F2.parse(message);

          // Make sure we have the AppConfig and AppManifest
          if (appParts.length === 2) {
            appConfig = appParts[0];

            // Save socket
            _apps[appConfig.instanceId] = {
              config: appConfig,
              socket: socket
            };

            F2.registerApps([appConfig], [appParts[1]]);

            // Socket message playback
            jQuery.each(messagePlayback, function() {
              _onMessage(appConfig, message, origin);
            });

            isLoaded = true;
          }
        } else if (isLoaded) {
          // Pass everyting else to _onMessage
          _onMessage(appConfig, message, origin);
        } else {
          messagePlayback.push(message);
        }
      }
    });
  }

  /**
    Creates a socket connection from the container to the app using
    <a href="http://easyxdm.net" target="_blank">easyXDM</a>.
    @method _createContainerToAppSocket
    @private
    @param {appConfig} appConfig The F2.AppConfig object
    @param {F2.AppManifest} appManifest The F2.AppManifest object
    @return {object} The new socket
  */
  function _createContainerToAppSocket(appConfig, appManifest) {
    var container = jQuery(appConfig.root);

    if (!container.length) {
      F2.log('Unable to locate app in order to establish secure connection.');
      return;
    }

    var iframeProps = {
      scrolling: 'no',
      style: {
        width: '100%'
      }
    };

    if (appConfig.height) {
      iframeProps.style.height = appConfig.height + 'px';
    }

    var socket = new easyXDM.Socket({
      remote: _secureAppPagePath,
      container: container.get(0),
      props: iframeProps,
      onMessage: function(message, origin) {
        _onMessage(appConfig, message, origin);
      },
      onReady: function() {
        socket.postMessage(F2.Constants.Sockets.LOAD + F2.stringify([appConfig, appManifest], F2.appConfigReplacer));
      }
    });

    return socket;
  }

  /**
    @method _createRpcCallback
    @private
    @param {string} instanceId The app's Instance ID
    @param {function} callbackId The callback ID
    @return {function} A function to make the RPC call
  */
  function _createRpcCallback(instanceId, callbackId) {
    return function() {
      F2.Rpc.call(
        instanceId,
        F2.Constants.Sockets.RPC_CALLBACK,
        callbackId,
        [].slice.call(arguments).slice(2)
      );
    };
  }

  /**
    Handles messages that come across the sockets
    @method _onMessage
    @private
    @param {F2.AppConfig} appConfig The F2.AppConfig object
    @param {string} message The socket message
    @param {string} origin The originator
  */
  function _onMessage(appConfig, message, origin) {
    var obj;
    var func;

    function parseFunction(parent, functionName) {
      var path = String(functionName).split('.');
      for (var i = 0; i < path.length; i++) {
        if (parent[path[i]] === undefined) {
          parent = undefined;
          break;
        }
        parent = parent[path[i]];
      }
      return parent;
    }

    function parseMessage(regEx, rawMessage, instanceId) {
      var o = F2.parse(rawMessage.replace(regEx, ''));

      // if obj.callbacks
      //   for each callback
      //     for each params
      //       if callback matches param
      //        replace param with _createRpcCallback(app.instanceId, callback)
      if (o.params && o.params.length && o.callbacks && o.callbacks.length) {
        jQuery.each(o.callbacks, function(i, c) {
          jQuery.each(o.params, function(j, p) {
            if (c === p) {
              o.params[j] = _createRpcCallback(instanceId, c);
            }
          });
        });
      }

      return o;
    }

    // Handle UI Call
    if (_rUiCall.test(message)) {
      obj = parseMessage(_rUiCall, message, appConfig.instanceId);
      func = parseFunction(appConfig.ui, obj.functionName);

      if (func !== undefined) {
        func.apply(appConfig.ui, obj.params);
      } else {
        F2.log('Unable to locate UI RPC function: ' + obj.functionName);
      }
    } else if (_rRpc.test(message)) {
      obj = parseMessage(_rRpc, message, appConfig.instanceId);
      func = parseFunction(window, obj.functionName);

      if (func !== undefined) {
        func.apply(func, obj.params);
      } else {
        F2.log('Unable to locate RPC function: ' + obj.functionName);
      }
    } else if (_rRpcCallback.test(message)) {
      obj = parseMessage(_rRpcCallback, message, appConfig.instanceId);

      if (_callbacks[obj.functionName] !== undefined) {
        _callbacks[obj.functionName].apply(_callbacks[obj.functionName], obj.params);
        delete _callbacks[obj.functionName];
      }
    } else if (_rEvents.test(message)) {
      obj = parseMessage(_rEvents, message, appConfig.instanceId);
      F2.Events._socketEmit.apply(F2.Events, obj);
    }
  }

  /**
    Registers a callback function
    @method _registerCallback
    @private
    @param {function} callback The callback function
    @return {string} The callback ID
  */
  function _registerCallback(callback) {
    var callbackId = F2.guid();
    _callbacks[callbackId] = callback;
    return callbackId;
  }

  return {
    /**
      Broadcast an RPC function to all sockets
      @method broadcast
      @param {string} messageType The message type
      @param {Array} params The parameters to broadcast
    */
    broadcast: function(messageType, params) {
      var message = messageType + F2.stringify(params);

      jQuery.each(_apps, function(i, a) {
        a.socket.postMessage(message);
      });
    },
    /**
      Calls a remote function
      @method call
      @param {string} instanceId The app's Instance ID
      @param {string} messageType The message type
      @param {string} functionName The name of the remote function
      @param {Array} params An array of parameters to pass to the remote
      function. Any functions found within the params will be treated as a
      callback function.
    */
    call: function(instanceId, messageType, functionName, params) {
      // Loop through params and find functions and convert them to callbacks
      var callbacks = [];

      jQuery.each(params, function(i, e) {
        if (typeof e === 'function') {
          var cid = _registerCallback(e);
          params[i] = cid;
          callbacks.push(cid);
        }
      });

      _apps[instanceId].socket.postMessage(
        messageType + F2.stringify({
          functionName: functionName,
          params: params,
          callbacks: callbacks
        })
      );
    },

    /**
      Init function which tells F2.Rpc whether it is running at the container-
      level or the app-level. This method is generally called by
      F2.{{#crossLink "F2/init"}}{{/crossLink}}
      @method init
      @param {string} [secureAppPagePath] The
      {{#crossLink "F2.ContainerConfig"}}{{/crossLink}}.secureAppPagePath
      property
    */
    init: function(secureAppPagePath) {
      _secureAppPagePath = secureAppPagePath;

      if (!_secureAppPagePath) {
        _createAppToContainerSocket();
      }
    },

    /**
      Determines whether the Instance ID is considered to be 'remote'. This is
      determined by checking if 1) the app has an open socket and 2) whether
      F2.Rpc is running inside of an iframe
      @method isRemote
      @param {string} instanceId The Instance ID
      @return {bool} True if there is an open socket
    */
    isRemote: function(instanceId) {
      return (
        _apps[instanceId] !== undefined &&
        _apps[instanceId].config.isSecure &&
        !jQuery(_apps[instanceId].config.root).find('iframe').length
      );
    },

    /**
      Creates a container-to-app or app-to-container socket for communication
      @method register
      @param {F2.AppConfig} [appConfig] The F2.AppConfig object
      @param {F2.AppManifest} [appManifest] The F2.AppManifest object
    */
    register: function(appConfig, appManifest) {
      if (appConfig && appManifest) {
        _apps[appConfig.instanceId] = {
          config: appConfig,
          socket: _createContainerToAppSocket(appConfig, appManifest)
        };
      } else {
        F2.log('Unable to register socket connection. Please check container configuration.');
      }
    }
  };
})());
