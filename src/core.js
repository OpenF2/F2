/**
 * F2 Core
 * @class F2
 */
(function(LoadApps, _, Guid, AppPlaceholders) {

	// Set up a default config
	var _config = {
		loadDependencies: null,
		loadInlineScripts: null,
		loadScripts: null,
		loadStyles: null,
		ui: {
			modal: null,
			toggleLoading: null
		}
	};

	function tokenKiller() {
		throw 'F2: onetime token has already been used.';
	}

	// --------------------------------------------------------------------------
	// API
	// --------------------------------------------------------------------------

	F2.prototype.config = function(config) {
		if (config && this.validate(config, 'containerConfig')) {
			_config = _.defaults({}, config, _config);
		}

		return _config;
	};

	/**
	 * Generates an RFC4122 v4 compliant id
	 * @method guid
	 * @return {string} A random id
	 * @for F2
	 * Derived from: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript#answer-2117523
	 */
	F2.prototype.guid = function() {
		return Guid.guid();
	};

	F2.prototype.load = function(appConfigs, callback) {
		if (!_.isArray(appConfigs) || !appConfigs.length) {
			throw 'F2: no appConfigs passed to "load"';
		}

		if (!_.isFunction(callback)) {
			callback = noop;
		}

		// Kill the token if it hasn't been called
		// This should prevent apps from pretending to be the container
		if (this.onetimeToken !== tokenKiller) {
			this.onetimeToken();
		}

		// Request all the apps and get the xhr objects so we can abort
		var requests = LoadApps.load(this.config(), appConfigs, callback);

		return {
			abort: function() {
				for (var i = 0; i < this.requests.length; i++) {
					this.requests[i].xhr.abort();
				}
			},
			requests: requests || []
		};
	};

	F2.prototype.loadPlaceholders = function(parentNode, callback) {
		// Default to the body if no node was passed
		if (!parentNode || !parentNode.nodeType || parentNode.nodeType !== 1) {
			parentNode = document.body;
		}

		if (!callback || (callback && !_.isFunction(callback))) {
			callback = noop;
		}

		// Find the placeholders on the DOM
		var placeholders = AppPlaceholders.getInNode(parentNode);

		if (placeholders.length) {
			var appConfigs = placeholders.map(function(placeholder) {
				placeholder.appConfig.isPreload = placeholder.isPreload;
				placeholder.appConfig.root = placeholder.node;
				return placeholder.appConfig;
			});

			this.load(appConfigs, function(manifests) {
				for (var i = 0, len = manifests.length; i < len; i++) {
					if (!manifests[i].error && !placeholders[i].isPreload) {
						placeholders[i].node.parentNode.replaceChild(
							manifests[i].root,
							placeholders[i].node
						);
					}
				}

				callback(manifests);
			});
		}
		else {
			callback([]);
		}
	};

	F2.prototype.new = function(params) {
		// Wrap up the output in a function to prevent prototype tampering
		return (function(params) {
			return new F2(params);
		})();
	};

	F2.prototype.onetimeToken = function() {
		this.onetimeToken = tokenKiller;

		return Guid.trackedGuid();
	};

	/**
	 * Removes an app from the container
	 * @method remove
	 * @param {string} indentifiers Array of app instanceIds or roots to be removed
	 */
	F2.prototype.remove = function(identifiers) {
		var args = Array.prototype.slice.apply(arguments);

		// See if multiple parameters were passed
		if (args.length > 1) {
			identifiers = args;
		}
		else {
			identifiers = [].concat(identifiers);
		}

		for (var i = 0; i < identifiers.length; i++) {
			var identifier = identifiers[i];

			if (!identifier) {
				throw 'F2: you must provide an instanceId, root, or app instance to remove an app';
			}

			// See if this an another reference to an existing app
			// If so, switch to that for a more reliable lookup
			if (identifier.instanceId) {
				identifier = identifier.instanceId;
			}

			// Try to find the app in our internal cache
			var loaded = LoadApps.getLoadedApp(identifier);

			if (loaded && loaded.instanceId) {
				// Call the app's dipose method if it has one
				if (loaded.instance.dispose) {
					loaded.instance.dispose();
				}

				// Automatically pull off events
				this.Events.off(loaded.instance);

				// Remove ourselves from the DOM
				if (loaded.root && loaded.root.parentNode) {
					loaded.root.parentNode.removeChild(loaded.root);
				}

				// Remove ourselves from the internal map
				LoadApps.remove(loaded.instanceId);
			}
			else {
				console.warn('F2: could not find an app to remove');
			}
		}
	};

})(Helpers.LoadApps, Helpers._, Helpers.Guid, Helpers.AppPlaceholders);
