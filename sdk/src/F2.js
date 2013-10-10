define('F2', ['F2.Promise', 'F2.Classes', 'F2.Interfaces', 'F2.Ajax'], function(Promise, Classes, Interfaces, Ajax) {

	// ---------------------------------------------------------------------------
	// Private Storage
	// ---------------------------------------------------------------------------

	// Set up a default config
	var _config = {
		debugMode: false,
		loadScripts: null,
		loadStyles: null,
		supportedViews: [],
		xhr: null
	};

	// Keep a running tally of legacy apps we've had to wrap in define()
	var _appsWrappedInDefine = {};

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

	function _initApps(apps, appData) {
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
				appData[apps[i].appId].context = apps[i].context || {};
			}
		}

		// App classes should be wrapped in "define()", so this will load them
		require(appIds, function(/* appClass1, appClass2 */) {
			var appClasses = Array.prototype.slice(arguments, appIds.length);

			// Instantiate the app classes
			for (var i = 0, len = appIds.length; i < len; i++) {
				var data = appData[appIds[i]];

				var instance = new appClasses[i](data.instanceId, data.context, data.root);
				instance.init();
			}
		});
	}

	function _loadScripts(paths, inlines, callback) {
		var hasPaths = (paths && paths instanceof Array && paths.length);
		var hasInlines = (inlines && inlines instanceof Array && inlines.length);

		if (hasPaths || hasInlines) {
			// Check for user defined loader
			if (_config.loadScripts instanceof Function) {
				_config.loadScripts(paths, inlines, callback);
			}
			else {
				require(paths, function() {
					// Load the inline scripts
					if (hasInlines) {
						for (var i = 0, len = inlines.length; i < len; i++) {
							try {
								eval(inlines[i]);
							}
							catch (exception) {
								F2.log('Error loading inline script: ' + exception + '\n\n' + inlines[i]);
							}
						}
					}

					callback();
				});
			}
		}
		else {
			callback();
		}
	}

	function _loadStyles(paths) {
		if (paths && paths instanceof Array && paths.length) {
			// Check for user defined loader
			if (_config.loadStyles instanceof Function) {
				_config.loadStyles(paths);
			}
			else {
				var frag = document.createDocumentFragment();
				var tags = document.getElementsByTagName('link');
				var existingPaths = {};

				// Find all the existing paths on the page
				for (var i = 0, iLen = tags.length; i < iLen; i++) {
					existingPaths[tags[i].href] = true;
				}

				// Create a link tag for each path
				for (var j = 0, jLen = paths.length; j < jLen; j++) {
					if (!existingPaths[paths[j]]) {
						var link = document.createElement('link');
						link.rel = 'stylesheet';
						link.type = 'text/css';
						link.href = paths[j];
						frag.appendChild(link);
					}
				}

				// Add tags to the page
				document.getElementsByName('head')[0].appendChild(frag);
			}
		}
	}

	function _loadApps(responses, deferred) {
		_loadStyles(responses.styles);

		// Let the container add the html to the page
		// Get back an obj keyed by AppId that contains the root and instanceId
		var appDataById = _loadHtml(responses.apps, deferred);

		// Add the scripts and, once finished, instantiate the app classes
		_loadScripts(responses.scripts, responses.inlineScripts, function() {
			_initApps(responses.apps, appDataById);
		});
	}

	// ---------------------------------------------------------------------------
	// API
	// ---------------------------------------------------------------------------

	return {
		Apps: {},
		/**
			* Initializes the container. This method must be called before performing any other actions in the container.
			* @method init
			* @param {F2.ContainerConfig} config The configuration object
			*/
		config: function(config) {
			if (config) {
				// Don't do anything with the config if it's not valid
				if (Interfaces.validate(config, 'containerConfig')) {
					_.extend(_config, config);
				}
			}
			else {
				return _config;
			}
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
			if (appConfigs instanceof Array === false) {
				appConfigs = [appConfigs];
			}

			var deferred = Promise.defer();
			var appsByUrl = {};

			// Get an obj of appIds keyed by manifestUrl
			for (var i = 0, iLen = appConfigs.length; i < iLen; i++) {
				// Make sure the appConfig is valid
				if (Interfaces.validate(appConfigs[i], 'appConfig')) {
					var manifestUrl = appConfigs[i].manifestUrl;

					appsByUrl[manifestUrl] = appsByUrl[manifestUrl] || {
						batch: [],
						singles: []
					};

					// Batch or don't based on appConfig.enableBatchRequests
					if (appConfigs[i].enableBatchRequests) {
						appsByUrl[manifestUrl].batch.push(appConfigs[i]);
					}
					else {
						appsByUrl[manifestUrl].singles.push(appConfigs[i]);
					}
				}
			}

			// Obj that holds all the xhr responses
			var appManifests = [];
			var numRequests = 0;

			// Request all apps from each url
			for (var url in appsByUrl) {
				// Smush batched and unbatched apps together in a single collection
				// e.g., [{ appId: "one" }, [{ appId: "one", batch: true }, { appId: "one", batch: true }]]
				var appCollection = appsByUrl[url].singles.push(appsByUrl[url].batch);

				for (var j = 0, jLen = appCollection.length; j < jLen; j++) {
					numRequests += 1;

					Ajax(url, appCollection[j], false)
						.then(function(manifest) {
							// Make sure this is a valid AppManifest
							if (Interfaces.validate(manifest, 'AppManifest')) {
								appManifests.push(manifest);
							}
						})
						.fail(function(reason) {
							console.warn(reason);
						})
						.fin(function() {
							numRequests -= 1;

							// See if we've finished requesting all the apps
							if (numRequests === 0 && appManifests.length) {
								// Combine all the valid responses
								var combined = _.extend.apply(_, [{}].concat(appManifests));
								_loadApps(combined, deferred);
							}
						});
				}
			}

			return deferred.promise;
		}
	};

});