define('F2', ['F2.Promise', 'F2.Interfaces', 'F2.Ajax', 'F2.Events'], function(Promise, Classes, Interfaces, Ajax, Events) {

	// ---------------------------------------------------------------------------
	// Private Storage
	// ---------------------------------------------------------------------------

	// Set up a default config
	var _config = {
		debugMode: false,
		loadScripts: null,
		loadStyles: null,
		supportedViews: [],
		xhr: null,
		ui: {
			modal: null,
			showMask: null,
			hideMask: null
		}
	};

	// Keep a running tally of legacy apps we've had to wrap in define()
	var _appsWrappedInDefine = {};

	// Track all the apps that have been loaded
	var _appInstances = {};

	// ---------------------------------------------------------------------------
	// Helpers
	// ---------------------------------------------------------------------------

	function _loadHtml(apps, deferred) {
		var rootParent = document.createElement('div');
		var deferArgs = {};

		// Make a promise argument for each app
		// This will let the container place the app on the page
		for (var i = 0, len = apps.length; i < len; i++) {
			if (apps[i].appId) {
				// Create a new element and add the app html
				// This will allow us to easily extract a DOM node from the markup
				rootParent.innerHTML = apps[i].html;

				deferArgs[apps[i].appId] = {
					instanceId: F2.guid(),
					root: rootParent.firstChild
				};
			}
		}

		// Allow the container to act on the apps
		deferred.resolve(deferArgs);

		return deferArgs;
	}

	function _initApps(apps, appDataByAppId, appConfigsByAppId) {
		var appIds = [];

		for (var i = 0, len = apps.length; i < len; i++) {
			if (apps[i].appId) {
				appIds.push(apps[i].appId);

				// See if this app was defined the old way
				// e.g., F2.Apps['goober'] = ...
				if (F2.Apps[apps[i].appId] && !_appsWrappedInDefine[apps[i].appId]) {
					// Wrap the app class inside define() so we can load it through AMD
					define(apps[i].appId, [], F2.Apps[apps[i].appId]);

					_appsWrappedInDefine[apps[i].appId] = true;
				}

				// Add the context to the appData
				appDataByAppId[apps[i].appId].context = apps[i].context || {};
			}
		}

		// App classes should be wrapped in "define()", so this will load them
		require(appIds, function(/* appClass1, appClass2 */) {
			var appClasses = Array.prototype.slice(arguments, appIds.length);

			// Instantiate the app classes
			for (var i = 0, len = appIds.length; i < len; i++) {
				var data = appDataByAppId[appIds[i]];
				var appConfig = appConfigsByAppId[appIds[i]];

				// Initialize the app and save it to our internal map
				_appInstances[data.instanceId] = new appClasses[i](data.instanceId, appConfig, data.root);
			}
		});
	}

	function _loadScripts(paths, inlines, callback) {
		// Check for user defined loader
		if (_.isFunction(_config.loadScripts)) {
			_config.loadScripts(paths, inlines, callback);
		}
		else {
			LazyLoad.js(paths, function() {
				// Load the inline scripts
				try {
					eval(inlines.join(';'));
				}
				catch (e) {
					F2.log('Error loading inline scripts: ' + e);
				}

				callback();
			});
		}
	}

	function _loadStyles(paths, callback) {
		// Check for user defined loader
		if (_.isFunction(_config.loadStyles)) {
			_config.loadStyles(paths, callback);
		}
		else {
			LazyLoad.css(paths, callback);
		}
	}

	function _loadApps(responses, appConfigsByAppId, deferred) {
		_loadStyles(responses.styles, function() {
			// Let the container add the html to the page
			// Get back an obj keyed by AppId that contains the root and instanceId
			var appDataById = _loadHtml(responses.apps, deferred);

			// Add the scripts and, once finished, instantiate the app classes
			_loadScripts(responses.scripts, responses.inlineScripts, function() {
				_initApps(responses.apps, appDataById, appConfigsByAppId);
			});
		});
	}

	function _disposeApp(instance) {
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

	// ---------------------------------------------------------------------------
	// API
	// ---------------------------------------------------------------------------

	return {
		Apps: {},
		config: function(config) {
			if (config) {
				// Don't do anything with the config if it's not valid
				if (Interfaces.validate(config, 'containerConfig')) {
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
		guid: function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0;
				var v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		},
		load: function(appConfigs) {
			if (!_.isArray(appConfigs)) {
				appConfigs = [appConfigs];
			}

			var deferred = Promise.defer();
			var appConfigsByUrl = {};
			var appConfigsByAppId = {};

			// Get an obj of appIds keyed by manifestUrl
			for (var i = 0, iLen = appConfigs.length; i < iLen; i++) {
				// Make sure the appConfig is valid
				if (Interfaces.validate(appConfigs[i], 'appConfig')) {
					var manifestUrl = appConfigs[i].manifestUrl;

					appConfigsByUrl[manifestUrl] = appConfigsByUrl[manifestUrl] || {
						batch: [],
						singles: []
					};

					// Batch or don't based on appConfig.enableBatchRequests
					if (appConfigs[i].enableBatchRequests) {
						appConfigsByUrl[manifestUrl].batch.push(appConfigs[i]);
					}
					else {
						appConfigsByUrl[manifestUrl].singles.push(appConfigs[i]);
					}

					appConfigsByAppId[appConfigs[i].appId] = appConfigs[i];
				}
			}

			// Obj that holds all the xhr responses
			var appManifests = [];
			var numRequests = 0;

			// Request all apps from each url
			for (var url in appConfigsByUrl) {
				// Smush batched and unbatched apps together in a single collection
				// e.g., [{ appId: "one" }, [{ appId: "one", batch: true }, { appId: "one", batch: true }]]
				var appCollection = appConfigsByUrl[url].singles.push(appConfigsByUrl[url].batch);

				for (var j = 0, jLen = appCollection.length; j < jLen; j++) {
					numRequests += 1;

					Ajax({
						url: url,
						data: {
							params: appCollection[j]
						}
					}).then(function(manifest) {
						// Make sure this is a valid AppManifest
						if (Interfaces.validate(manifest, 'AppManifest')) {
							appManifests.push(manifest);
						}
					}).fail(function(reason) {
						console.warn(reason);
					}).fin(function() {
						numRequests -= 1;

						// See if we've finished requesting all the apps
						if (numRequests === 0 && appManifests.length) {
							// Combine all the valid responses
							var combined = _.extend.apply(_, [{}].concat(appManifests));
							_loadApps(combined, appConfigsByAppId, deferred);
						}
					});
				}
			}

			return deferred.promise;
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

			if (!instance || !instance.instanceId) {
				throw 'F2: could not find the app to remove';
			}

			_disposeApp(instance);
		}
	};

});