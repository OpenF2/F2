/**
 * F2 Core
 * @class F2
 */
(function(LoadApps, _, _Guid, AppPlaceholders) {

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
	var Config = function(ContainerToken, config) {

		if(_.isNullOrUndefined(ContainerToken) && _.isNullOrUndefined(config)) {
			return _config;
		}

		if(!_Guid.isTrackedGuid(ContainerToken)) {
			console.error('F2: Only the container can modify F2.');
			return null;
		}

		var isSettable = function(obj, propName) {
			return _.isNullOrUndefined(obj, propName) || _.isFunction(obj[propName]);
		};
		if (_.isObject(config)) {
			if (isSettable(config, 'loadDependencies')) {
				_config.loadDependencies = config.loadDependencies;
			}

			if (isSettable(config, 'loadInlineScripts')) {
				_config.loadInlineScripts = config.loadInlineScripts;
			}

			if (isSettable(config, 'loadScripts')) {
				_config.loadScripts = config.loadScripts;
			}

			if (isSettable(config, 'loadStyles')) {
				_config.loadStyles = config.loadStyles;
			}

			if (_.isObject(config.ui)) {
				if (!_config.ui) {
					_config.ui = {};
				}

				if (isSettable(config.ui, 'modal')) {
					_config.ui.modal = config.ui.modal;
				}

				if (isSettable(config.ui, 'toggleLoading')) {
					_config.ui.toggleLoading = config.ui.toggleLoading;
				}
			}
		}

		return _config;
	};

	Object.defineProperty(F2.prototype, 'config', {
		value : Config,
		writable : false,
		configurable : false
	});

	/**
	 * Generates an RFC4122 v4 compliant id
	 * @method guid
	 * @return {string} A random id
	 * @for F2
	 * Derived from: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript#answer-2117523
	 */
	var Guid = function() {
		return _Guid.guid();
	};

	Object.defineProperty(F2.prototype, 'guid', {
		value : Guid,
		writable : false,
		configurable : false
	});

	var Load = function(appConfigs, callback) {
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

	Object.defineProperty(F2.prototype, 'load', {
		value : Load,
		writable : false,
		configurable : false
	});

	var LoadPlaceholders = function(parentNode, callback) {
		// Default to the body if no node was passed
		if (!parentNode || !_.isNode(parentNode)) {
			parentNode = document.body;
		}

		if (!callback || (!_.isFunction(callback))) {
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
				manifests.forEach(function(manifest, i) {
					if (!manifest.error && !placeholders[i].isPreload) {
						placeholders[i].node.parentNode.replaceChild(
							manifest.root,
							placeholders[i].node
						);
					}
				});

				callback(manifests);
			});
		}
		else {
			console.warn('F2: no placeholders were found inside', parentNode);
			callback([]);
		}
	};

	Object.defineProperty(F2.prototype, 'loadPlaceholders', {
		value : LoadPlaceholders,
		writable : false,
		configurable : false
	});

	var New = function(params) {
		// Wrap up the output in a function to prevent prototype tampering
		return (function(params) {
			return new F2(params);
		})();
	};

	Object.defineProperty(F2.prototype, 'new', {
		value : New,
		writable : false,
		configurable : false
	});

	var OnetimeToken = function() {
		/*
		* When doing a property lookup, the lookup chain first looks at
		* properties on the object, then properties on the object's 
		* prototype. The first time "onetimeToken" gets invoked the F2
		* object, it does not have the property on itself, but rather on
		* its prototype; the prototypical version gets run. The prototype
		* then adds a version onto the instantiated object that subsequent
		* calls will hit first in the lookup chain. That new instantiated 
		* version throws the error.
		*/
		if(!this.hasOwnProperty('onetimeToken')) {
			Object.defineProperty(this, 'onetimeToken', { 
				value : tokenKiller,
				writable : false,
				configurable : false
			});
		}
		
		return _Guid.trackedGuid();
	};

	Object.defineProperty(F2.prototype, 'onetimeToken', {
		value : OnetimeToken,
		writable : false,
		configurable : false
	});

	/**
	 * Removes an app from the container
	 * @method remove
	 * @param {string} indentifiers Array of app instanceIds or roots to be removed
	 */
	var Unload = function(identifiers) {
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
				if (!_.isNullOrUndefined(loaded.instance, 'dispose')) {
					if( _.isFunction(loaded.instance.dispose)) {
						loaded.instance.dispose();
					}
					else {
						console.warn('F2: ' + loaded.appConfig.appId + '\'s dispose is not a function and will not be called.');
					}
				}

				// Automatically pull off events
				this.off(loaded.instance);

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

	Object.defineProperty(F2.prototype, 'unload', {
		value : Unload,
		writable : false,
		configurable : false
	});

})(Helpers.LoadApps, Helpers._, Helpers.Guid, Helpers.AppPlaceholders);
