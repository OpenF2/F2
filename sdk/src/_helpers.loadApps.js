require(['F2'], function(F2) {

	// Track which legacy apps we've had to wrap in AMD
	var _appIdsWrappedInAmd = {};

	function _getAppClasses(appIds, cb) {
		// Check for the legacy method of registering apps
		for (var i = 0, len = appIds.length; i < len; i++) {
			if (F2.Apps[appIds[i]] && !_appIdsWrappedInAmd[appIds[i]]) {
				define(appIds[i], [], function() {
					return F2.Apps[appIds[i]];
				});

				_appIdsWrappedInAmd[appIds[i]] = true;
			}
		}

		// Use require to pull the classes
		require(appIds, function(/* appClass1, appClass2 */) {
			var appClasses = Array.prototype.slice.call(arguments);
			cb(appClasses);
		});
	}

	function _initApps(responseData, cb) {
		var appIds = [];

		// Gather up the appIds
		for (var i = 0, len = responseData.length; i < len; i++) {
			appIds.push(responseData[i].appConfig.appId);
		}

		if (appIds.length) {
			_getAppClasses(appIds, function(appClasses) {
				var instances = [];

				// Instantiate the app classes
				for (var i = 0, len = responseData.length; i < len; i++) {
					if (!responseData[i].appContent) {
						responseData[i].appContent = {};
					}

					try {
						// Initialize the app
						var instance = new appClasses[i](
							responseData[i].instanceId,
							responseData[i].appConfig,
							responseData[i].appContent.data || {},
							responseData[i].root
						);

						if (instance.init) {
							instance.init();
						}

						instances.push(instance);
					}
					catch (e) {
						console.error('F2: could not init', appIds[i], '" + e + "');
					}
				}

				cb(instances);
			});
		}
	}

	function _loadInlineScripts(inlines) {
		// Load the inline scripts
		try {
			eval(inlines.join(';'));
		}
		catch (e) {
			console.error('Error loading inline scripts: ' + e);
		}
	}

	function _loadScripts(config, paths, inlines, callback) {
		// Check for user defined loader
		if (_.isFunction(config.loadScripts)) {
			config.loadScripts(paths, inlines, callback);
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

	function _loadStyles(config, paths, callback) {
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

	function _combineAppManifests(manifests) {
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

	_helpers.loadApps = function(appConfigs, appManifests, successFn, errorFn, completeFn, cb) {
		if (appManifests && appManifests.length) {
			// Refresh the container config
			var config = F2.config();

			// Combine all the valid responses
			var combinedManifest = _combineAppManifests(appManifests);

			// Turn all the app data into a useful object
			var responseData = _coalesceAppData(appConfigs, combinedManifest.apps);

			_loadStyles(config, combinedManifest.styles, function() {
				// Let the container add the html to the page
				// Get back an obj keyed by AppId that contains the root and instanceId
				if (successFn) {
					successFn.apply(window, responseData);
				}

				if (completeFn) {
					completeFn();
				}

				// Add the scripts and, once finished, instantiate the app classes
				_loadScripts(config, combinedManifest.scripts, combinedManifest.inlineScripts, function() {
					_initApps(responseData, cb);
				});
			});
		}
	};

});