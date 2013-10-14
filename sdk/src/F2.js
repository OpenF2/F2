define('F2', ['F2.Schemas', 'F2.Events'], function(Schemas, Events) {

	// ---------------------------------------------------------------------------
	// Private Storage
	// ---------------------------------------------------------------------------

	// Set up a default config
	var _config = {
		debugMode: false,
		loadScripts: null,
		loadStyles: null,
		supportedViews: [],
		xhr: {
			dataType: null,
			type: null,
			url: null
		},
		ui: {
			modal: null,
			showMask: null,
			hideMask: null
		}
	};

	// Track all the apps that have been loaded
	var _appInstances = {};

	// Track all the guids we've made on this page
	var _guids = {};

	// ---------------------------------------------------------------------------
	// Helpers
	// ---------------------------------------------------------------------------

	function _disposeApp(instance) {
		// Call the app's dipose method if it has one
		if (instance.dispose) {
			instance.dispose();
		}

		// Unsubscribe events by context
		Events.off(null, null, instance);

		// Remove ourselves from the DOM
		if (instance.root && instance.root.parentNode) {
			instance.root.parentNode.removeChild(instance.root);
		}

		// Set a property that will let us watch for memory leaks
		instance.__f2Disposed__ = true;

		// Remove ourselves from the internal map
		delete _appInstances[instance.instanceId];
	}

	// Get an object keyed on manifestUrl with a value of an array of appConfigs
	function _getAppConfigsByUrl(appConfigs) {
		var configs = {};

		if (!_.isArray(appConfigs)) {
			appConfigs = [appConfigs];
		}

		// Get an obj of appIds keyed by manifestUrl
		for (var i = 0, len = appConfigs.length; i < len; i++) {
			// Make sure the appConfig is valid
			if (Schemas.validate(appConfigs[i], 'appConfig')) {
				var manifestUrl = appConfigs[i].manifestUrl;

				configs[manifestUrl] = configs[manifestUrl] || {
					batch: [],
					singles: []
				};

				// Batch or don't based on appConfig.enableBatchRequests
				if (appConfigs[i].enableBatchRequests) {
					configs[manifestUrl].batch.push(appConfigs[i]);
				}
				else {
					configs[manifestUrl].singles.push(appConfigs[i]);
				}
			}
		}

		return configs;
	}

	// ---------------------------------------------------------------------------
	// API
	// ---------------------------------------------------------------------------

	return {
		Apps: {},
		config: function(config) {
			if (config) {
				// Don't do anything with the config if it's invalid
				if (Schemas.validate(config, 'containerConfig')) {
					_.extend(_config, config);
				}
			}

			return _config;
		},
		/**
			* Generates an RFC4122 v4 compliant id
			* @method guid
			* @return {string} A random id
			* @for F2
			* Derived from: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript#answer-2117523
			*/
		guid: function _guid() {
			var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0;
				var v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});

			// Check if we've seen this one before
			if (_guids[guid]) {
				// Get a new guid
				guid = _guid();
			}

			_guids[guid] = true;

			return guid;
		},
		load: function(params) {
			var appConfigsByUrl = _getAppConfigsByUrl(params.appConfigs);

			// Obj that holds all the xhr responses
			var appManifests = [];
			var numRequests = 0;

			// Request all apps from each url
			for (var url in appConfigsByUrl) {
				var allConfigs = appConfigsByUrl[url].singles.slice();

				// Smush batched and unbatched apps together in a single collection
				// e.g., [{ appId: "one" }, [{ appId: "one", batch: true }, { appId: "one", batch: true }]]
				if (appConfigsByUrl[url].batch.length) {
					allConfigs.push(appConfigsByUrl[url].batch);
				}

				for (var i = 0, len = allConfigs.length; i < len; i++) {
					numRequests += 1;

					(function(requestAppConfigs) {
						_helpers.ajax({
							url: url,
							type: 'json',
							data: {
								params: JSON.stringify(requestAppConfigs)
							},
							success: function(response) {
								if (!Schemas.validate(response, 'appManifest')) {
									response = { apps: [{ success: false }] };
								}

								appManifests.push(response);
							},
							error: function(reason) {
								if (params.error) {
									params.error(reason);
								}
							},
							complete: function() {
								// See if we've finished requesting all the apps
								if (--numRequests === 0 && appManifests.length) {
									_helpers.loadApps(
										params.appConfigs,
										appManifests,
										params.success,
										params.error,
										params.complete,
										function(instances) {
											for (var i = 0, len = instances.length; i < len; i++) {
												_appInstances[instances[i].instanceId] = instances[i];
											}
										}
									);
								}
							}
						});
					})(allConfigs[i]);
				}
			}
		},
		/**
		 * Removes an app from the container
		 * @method removeApp
		 * @param {string} indentifier The app's instanceId or root
		 */
		removeApp: function(identifier) {
			if (!identifier) {
				throw 'F2: you must provide an instanceId or a root to remove an app';
			}

			var instance;

			// Treat as root
			if (identifier.nodeType === 1) {
				for (var id in _appInstances) {
					if (_appInstances[id].root === identifier) {
						instance = _appInstances[id];
						break;
					}
				}
			}
			else {
				// Treat as instanceId
				instance = _appInstances[identifier];
			}

			if (instance && instance.instanceId) {
				_disposeApp(instance);
			}
			else {
				console.warn('F2: could not find an app to remove');
			}
		}
	};

});