define('F2', ['F2.Interfaces', 'F2.Ajax', 'F2.Events'], function(Interfaces, Ajax, Events) {

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

	// Track all the apps that have been loaded
	var _appInstances = {};

	// Track all the guids we've made on this page
	var _guids = {};

	// ---------------------------------------------------------------------------
	// Helpers
	// ---------------------------------------------------------------------------

	function _initApps(responseData) {
		var appIds = [];

		// Gather up the appIds
		for (var i = 0, len = responseData.length; i < len; i++) {
			appIds.push(responseData[i].appConfig.appId);
		}

		if (appIds.length) {
			// App classes should be wrapped in "define()", so this will load them
			require(appIds, function(/* appClass1, appClass2 */) {
				var appClasses = Array.prototype.slice.call(arguments);

				// Instantiate the app classes
				for (var i = 0, len = responseData.length; i < len; i++) {
					if (!responseData[i].appContent) {
						responseData[i].appContent = {};
					}

					// Initialize the app and save it to our internal map
					_appInstances[responseData[i].instanceId] = new appClasses[i](
						responseData[i].instanceId,
						responseData[i].appConfig,
						responseData[i].appContent.data || {},
						responseData[i].root
					);
				}
			});
		}
	}

	function _loadInlineScripts(inlines) {
		// Load the inline scripts
		try {
			eval(inlines.join(';'));
		}
		catch (e) {
			F2.log('Error loading inline scripts: ' + e);
		}
	}

	function _loadScripts(paths, inlines, callback) {
		// Check for user defined loader
		if (_.isFunction(_config.loadScripts)) {
			_config.loadScripts(paths, inlines, callback);
		}
		else if (paths.length) {
			LazyLoad.js(paths, function() {
				_loadInlineScripts(inlines);
				callback();
			});
		}
		else if (inlines.length) {
			_loadInlineScripts(inlines);
		}
		else {
			callback();
		}
	}

	function _loadStyles(paths, callback) {
		// Check for user defined loader
		if (_.isFunction(_config.loadStyles)) {
			_config.loadStyles(paths, callback);
		}
		else if (paths.length) {
			LazyLoad.css(paths, callback);
		}
		else {
			callback();
		}
	}

	function _loadApps(scriptPaths, stylePaths, inlineScripts, responseData, successFn, completeFn) {
		_loadStyles(stylePaths, function() {
			// Let the container add the html to the page
			// Get back an obj keyed by AppId that contains the root and instanceId
			successFn.apply(window, responseData);
			completeFn();

			// Add the scripts and, once finished, instantiate the app classes
			_loadScripts(scriptPaths, inlineScripts, function() {
				_initApps(responseData);
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

	// Return an array that contains combined appConfigs and appContent
	function _coalesceAppData(appConfigs, appContents) {
		if (!_.isArray(appConfigs)) {
			appConfigs = [appConfigs];
		}

		var data = [];
		var rootParent = document.createElement('div');

		for (var i = 0, len = appConfigs.length; i < len; i++) {
			var item = {
				appConfig: appConfigs[i],
				instanceId: F2.guid()
			};

			if (appContents[i].success) {
				item.appContent = appContents[i];

				if (appContents[i].html) {
					// Create a new element and add the app html
					// This will allow us to easily extract a DOM node from the markup
					rootParent.innerHTML = appContents[i].html;
					item.root = rootParent.firstChild;
				}
			}

			data.push(item);
		}

		return data;
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
			if (Interfaces.validate(appConfigs[i], 'appConfig')) {
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

	var F2 = {
		Apps: {},
		config: function(config) {
			if (config) {
				// Don't do anything with the config if it's invalid
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
			var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0;
				var v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});

			// Check if we've seen this one before
			if (_guids[guid]) {
				// Get a new guid
				guid = F2.guid();
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
						Ajax({
							url: url,
							type: 'json',
							data: {
								params: JSON.stringify(requestAppConfigs)
							},
							success: function(response) {
								if (!Interfaces.validate(response, 'appManifest')) {
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
									// Combine all the valid responses
									var combinedManifest = _.extend.apply(_, [{}].concat(appManifests));

									// Turn all the app data into a useful object
									var responseData = _coalesceAppData(params.appConfigs, combinedManifest.apps);

									_loadApps(
										combinedManifest.scripts,
										combinedManifest.styles,
										combinedManifest.inlineScripts,
										responseData,
										params.success || noop,
										params.complete || noop
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

			if (!instance || !instance.instanceId) {
				throw 'F2: could not find the app to remove';
			}

			_disposeApp(instance);
		}
	};

	return F2;

});