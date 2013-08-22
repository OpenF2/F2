// Check for the presence of AMD
if (typeof define !== 'undefined' && define.amd) {
	// Define F2 as a module
	define('F2', function() {
		return F2;
	});

	// Define the F2App plugin
	define('F2App', function() {
		// Track batchable apps
		var batchQueue = [];

		// Get one token to share across all events
		var token = F2.AppHandlers.getToken();

		// Store appHandlers for every loaded appId
		var userHandlers = {};

		// Add an appHandler that will execute a user specified callback
		function addAppHandler(eventName) {
			F2.AppHandlers.on(token, F2.Constants.AppHandlers[eventName], function(appConfig) {
				var appId = appConfig.appId;

				if (userHandlers[appId] && userHandlers[appId][eventName].length) {
					// Pull off the first handler for this app
					var handler = userHandlers[appId][eventName].shift();

					if (handler instanceof Function) {
						// Call handler with original arguments
						var args = Array.prototype.slice.apply(arguments);
						handler.apply(window, args);
					}
				}
			});
		}

		// Add global event handlers
		for (var eventName in F2.Constants.AppHandlers) {
			if (F2.Constants.AppHandlers.hasOwnProperty(eventName)) {
				addAppHandler(eventName);
			}
		}

		// Look at all the specified appConfigs and see if one of them matches the appId
		function getAppConfigById(configs, appId) {
			var appConfig;

			if (configs && appId) {
				for (var i = 0; i < configs.length; i++) {
					if (configs[i].appId == appId) {
						appConfig = configs[i];
						break;
					}
				}
			}

			return appConfig;
		}

		// Get an obj that will let the user add appHandlers
		function getHandlerHooks(handlerMap) {
			var handlerHooks = {};

			// Break out this function or jsHint will yell at us
			function addHook(eventName) {
				if (!handlerMap[eventName]) {
					// We'll store the handlers in an array, so we can handle multiple instances of the same app
					handlerMap[eventName] = [];
				}

				handlerHooks[eventName] = function(fn) {
					handlerMap[eventName].push(fn);
				};
			}

			// Add a hook for each event
			for (var eventName in F2.Constants.AppHandlers) {
				if (F2.Constants.AppHandlers.hasOwnProperty(eventName)) {
					addHook(eventName);
				}
			}

			return handlerHooks;
		}

		// Actually pass the appConfig(s) into 'registerApps'
		function loadApps(appConfig) {
			// Batch if possible
			if (appConfig.enableBatchRequests) {
				if (batchQueue.length) {
					F2.registerApps(batchQueue);
					batchQueue = [];
				}
			}
			else {
				// Load the app individually
				F2.registerApps(appConfig);
			}
		}

		return {
			load: function(uniqueAppId, req, onload, config) {
				if (!config.f2) {
					throw ('No require.config.f2 configuration found');
				}

				if (!config.f2.appConfigs) {
					throw ('No appConfigs found.');
				}

				// Start f2 if we haven't already
				if (!F2.isInit()) {
					F2.init(config.f2.initConfig);
				}

				// Strip off the randomizer guid and get the config
				var appId = uniqueAppId.substring(0, uniqueAppId.indexOf('?'));

				if (!appId) {
					throw ('appId is empty');
				}

				var appConfig = getAppConfigById(config.f2.appConfigs, appId);

				if (!appConfig) {
					throw (appId, 'is not a recognized appId.');
				}

				// Add this as a possible batch request
				if (appConfig.enableBatchRequests) {
					batchQueue.push(appConfig);
				}

				// Get our handler hooks and tell the require statement to execute the callback
				userHandlers[appId] = userHandlers[appId] || {};
				var handlerHooks = getHandlerHooks(userHandlers[appId]);
				onload(handlerHooks);

				// Load apps in a timeout so we can batch
				setTimeout(function() {
					loadApps(appConfig);
				}, 0);
			},
			normalize: function(appId, normalize) {
				// Randomize the module name
				// This allows us to load the same app multiple times and get different instances
				return appId + '?' + F2.guid();
			}
		};
	});
}