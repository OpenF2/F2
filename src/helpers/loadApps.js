(function(Ajax, _, Guid, LoadStaticFiles) {
	'use strict';

	var _loadedApps = {};
	var _loadingApps = {};
	var _loadListeners = {};

	var EMPTY_MANIFEST = {
		data: {},
		dependencies: {},
		html: '',
		inlineScripts: [],
		scripts: [],
		styles: []
	};

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
					data: appConfigs[i].context || {},
					index: i,
					instanceId: Guid.guid(),
					root: appConfigs[i].root
				});
			}
			else if (isAsync) {
				async.push({
					appConfig: appConfigs[i],
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
	function _groupAppsByUrl(apps) {
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
			var groupedApps = _groupAppsByUrl(asyncApps);
			var numRequests = 0;
			var allManifests = [];

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

				// Loop for each request
				requestsToMake.forEach(function(appsForRequest, i) {
					appsForRequest = [].concat(appsForRequest);
					var appConfigs = _.pluck(appsForRequest, 'appConfig');

					// Make the actual request to the remote server
					var xhr = _getManifestFromUrl(url, appConfigs, function(manifests) {
						manifests.forEach(function(manifest, i) {
							if (manifest.error) {
								// Track that every app in this request failed
								appsForRequest.forEach(function(app) {
									app.isFailed = true;
								});
							}
							else {
								// Make sure we have certain properties
								_.defaults({}, manifest, EMPTY_MANIFEST);

								manifest.appConfig = appConfigs[i];

								// Tack on the returned data
								appsForRequest[i].data = manifest.data;
								appsForRequest[i].html = manifest.html;
							}
						});

						allManifests = allManifests.concat(manifests);

						// See if we've completed the last request
						if (!--numRequests) {
							var parts = _getManifestParts(allManifests);

							// Put the manifest files on the page
							LoadStaticFiles.load(
								config,
								parts.styles,
								parts.scripts,
								parts.inlineScripts,
								parts.dependencies,
								function() {
									// Look for aborted requests
									requests.forEach(function(request) {
										if (request.xhr.isAborted) {
											request.apps.forEach(function(app) {
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

	function _isNonEmptyString(str) {
		return str && str.trim();
	}

	// Combine the baseurl and path to get a single unified path
	function _reconcilePaths(baseUrl, path) {
		if (!path || !path.trim()) {
			return null;
		}

		// See if the path is already fine
		if (path.indexOf('//') !== -1) {
			return path;
		}

		// Pull off the trailing action no matter what
		baseUrl = baseUrl.substr(0, baseUrl.lastIndexOf('/') + 1);

		// Create a regex that will match the current directory indicator (./)
		var thisDirectoryMatcher = new RegExp(/^(\.\/)+/i);
		var thisMatches = thisDirectoryMatcher.exec(path);

		if (thisMatches) {
			path = path.substr(2);
		}
		else {
			// Create a regex that will match parent directory traversal (../)
			var parentDirectoryMatcher = new RegExp(/^(\.\.\/)+/i);
			var parentMatches = parentDirectoryMatcher.exec(path);

			if (parentMatches && parentMatches.length) {
				for (var i = 0; i < parentMatches.length - 1; i++) {
					// Go "up" one directory on the base path
					var lastSlash = baseUrl.lastIndexOf('/');
					var secondLastSlash = baseUrl.lastIndexOf('/', lastSlash - 1);
					baseUrl = baseUrl.substr(0, secondLastSlash + 1);

					// Remove the leading "../"
					path = path.substr(3);
				}
			}
		}

		return baseUrl + path;
	}

	// Pick out scripts, styles, inlineScripts, and dependencies from each AppManifest
	function _getManifestParts(manifests) {
		var dependencies = [];
		var inlineScripts = [];
		var scripts = [];
		var styles = [];

		if (manifests.length) {
			// Pick out all the arrays
			for (var i = 0; i < manifests.length; i++) {
				if (!manifests[i].error) {
					if (_.isObject(manifests[i].dependencies)) {
						dependencies.push(manifests[i].dependencies);
					}

					if (_.isArray(manifests[i].inlineScripts) && manifests[i].inlineScripts.length) {
						inlineScripts.push(manifests[i].inlineScripts);
					}

					if (_.isArray(manifests[i].scripts) && manifests[i].scripts.length) {
						manifests[i].scripts = manifests[i].scripts.map(function(path) {
							return _reconcilePaths(manifests[i].appConfig.manifestUrl, path);
						});
						scripts.push(manifests[i].scripts);
					}

					if (_.isArray(manifests[i].styles) && manifests[i].styles.length) {
						manifests[i].styles = manifests[i].styles.map(function(path) {
							return _reconcilePaths(manifests[i].appConfig.manifestUrl, path);
						});
						styles.push(manifests[i].styles);
					}
				}
			}

			// Flatten
			dependencies = Array.prototype.concat.apply([], dependencies);
			inlineScripts = Array.prototype.concat.apply([], inlineScripts);
			scripts = Array.prototype.concat.apply([], scripts);
			styles = Array.prototype.concat.apply([], styles);

			// Dedupe
			inlineScripts = _.unique(inlineScripts);
			scripts = _.unique(scripts);
			styles = _.unique(styles);

			// Filter out invalid paths
			inlineScripts = inlineScripts.filter(_isNonEmptyString);
			scripts = scripts.filter(_isNonEmptyString);
			styles = styles.filter(_isNonEmptyString);
		}

		return {
			dependencies: dependencies,
			inlineScripts: inlineScripts,
			scripts: scripts,
			styles: styles
		};
	}

	function _getManifestFromUrl(url, appConfigs, callback) {
		var invalidManifest = {
			error: 'Invalid app manifest'
		};

		// Strip out any properties the server doesn't need
		var fixedConfigs = appConfigs.map(function(config) {
			var params = {
				appId: config.appId
			};

			if (_.isObject(config.context)) {
				params.context = config.context;
			}

			return params;
		});

		return Ajax.request({
			data: {
				params: JSON.stringify(fixedConfigs)
			},
			error: function() {
				callback([invalidManifest]);
			},
			success: function(manifests) {
				// Make sure the response is valid
				if (!manifests || !_.isArray(manifests)) {
					manifests = [manifests || {}];
				}

				// Make sure each manifest complies with the spec
				for (var i = 0; i < manifests.length; i++) {
					if (!manifests[i] || !Helpers.validate(manifests[i], 'appManifest')) {
						manifests[i] = invalidManifest;
					}
				}

				callback(manifests);
			},
			type: 'json',
			url: url
		});
	}

	function _initAppClasses(apps, callback) {
		if (apps.length) {
			var appIds = apps.map(function(app) {
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
				apps.forEach(function(app, i) {
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
							app.data,
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
			output.data = app.data || {};
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
		if (app.appConfig.root) {
			app.root = app.appConfig.root;
			app.root.innerHTML = app.html || '';
		}
		else if (app.html && app.html.trim()) {
			var fakeParent = document.createElement('div');
			fakeParent.innerHTML = app.html;
			app.root = fakeParent.firstChild;
		}
	}

	function _dumpAppsToDom(apps, container) {
		var fragment = document.createDocumentFragment();

		apps.forEach(function(app) {
			if (!app.isFailed && !app.isAborted) {
				// Data apps won't need a root, so we still need to check for one
				if (app.root) {
					fragment.appendChild(app.root);
				}
			}
		});

		container.appendChild(fragment);
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
		isLoadedApp: function(identifier) {
			return !!this.getLoadedApp(identifier);
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
				allApps.sort(function(a, b) {
					return a.index - b.index;
				});

				// Strip out the failed apps
				var appsToLoad = allApps.filter(_appDidSucceed);

				// Make sure async apps have valid roots
				if (apps.async.length) {
					apps.async.forEach(_createAppRoot);
				}

				// Instantiate the apps
				_initAppClasses(appsToLoad, function() {
					if (callback) {
						// Get the properties we want to expose to the container
						var outputs = allApps.map(_extractAppPropsForCallback);
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
