/**
 * F2 Core
 * @class F2
 */
(function(LoadApps, _, Events, Guid, AppPlaceholders) {

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

	Library.config = function(config) {
		if (config && Library.validate(config, 'containerConfig')) {
			_config = _.defaults({}, config, _config);
		}

		return _config;
	};

	Library.guid = function() {
		return Guid();
	};

	Library.load = function(params) {
		if (!params) {
			throw 'F2: no params passed to "load"';
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

	Library.loadPlaceholders = function(parentNode) {
		if (!parentNode || !parentNode.nodeType || parentNode.nodeType !== 1) {
			parentNode = document.body;
		}

		// Find the placeholders on the DOM
		var placeholders = AppPlaceholders.getInNode(parentNode);

		if (placeholders.length) {
			var appConfigs = _.map(placeholders, function(placeholder) {
				if (placeholder.isPreload) {
					placeholder.appConfig.root = placeholder.node;
				}

				return placeholder.appConfig;
			});

			Library.load({
				appConfigs: appConfigs,
				success: function() {
					var args = Array.prototype.slice.call(arguments);

					// Add to the DOM
					for (var i = 0, len = args.length; i < len; i++) {
						if (!placeholders[i].isPreload) {
							placeholders[i].node.parentNode.replaceChild(args[i].root, placeholders[i].node);
						}
					}
				}
			});
		}
	};

	/**
	 * Removes an app from the container
	 * @method remove
	 * @param {string} indentifiers Array of app instanceIds or roots to be removed
	 */
	Library.remove = function(identifiers) {
		var args = Array.prototype.slice.apply(arguments);

		// See if multiple parameters were passed
		if (args.length > 1) {
			identifiers = args;
		}
		else {
			identifiers = [].concat(identifiers);
		}

		_.each(identifiers, function(identifier) {
			if (!identifier) {
				throw 'F2: you must provide an instanceId or a root to remove an app';
			}

			// Try to find the app in our internal cache
			var instance = LoadApps.getInstance(identifier);

			if (instance && instance.instanceId) {
				// Call the app's dipose method if it has one
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
				LoadApps.remove(instance.instanceId);
			}
			else {
				console.warn('F2: could not find an app to remove');
			}
		});
	};

})(Helpers.LoadApps, Helpers._, Library.Events, Helpers.Guid, Helpers.AppPlaceholders);
