define('F2._Helpers.Apps', ['require', 'F2', 'F2.Schemas', 'F2._Helpers.Ajax'], function(require, F2, Schemas, __Ajax__) {
console.log('loadApps.js');
	// ---------------------------------------------------------------------------
	// Private storage
	// ---------------------------------------------------------------------------

	var appInstances = {};
	var Helpers = {
		Ajax: __Ajax__
	};

	// ---------------------------------------------------------------------------
	// Methods
	// ---------------------------------------------------------------------------

	function remove(instanceId) {
		delete appInstances[instanceId];
	}

	function loadApps(appConfigs, successFn, errorFn, completeFn) {
		// Params used to instantiate AppClasses
		var allApps = [];
		// Track which apps need to hit the server
		var asyncApps = [];

		for (var i = 0, len = appConfigs.length; i < len; i++) {
			var inputs = {
				order: i
			};

			// The AppConfig must be valid
			if (appConfigs[i] && Schemas.validate(appConfigs[i], 'appConfig')) {
				inputs.instanceId = require('F2').guid();
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

		// See if we need to hit the server
		if (asyncApps.length) {
			requestApps(asyncApps, function(styles, scripts, inlineScripts) {
				delegateHtmlLoading(allApps, successFn, completeFn);
			});
		}
		else {
			delegateHtmlLoading(allApps, successFn, completeFn);
		}
	}

	// Pass the apps off to the container so they can place them on the page
	function delegateHtmlLoading(allApps, successFn, completeFn) {
		if (successFn) {
			successFn.apply(window, allApps);
		}

		initAppClasses(allApps, completeFn);
	}

	// Instantiate each app class in the order their appConfigs were initially specified
	function initAppClasses(allApps, completeFn) {
		var appIds = _.map(allApps, function(app) {
			return app.appConfig.appId;
		});

		require(appIds, function() {
			var appClasses = Array.prototype.slice.apply(arguments);

			// Load each AppClass
			for (var i = 0, len = allApps.length; i < len; i++) {
				try {
					var instance = new appClasses[i](
						allApps[i].instanceId,
						allApps[i].appConfig,
						allApps[i].appContent.data || {},
						allApps[i].root
					);

					if (instance.init) {
						instance.init();
					}

					appInstances[allApps[i].instanceId] = instance;
				}
				catch (e) {
					console.error('F2: could not init', allApps[i].appConfig.appId, '"' + e.toString() + '"');
				}
			}

			// Finally tell the container that we're all finished
			if (completeFn) {
				completeFn();
			}
		});
	}

	// Set the 'root' and 'appContent' for each input by hitting the server
	function requestApps(asyncApps, callback) {
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

				Helpers.Ajax({
					complete: function() {
						if (!--numRequests) {
							var manifests = combineAppManifests(appManifests);

							// Put the manifest files on the page
							loadStaticFiles(manifests.styles, manifests.scripts, manifests.inlineScripts, function() {
								callback();
							});
						}
					},
					data: {
						params: JSON.stringify(urlConfigs)
					},
					success: function(manifest) {
						if (!Schemas.validate(manifest, 'appManifest')) {
							manifest = {
								apps: []
							};

							// Make some fake appContent
							_.each(urlConfigs, function() {
								manifest.apps.push({ success: false });
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
			});
		}
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

	function loadStaticFiles(styles, scripts, inlineScripts, callback) {
		var containerConfig = require('F2').config();
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
		loadScripts(containerConfig, scripts, inlineScripts, function() {
			scriptsDone = true;
			checkComplete();
		});
	}

	function loadInlineScripts(inlines) {
		// Load the inline scripts
		try {
			eval(inlines.join(';'));
		}
		catch (e) {
			console.error('Error loading inline scripts: ' + e);
		}
	}

	function loadScripts(config, paths, inlines, callback) {
		// Check for user defined loader
		if (_.isFunction(config.loadScripts)) {
			config.loadScripts(paths, inlines, callback);
		}
		else if (paths.length) {
			LazyLoad.js(paths, function() {
				loadInlineScripts(inlines);
				callback();
			});
		}
		else if (inlines.length) {
			loadInlineScripts(inlines);
		}
		else {
			callback();
		}
	}

	function loadStyles(config, paths, callback) {
		// Check for user defined loader
		if (_.isFunction(config.loadStyles)) {
			config.loadStyles(paths, callback);
		}
		else if (paths.length) {
			LazyLoad.css(paths, callback);
		}
		else {
			callback();
		}
	}

	// ---------------------------------------------------------------------------
	// API
	// ---------------------------------------------------------------------------

	return {
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
			else {
				// Treat as instanceId
				instance = appInstances[identifier];
			}

			return instance;
		},
		load: loadApps,
		remove: remove
	};

});