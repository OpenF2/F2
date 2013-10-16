define('F2', ['F2.Schemas', 'F2.Events'], function(Schemas, Events) {

	// ---------------------------------------------------------------------------
	// Private Storage
	// ---------------------------------------------------------------------------

	// Set up a default config
	var _config = {
		debugMode: false,
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
			showMask: null,
			hideMask: null
		}
	};

	// Track all the guids we've made on this page
	var _guids = {};

	// ---------------------------------------------------------------------------
	// API
	// ---------------------------------------------------------------------------

	return {
		Apps: {},
		config: function(config) {
			if (config && Schemas.validate(config, 'containerConfig')) {
				_.extend(_config, config);
			}

			return _config;
		},
		/**
			* Generates an RFC4122 v4 compliant id
			* @method guid
			* @return {string} A random id
			* @for F2
			* Derived from: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript#answer-2117523
			*/
		guid: function _guid() {
			var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0;
				var v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});


			// Check if we've seen this one before
			if (_guids[guid]) {
				// Get a new guid
				guid = _guid();
			}

			_guids[guid] = true;

			return guid;
		},
		load: function(params) {
			if (!params.appConfigs || (_.isArray(params.appConfigs) && !params.appConfigs.length)) {
				throw 'F2: you must specify at least one AppConfig to load';
			}
			else if (!_.isArray(params.appConfigs)) {
				params.appConfigs = [params.appConfigs];
			}

			Helpers.apps.load(params.appConfigs, params.success, params.error, params.complete);
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

			var instance = Helpers.apps.getInstance(identifier);

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
				Helpers.apps.remove(instance.instanceId);
			}
			else {
				console.warn('F2: could not find an app to remove');
			}
		}
	};

});