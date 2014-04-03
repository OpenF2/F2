(function(Ajax, _, Guid, LoadStaticFiles) {
	'use strict';

	var _loadedApps = {};
	var _loadingApps = {};
	var _loadListeners = {};

	// ---------------------------------------------------------------------------
	// Utils
	// ---------------------------------------------------------------------------

	// Find the instance of a loaded app by instance, root, or instanceId
	function _getLoadedApp(id) {
		var instance;

		// See if it's an instance id
		if (_loadedApps[id]) {
			instance = _loadedApps[id];
		}
		// Check if we were passed an instance
		else if (_loadedApps[id.instanceId]) {
			instance = _loadedApps[id.instanceId];
		}
		// See if it's an app root
		else if (_.isNode(id)) {
			for (var instanceId in _loadedApps) {
				if (_loadedApps[instanceId].root === id) {
					instance = _loadedApps[instanceId];
					break;
				}
			}
		}

		return instance;
	}

	// Group appConfigs into "async", "preloaded", and "broken"
	function _categorizeAppConfigs(appConfigs) {
		var async = [];
		var broken = [];
		var preloaded = [];

		for (var i = 0; i < appConfigs.length; i++) {
			var isValid = (Helpers.validate(appConfigs[i], 'appConfig'));
			var isPreloaded = (appConfigs[i].isPreload && _.isNode(appConfigs[i].root));
			var isAsync = (_.isString(appConfigs[i].manifestUrl));

			// Capture invalid configs
			if (!isValid || (!isPreloaded && !isAsync)) {
				broken.push({
					appConfig: appConfigs[i],
					error: 'Invalid app config',
					index: i
				});
			}
			else if (isPreloaded) {
				preloaded.push({
					appConfig: appConfigs[i],
					appContent: appConfigs[i].context || {},
					index: i,
					instanceId: Guid.guid(),
					root: appConfigs[i].root
				});
			}
			else if (isAsync) {
				async.push({
					appConfig: appConfigs[i],
					appManifest: {}, // This comes later
					index: i,
					instanceId: Guid.guid(),
					isAborted: false,
					isFailed: false
				});
			}
		}

		return {
			async: async,
			broken: broken,
			preloaded: preloaded
		};
	}

	// Group an array of apps into an object keyed by manifestUrl
	function _groupAppsByManifestUrl(apps) {
		var urls = {};

		for (var i = 0; i < apps.length; i++) {
			var config = apps[i].appConfig;

			if (!urls[config.manifestUrl]) {
				urls[config.manifestUrl] = {
					batch: [],
					singles: []
				};
			}

			if (config.enableBatchRequests) {
				urls[config.manifestUrl].batch.push(apps[i]);
			}
			else {
				urls[config.manifestUrl].singles.push(apps[i]);
			}
		}

		return urls;
	}

	function _requestAsyncApps(config, asyncApps, callback) {
		var requests = [];

		if (asyncApps.length) {
			var groupedApps = _groupAppsByManifestUrl(asyncApps);
			var numRequests = 0;

			// Loop over each url
			for (var url in groupedApps) {
				var appsForUrl = groupedApps[url];
				// Combine the single/batch requests into one array
				// Unbatched apps will get a request to themselves and batched apps will
				// be put together.
				var requestsToMake = appsForUrl.singles.slice();

				if (appsForUrl.batch.length) {
					requestsToMake.push(appsForUrl.batch);
				}

				numRequests += requestsToMake.length;

				var manifests = [];

				// Loop for each request
				_.each(requestsToMake, function(appsForRequest, i) {
					appsForRequest = [].concat(appsForRequest);
					var appConfigs = _.pluck(appsForRequest, 'appConfig');

					// Make the actual request to the remote server
					var xhr = _getManifestFromUrl(url, appConfigs, function(manifest) {
						if (manifest.error) {
							// Track that every app in this request failed
							_.each(appsForRequest, function(app, i) {
								app.isFailed = true;
							});
						}
						else {
							// Add the AppContent back to the app collection so we can use it later
							// If we don't do this, we'll have problems figuring out which content
							// goes with which app
							_.each(manifest.apps, function(appContent, i) {
								appsForRequest[i].appContent = appContent;
							});
						}

						manifests.push(manifest);

						// See if we've completed the last request
						if (!--numRequests) {
							var combinedManifests = _combineAppManifests(manifests);

							// Put the manifest files on the page
							LoadStaticFiles.load(
								config,
								combinedManifests.styles,
								combinedManifests.scripts,
								combinedManifests.inlineScripts,
								function() {
									// Look for aborted requests
									_.each(requests, function(request) {
										if (request.xhr.isAborted) {
											_.each(request.apps, function(app) {
												app.isAborted = true;
											});
										}
									});

									callback();
								}
							);
						}
					});

					requests.push({
						apps: appsForRequest,
						xhr: xhr
					});
				});
			}
		}
		else {
			callback();
		}

		return requests;
	}

	function _getManifestFromUrl(url, appConfigs, callback) {
		var invalidManifest = {
			error: 'Invalid app manifest'
		};

		// Strip out any "root" that found its way into the config
		var fixedConfigs = _.map(appConfigs, function(config) {
			var copy = _.defaults({}, config);
			copy.root = undefined;
			return copy;
		});

		return Ajax.request({
			data: {
				params: JSON.stringify(fixedConfigs)
			},
			error: function() {
				callback(invalidManifest);
			},
			success: function(manifest) {
				// Make sure the appManifest is valid
				if (!manifest || !Helpers.validate(manifest, 'appManifest')) {
					manifest = invalidManifest;
				}

				callback(manifest);
			},
			type: 'json',
			url: url
		});
	}

	function _combineAppManifests(manifests) {
		var combined = {
			apps: [],
			inlineScripts: [],
			scripts: [],
			styles: []
		};

		for (var i = 0; i < manifests.length; i++) {
			if (!manifests[i].error) {
				for (var prop in combined) {
					for (var x = 0; x < manifests[i][prop].length; x++) {
						combined[prop].push(manifests[i][prop][x]);
					}
				}
			}
		}

		return combined;
	}

	function _dumpAppsToDom(apps, container) {
		var fragment = document.createDocumentFragment();

		_.each(apps, function(app) {
			if (!app.isFailed && !app.isAborted) {
				// Data apps won't need a root, so we still need to check for one
				if (app.root) {
					fragment.appendChild(app.root);
				}
			}
		});

		container.appendChild(fragment);
	}

	function _initAppClasses(apps, callback) {
		if (apps.length) {
			var appIds = _.map(apps, function(app) {
				// Define a dummy app that will help the dev find missing classes
				define(app.appConfig.appId, [], function() {
					return function() {
						console.error(
							'F2: the app "' + app.appConfig.appId + '" was never defined and could not be loaded.',
							'Did you forget to include a script file?'
						);
					};
				});

				return app.appConfig.appId;
			});

			require(appIds, function() {
				var classes = Array.prototype.slice.call(arguments);

				// Load each AppClass
				_.each(apps, function(app, i) {
					try {
						// Track that we're loading this app right now
						// We need this because an app might try to register an event in
						// its constructor. When that happens we won't be able to check
						// that the "context" is a loaded app... cause it's loading
						_loadingApps[app.instanceId] = true;

						// Instantiate the app
						var instance = new classes[i](
							app.instanceId,
							app.appConfig,
							app.appContent.data || {},
							app.root
						);

						// Clear out the "loading" indicator
						delete _loadingApps[app.instanceId];

						if (!instance) {
							throw new Error();
						}

						// Add the new app to our internal map of loaded apps
						_loadedApps[app.instanceId] = {
							appConfig: app.appConfig,
							instance: instance,
							instanceId: app.instanceId,
							root: app.root
						};

						// Call any listeners for this app
						if (_loadListeners[app.instanceId]) {
							while (_loadListeners[app.instanceId].length) {
								_loadListeners[app.instanceId].shift()(instance);
							}
							delete _loadListeners[app.instanceId];
						}

						// Call "init" if one was provided
						if (instance.init) {
							instance.init();
						}
					}
					catch (e) {
						apps[i] = {
							error: e.toString()
						};
						console.error('F2: could not init', app.appConfig.appId, '"' + e.toString() + '"');
					}
				});

				callback();
			});
		}
		else {
			callback();
		}
	}

	function _sortApps(a, b) {
		return a.index - b.index;
	}

	// Whittle down the app's data into something we can pass to the container
	function _extractAppPropsForCallback(app) {
		var output = {
			appConfig: app.appConfig
		};

		if (app.isFailed) {
			output.error = 'App request failed';
		}
		else if (app.isAborted) {
			output.error = 'App request was aborted';
		}
		else {
			output.data = (app.appContent && app.appContent.data) ? app.appContent.data : {};
			output.root = app.root;
			output.instanceId = app.instanceId;
		}

		return output;
	}

	// Test to see if the app failed in any way
	function _appDidSucceed(app) {
		return !app.error && !app.isAborted && !app.isFailed;
	}

	// Turn an app's "html" into a dom node
	function _createAppRoot(app) {
		if (!app.appContent) {
			app.appContent = {
				data: {},
				html: ''
			};
		}

		if (app.appConfig.root) {
			app.root = app.appConfig.root;
			app.root.innerHTML = app.appContent.html || '';
		}
		else if (app.appContent.html) {
			var fakeParent = document.createElement('div');
			fakeParent.innerHTML = app.appContent.html;
			app.root = fakeParent.firstChild;
		}
	}

	// ---------------------------------------------------------------------------
	// API
	// ---------------------------------------------------------------------------

	Helpers.LoadApps = {
		isRealInstanceId: function(id) {
			return !!_loadingApps[id];
		},
		getLoadedApp: function(identifier) {
			if (!identifier) {
				throw 'F2: invalid id';
			}

			return _getLoadedApp(identifier);
		},
		addLoadListener: function(instanceId, callback) {
			if (!_loadListeners[instanceId]) {
				_loadListeners[instanceId] = [];
			}

			_loadListeners[instanceId].push(callback);
		},
		load: function(config, appConfigs, callback) {
			var apps = _categorizeAppConfigs(appConfigs);

			return _requestAsyncApps(config, apps.async, function() {
				var allApps = [].concat(apps.async, apps.preloaded, apps.broken);
				allApps.sort(_sortApps);

				// Strip out the failed apps
				var appsToLoad = _.filter(allApps, _appDidSucceed);

				// Make sure async apps have valid roots
				if (apps.async.length) {
					_.each(apps.async, _createAppRoot);
				}

				// Instantiate the apps
				_initAppClasses(appsToLoad, function() {
					if (callback) {
						// Get the properties we want to expose to the container
						var outputs = _.map(allApps, _extractAppPropsForCallback);
						callback(outputs);
					}
					else {
						// Put apps on the page if the container doesn't handle it
						_dumpAppsToDom(apps.async, document.body);
					}
				});
			});
		},
		remove: function(instanceId) {
			delete _loadedApps[instanceId];
		}
	};

})(Helpers.Ajax, Helpers._, Helpers.Guid, Helpers.LoadStaticFiles);
