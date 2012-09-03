/**
 * Handles socket communication between the Container and secure Apps
 * @class F2.Rpc
 */
F2.extend('Rpc', (function(){
	
	var _apps = {};
	var _callbacks = {};
	var _secureAppPagePath = '';
	var _rAppCall = new RegExp('^' + F2.Constants.Sockets.APP_RPC);
	var _rEvents = new RegExp('^' + F2.Constants.Sockets.EVENT);
	var _rRpc = new RegExp('^' + F2.Constants.Sockets.RPC);
	var _rRpcCallback = new RegExp('^' + F2.Constants.Sockets.RPC_CALLBACK);
	var _rSocketLoad = new RegExp('^' + F2.Constants.Sockets.LOAD);

	/**
	 * Creates a socket connection from the App to the Container using 
	 * <a href="http://easyxdm.net" target="_blank">easyXDM</a>.
	 * @method _createAppToContainerSocket
	 * @private
	 */
	var _createAppToContainerSocket = function() {

		var isLoaded = false;
		var app = false;

		var socket = new easyXDM.Socket({
			onMessage: function(message, origin){

				// handle Socket Load
				if (!isLoaded && _rSocketLoad.test(message)) {
					message = message.replace(_rSocketLoad, '');
					var appParts = F2.parse(message);

					// make sure we have the App and AppManifest
					if (appParts.length == 2) {
						app = appParts[0]; // assigning app object to closure
						var appManifest = appParts[1];

						// save app locally
						_apps[app.instanceId] = {
							app:app,
							socket:socket
						};

						F2.registerApps([app], [appManifest]);
						isLoaded = true;
					}

				// pass everyting else to _onMessage
				} else {
					_onMessage(app, message, origin);
				}
			}
		});
	};

	/**
	 * Creates a socket connection from the Container to the App using 
	 * <a href="http://easyxdm.net" target="_blank">easyXDM</a>.
	 * @method _createContainerToAppSocket
	 * @private
	 * @param {F2.App} app The App object
	 * @param {F2.AppManifest} appManifest The AppManifest object
	 */
	var _createContainerToAppSocket = function(app, appManifest) {

		var container = $('#' + app.instanceId).find("." + F2.Constants.Css.APP_CONTAINER);

		if (!container.length) {
			F2.log('Unable to locate app in order to establish secure connection.');
			return;
		}

		var iframeProps = {
			scrolling:'no',
			style:{
				width:'100%'
			}
		};

		if (app.height) {
			iframeProps.style.height = app.height + 'px';
		}

		var socket = new easyXDM.Socket({
			remote: _secureAppPagePath,
			container: container.get(0),
			props:iframeProps,
			onMessage: function(message, origin) {
				// pass everything to _onMessage
				_onMessage(app, message, origin);
			},
			onReady: function() {
				socket.postMessage(F2.Constants.Sockets.LOAD + F2.stringify([app, appManifest]));
			}
		});

		return socket;
	};

	/**
	 * @method _createRpcCallback
	 * @private
	 * @param {string} instanceId The App's Instance ID
	 * @param {function} callbackId The callback ID
	 * @return {function} A function to make the RPC call
	 */
	var _createRpcCallback = function(instanceId, callbackId) {
		return function() {
			F2.Rpc.call(
				instanceId,
				F2.Constants.Sockets.RPC_CALLBACK,
				callbackId,
				[].slice.call(arguments).slice(2)
			);
		};
	};

	/**
	 * Handles messages that come across the sockets
	 * @method _onMessage
	 * @private
	 * @param {F2.App} app The App object
	 * @param {string} message The socket message
	 * @param {string} origin The originator
	 */
	var _onMessage = function(app, message, origin) {

		var obj;

		function parse(regEx, message) {
			return F2.parse(message.replace(regEx, ''));
		}

		// handle App Call
		if (_rAppCall.test(message)) {
			obj = parse(_rAppCall, message);
			app[obj.functionName].apply(app, obj.params);

		// handle RPC
		} else if (_rRpc.test(message)) {
			obj = parse(_rRpc, message);

			// if obj.callbacks
			//   for each callback
			//     for each params
			//       if callback matches param
			//        replace param with _createRpcCallback(app.instanceId, callback)
			if (obj.params && obj.params.length && obj.callbacks && obj.callbacks.length) {
				$.each(obj.callbacks, function(i, c) {
					$.each(obj.params, function(i, p) {
						if (c == p) {
							obj.params[i] = _createRpcCallback(app.instanceId, c);
						}
					});
				});
			}
			// parse function path
			var path = String(obj.functionName).split('.');
			var func = window;
			for (var i = 0; i < path.length; i++) {
				if (func[path[i]] === undefined) {
					func = undefined;
					break;
				}
				func = func[path[i]];
			}
			// if we found the function, call it
			if (func !== undefined) {
				func.apply(func, obj.params);
			} else {
				F2.log('Unable to locate RPC function: ' + obj.functionName);
			}

		// handle RPC Callback
		} else if (_rRpcCallback.test(message)) {
			obj = parse(_rRpcCallback, message);
			if (_callbacks[obj.functionName] !== undefined) {
				_callbacks[obj.functionName].apply(_callbacks[obj.functionName], obj.params);
				delete _callbacks[obj.functionName];
			}

		// handle Events
		} else if (_rEvents.test(message)) {
			obj = parse(_rEvents, message);
			F2.Events._socketEmit.apply(F2.Events, obj);
		}
	};

	/**
	 * Registers a callback function
	 * @method _registerCallback
	 * @param {function} callback The callback function
	 * @return {string} The callback ID
	 */
	var _registerCallback = function(callback) {
		var callbackId = F2.guid();
		_callbacks[callbackId] = callback;
		return callbackId;
	};

	return {
		/**
		 * Broadcast an RPC function to all sockets
		 * @method broadcast
		 * @param {string} messageType The message type
		 * @param {Array} params The parameters to broadcast
		 */
		broadcast:function(messageType, params) {
			// check valid messageType
			var message = messageType + F2.stringify(params);
			$.each(_apps, function(i, a) {
				a.socket.postMessage(message);
			});
		},
		/**
		 * Calls a remote function
		 * @method call
		 * @param {string} instanceId The App's Instance ID
		 * @param {string} messageType The message type
		 * @param {string} functionName The name of the remote function
		 * @param {Array} params An array of parameters to pass to the remote
		 * function. Any functions found within the params will be treated as a
		 * callback function.
		 */
		call:function(instanceId, messageType, functionName, params) {
			// loop through params and find functions and convert them to callbacks
			var callbacks = [];
			$.each(params, function(i, e) {
				if (typeof e === "function") {
					var cid = _registerCallback(e);
					params[i] = cid;
					callbacks.push(cid);
				}
			});
			// check valid messageType
			_apps[instanceId].socket.postMessage(
				messageType + F2.stringify({
					functionName:functionName,
					params:params,
					callbacks:callbacks
				})
			);
		},

		/**
		 * Init function which tells F2.Rpc whether it is running at the Container-
		 * level or the App-level. This method is generally called by
		 * {{#crossLink "F2/init"}}{{/crossLink}}
		 * @method init
		 * @param {string} [secureAppPagePath] The
		 * {{#crossLink "F2.ContainerConfiguration"}}{{/crossLink}}.secureAppPagePath
		 * property
		 */
		init:function(secureAppPagePath) {
			_secureAppPagePath = secureAppPagePath;
			if (!_secureAppPagePath) {
				_createAppToContainerSocket();
			}
		},

		/**
		 * Determines whether the Instance ID is considered to be 'remote'. This is
		 * determined by checking if 1) the App has an open socket, 2) where the
		 * instance of RPC is running (Container or App) and 3) where the App is
		 * relative to where this RPC is.
		 * @method isRemote
		 * @param {string} instanceId The Instance ID
		 * @return {bool} True if there is an open socket
		 */
		isRemote:function(instanceId) {
			return (
				// we have an App
				_apps[instanceId] !== undefined && 
				// the App is secure
				_apps[instanceId].app.isSecure &&
				// we can't access the iframe
				$('#' + instanceId).find('iframe').length == 0
			);
		},

		/**
		 * Creates a Container-to-App or App-to-Container socket for communication
		 * @method register
		 * @param {F2.App} [app] The App object
		 */
		register:function(app, appManifest) {
			if (app) {
				_apps[app.instanceId] = {
					app:app,
					socket:_createContainerToAppSocket(app, appManifest)
				};
			} else {
				F2.log("Unable to register socket connection. Please check container configuration.");
			}
		}
	};
})());