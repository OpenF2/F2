(function(Ajax, _, Guid) {

	var appInstances = {};
	var inFlightInstanceIds = {};
	var loadListeners = {};

	// ---------------------------------------------------------------------------
	// Utils
	// ---------------------------------------------------------------------------

	function loadApps(containerConfig, appConfigs, successFn, errorFn, completeFn, afterRequestFn) {
		var xhrByUrl;
		// Params used to instantiate AppClasses
		var allApps = [];
		// Track which apps need to hit the server
		var asyncApps = [];

		for (var i = 0, len = appConfigs.length; i < len; i++) {
			var inputs = {};

			// The AppConfig must be valid
			if (appConfigs[i] && F2.prototype.validate.call(this, appConfigs[i], 'appConfig')) {
				inputs.instanceId = Guid.guid();
				inputs.appConfig = appConfigs[i];

				// See if this is a preloaded app (already has a root)
				if (appConfigs[i].root && appConfigs[i].root.nodeType === 1) {
					inputs.root = appConfigs[i].root;

					// Set a dummy AppContent since we won't be hitting the server
					inputs.appContent = {
						success: true,
						data: appConfigs[i].context || {}
					};
				}
				else if (appConfigs[i].manifestUrl) {
					asyncApps.push(inputs);
				}
			}

			allApps.push(inputs);
		}

		function done() {
			delegateHtmlLoading(
				allApps,
				successFn,
				completeFn,
				xhrByUrl
			);
		}

		// See if we need to hit the server
		if (asyncApps.length) {
			xhrByUrl = requestApps(containerConfig, asyncApps, function() {
				if (afterRequestFn) {
					afterRequestFn();
				}

				done();
			});
		}
		else {
			if (afterRequestFn) {
				afterRequestFn();
			}

			done();
		}

		return xhrByUrl || {};
	}

	// Add unhandled apps to document.body
	function dumpAppsOnDom(/* app1, app2 */) {
		var args = Array.prototype.slice.call(arguments);

		if (args.length) {
			var frag = document.createDocumentFragment();

			for (var i = 0, len = args.length; i < len; i++) {
				if (args[i].root) {
					frag.appendChild(args[i].root);
				}
			}

			document.body.appendChild(frag);
		}
	}

	// Pass the apps off to the container so they can place them on the page
	function delegateHtmlLoading(allApps, successFn, completeFn, xhrByUrl) {
		var abortedIndexes = [];

		// Look for aborted requests
		if (xhrByUrl) {
			for (var i = 0, len = allApps.length; i < len; i++) {
				var url = allApps[i].appConfig.manifestUrl;

				if (xhrByUrl[url] && xhrByUrl[url].request.isAborted) {
					allApps[i].isAborted = true;
					abortedIndexes.push(i);
				}
			}
		}

		// Let the container put the apps on the page
		if (successFn) {
			successFn.apply(window, allApps);
		}
		else {
			// Throw the apps on document.body if there's no handler
			dumpAppsOnDom.apply(window, allApps);
		}

		// Pull out the aborted classes so we don't load them
		while (abortedIndexes.length) {
			allApps.splice(abortedIndexes.pop(), 1);
		}

		initAppClasses(allApps, completeFn);
	}

	// Instantiate each app class in the order their appConfigs were initially specified
	function initAppClasses(allApps, completeFn) {
		var appIds = _.map(allApps, function(app) {
			return app.appConfig.appId;
		});

		if (appIds.length) {
			require(appIds, function() {
				var appClasses = Array.prototype.slice.call(arguments);

				// Load each AppClass
				_.each(allApps, function(app, i) {
					try {
						// Track that we're loading this app right now
						// We need this because an app might try to register an event in
						// its constructor. When that happens we won't be able to check
						// that the "context" is a loaded app... cause it's loading
						inFlightInstanceIds[app.instanceId] = true;

						// Instantiate the app
						var instance = new appClasses[i](
							app.instanceId,
							app.appConfig,
							app.appContent.data || {},
							app.root
						);

						// Clear out the app so we won't get confused later
						delete inFlightInstanceIds[app.instanceId];

						// Exit if we didn't get anything back
						if (!instance) {
							throw '';
						}

						// Add the new app to our internal map of loaded apps
						appInstances[app.instanceId] = {
							appConfig: app.appConfig,
							instance: instance,
							instanceId: app.instanceId,
							root: app.root
						};

						// Call any listeners for this app
						if (loadListeners[app.instanceId]) {
							while (loadListeners[app.instanceId].length) {
								var callback = loadListeners[app.instanceId].shift();
								callback(instance);
							}
						}

						// Call "init" if one was provided
						if (instance.init) {
							instance.init();
						}
					}
					catch (e) {
						console.error('F2: could not init', app.appConfig.appId, '"' + e.toString() + '"');
					}
				});

				// Finally tell the container that we're all finished
				if (completeFn) {
					completeFn();
				}
			});
		}
		else {
			if (completeFn) {
				completeFn();
			}
		}
	}

	// Set the 'root' and 'appContent' for each input by hitting the server
	function requestApps(containerConfig, asyncApps, callback) {
		var xhrByUrl = {};
		var appsByUrl = {};

		// Get a map of apps keyed by url
		for (var i = 0, len = asyncApps.length; i < len; i++) {
			var config = asyncApps[i].appConfig;

			if (!appsByUrl[config.manifestUrl]) {
				appsByUrl[config.manifestUrl] = {
					singles: [],
					batch: []
				};
			}

			if (config.enableBatchRequests) {
				appsByUrl[config.manifestUrl].batch.push(asyncApps[i]);
			}
			else {
				appsByUrl[config.manifestUrl].singles.push(asyncApps[i]);
			}
		}

		var appManifests = [];
		var numRequests = 0;

		for (var url in appsByUrl) {
			xhrByUrl[url] = [];

			// Make a collection of all the configs we'll need to make
			// Each index maps to one web request
			var urlApps = appsByUrl[url].singles.slice();

			if (appsByUrl[url].batch.length) {
				urlApps.push(appsByUrl[url].batch);
			}

			numRequests += urlApps.length;

			_.each(urlApps, function(apps) {
				if (!_.isArray(apps)) {
					apps = [apps];
				}

				// Get the configs for this request
				var urlConfigs = _.map(apps, function(app) {
					return app.appConfig;
				});

				var xhr = Ajax({
					complete: function() {
						if (!--numRequests) {
							var manifests = combineAppManifests(appManifests);

							// Put the manifest files on the page
							loadStaticFiles(containerConfig, manifests.styles, manifests.scripts, manifests.inlineScripts, function() {
								callback();
							});
						}
					},
					data: {
						params: JSON.stringify(urlConfigs)
					},
					success: function(manifest) {
						// Make sure the appManifest is valid
						if (!F2.prototype.validate.call(this, manifest, 'appManifest')) {
							manifest = {
								apps: []
							};

							// Make some fake appContent
							_.each(urlConfigs, function() {
								manifest.apps.push({
									success: false
								});
							});
						}

						// Map the AppContent back to the app data
						_.each(manifest.apps, function(appContent, i) {
							apps[i].appContent = appContent;

							// Set the root if applicable
							if (appContent.html) {
								var fakeParent = document.createElement('div');
								fakeParent.innerHTML = appContent.html;
								apps[i].root = fakeParent.firstChild;
							}
						});

						appManifests.push(manifest);
					},
					type: 'json',
					url: url
				});

				xhrByUrl[url] = {
					apps: apps,
					request: xhr
				};
			});
		}

		return xhrByUrl;
	}

	function combineAppManifests(manifests) {
		var combined = {
			apps: [],
			inlineScripts: [],
			scripts: [],
			styles: []
		};

		for (var i = 0, iLen = manifests.length; i < iLen; i++) {
			for (var prop in combined) {
				for (var x = 0, xLen = manifests[i][prop].length; x < xLen; x++) {
					combined[prop].push(manifests[i][prop][x]);
				}
			}
		}

		return combined;
	}

	function loadStaticFiles(containerConfig, styles, scripts, inlineScripts, callback) {
		var stylesDone = false;
		var scriptsDone = false;

		// See if both scripts and styles have completed
		function checkComplete() {
			if (stylesDone && scriptsDone) {
				callback();
			}
		}

		// Kick off styles
		loadStyles(containerConfig, styles, function() {
			stylesDone = true;
			checkComplete();
		});

		// Kick off scripts
		loadScripts(containerConfig, scripts, function() {
			loadInlineScripts(inlineScripts, function() {
				scriptsDone = true;
				checkComplete();
			});
		});
	}

	function loadInlineScripts(inlines, callback) {
		if (inlines.length) {
			try {
				eval(inlines.join(';'));
			}
			catch (e) {
				console.error('Error loading inline scripts: ' + e);
			}
		}

		callback();
	}

	function loadScripts(config, paths, callback) {
		// Check for user defined loader
		if (_.isFunction(config.loadScripts)) {
			config.loadScripts(paths, callback);
		}
		else {
			require(paths, function() {
				callback();
			});
		}
	}

	function loadStyles(config, paths, callback) {
		// Check for user defined loader
		if (_.isFunction(config.loadStyles)) {
			config.loadStyles(paths, callback);
		}
		else {
			var head = document.getElementsByTagName('head')[0];

			for (var i = 0, len = paths.length; i < len; i++) {
				var node = document.createNode('link');
				node.rel = 'stylesheet';
				node.href = paths[i];
				node.async = false;
				head.appendChild(node);
			}

			callback();
		}
	}

	// ---------------------------------------------------------------------------
	// API
	// ---------------------------------------------------------------------------

	Helpers.LoadApps = {
		isInFlightInstanceId: function(instanceId) {
			return inFlightInstanceIds[instanceId];
		},
		getInstance: function(identifier) {
			var instance;

			// Treat as root
			if (identifier.nodeType === 1) {
				for (var id in appInstances) {
					if (appInstances[id].root === identifier) {
						instance = appInstances[id];
						break;
					}
				}
			}
			else if (_.isString(identifier)) {
				// Treat as instanceId
				instance = appInstances[identifier];
			}
			else {
				// Look for instance directly
				for (var id2 in appInstances) {
					if (appInstances[id2].instance === identifier) {
						instance = appInstances[id2].instance;
						break;
					}
				}
			}

			return instance;
		},
		addLoadListener: function(instanceId, callback) {
			if (!loadListeners[instanceId]) {
				loadListeners[instanceId] = [];
			}

			loadListeners[instanceId].push(callback);
		},
		load: loadApps,
		remove: function(instanceId) {
			appInstances[instanceId] = undefined;
		}
	};

})(Helpers.Ajax, Helpers._, Helpers.Guid);
