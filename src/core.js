/**
 * F2 Core
 * @class F2
 */
(function(LoadApps, _, Guid, AppPlaceholders) {

	// Set up a default config
	var _config = {
		loadInlineScripts: null,
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
			toggleLoading: null
		}
	};

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

	F2.prototype.load = function(params) {
		if (!params) {
			throw 'F2: no params passed to "load"';
		}

		// Kill the token if it hasn't been called
		// This should prevent apps from pretending to be the container
		if (!Guid.getOnetimeGuid()) {
			Guid.onetimeGuid();
		}

		// Default to an array
		params.appConfigs = [].concat(params.appConfigs || []);

		if (!params.appConfigs.length) {
			throw 'F2: you must specify at least one AppConfig to load';
		}

		// Request all the apps and get the xhr objects so we can abort
		var reqs = LoadApps.load(
			this.config(),
			params.appConfigs,
			params.success,
			params.error,
			params.complete,
			params.afterRequest
		);

		return {
			abort: (function() {
				if (reqs) {
					for (var url in reqs) {
						reqs[url].request.abort();
					}
				}
			}),
			requests: reqs
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

		var self = this;

		// Find the placeholders on the DOM
		var placeholders = AppPlaceholders.getInNode(parentNode);

		if (placeholders.length) {
			var appConfigs = _.map(placeholders, function(placeholder) {
				if (placeholder.isPreload) {
					placeholder.appConfig.root = placeholder.node;
				}

				return placeholder.appConfig;
			});

			(function() {
				var manifests;

				self.load({
					appConfigs: appConfigs,
					success: function() {
						manifests = Array.prototype.slice.call(arguments);

						// Add to the DOM
						for (var i = 0, len = manifests.length; i < len; i++) {
							if (!placeholders[i].isPreload) {
								placeholders[i].node.parentNode.replaceChild(
									manifests[i].root,
									placeholders[i].node
								);
							}
						}
					},
					complete: function() {
						callback.call(window, manifests);
					}
				});
			})();
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
		return Guid.onetimeGuid();
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
				throw 'F2: you must provide an instanceId or a root to remove an app';
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
