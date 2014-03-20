Lib.Core = function(LoadApps, _, Schemas, Events, Guid) {

	// --------------------------------------------------------------------------
	// Private Storage
	// --------------------------------------------------------------------------

	// Set up a default config
	var _config = {
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
			showLoading: null,
			hideLoading: null
		}
	};

	// --------------------------------------------------------------------------
	// API
	// --------------------------------------------------------------------------

	return {
		config: function(config) {
			if (config && Schemas.validate(config, 'containerConfig')) {
				_config = _.defaults({}, config, _config);
			}

			return _config;
		},
		guid: Guid,
		load: function(params) {
			if (!params.appConfigs || (_.isArray(params.appConfigs) && !params.appConfigs.length)) {
				throw 'F2: you must specify at least one AppConfig to load';
			}
			else if (!_.isArray(params.appConfigs)) {
				params.appConfigs = [params.appConfigs];
			}

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
		}
	};

};
