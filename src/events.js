/**
 * Handles context passing
 * @class F2.Events
 */
(function(_, LoadApps, Guid) {

	var _subs = {};

	function appMatchesPattern(app, filters) {
		for (var i = 0; i < filters.length; i++) {
			// See if it's a straight wildcard
			if (filters[i] === '*') {
				return true;
			}

			// Check exact instanceId or appId match
			if (app.instanceId === filters[i] || app.appConfig.appId === filters[i]) {
				return true;
			}

			// Pattern match
			var pattern = new RegExp(filters[i], 'gi');

			if (pattern.test(app.appConfig.appId)) {
				return true;
			}
		}

		return false;
	}

	// ---------------------------------------------------------------------------
	// Utils
	// ---------------------------------------------------------------------------

	function _send(name, args, filters) {
		if (!name || !_.isString(name)) {
			throw new TypeError('F2: ' +
				'You need to provide an event name to emit.'
			);
		}

		if (filters && _.isArray(filters) && !filters.every(_.isString)) {
			throw new TypeError('F2: ' +
				'Your "emit" filters must either be an AppId or an InstanceId.'
			);
		}

		if (_subs[name]) {
			for (var i = 0; i < _subs[name].length; i++) {
				var sub = _subs[name][i];

				if (!filters || appMatchesPattern(sub.instance, filters)) {
					sub.handler.apply(sub.instance, args);
				}

				// See if this is limited to a # of executions
				if (sub.timesLeft !== undefined && --sub.timesLeft === 0) {
					_subs[name].splice(i--, 1);
				}
			}

			// Clear out the list if there's no one left
			if (!_subs[name].length) {
				delete _subs[name];
			}
		}
	}

	function _subscribe(instance, name, handler, timesToListen) {
		var instanceIsBeingLoaded = (instance && LoadApps.isRealInstanceId(instance.instanceId));

		if (!instance) {
			throw new TypeError('F2: ' +
				'Your "instance" must be an app loaded via F2 or the container token.'
			);
		}
		else if (!instanceIsBeingLoaded) {
			var instanceIsApp = LoadApps.isLoadedApp(instance);
			var instanceIsToken = Guid.isTrackedGuid(instance);

			if (!instanceIsApp && !instanceIsToken) {
				throw new TypeError('F2: ' +
					'Your "instance" must be an app loaded via F2 or the container token.'
				);
			}
		}

		if (!_.isString(name)) {
			throw new TypeError('F2: ' +
				'You must provide a "name" string of the event to which you\'re subscribing.'
			);
		}

		if (!_.isFunction(handler)) {
			throw new TypeError('F2: ' +
				'You must provide a "handler" function that will be called when your event is fired.'
			);
		}

		if (timesToListen !== undefined && isNaN(timesToListen) || timesToListen < 1) {
			throw new TypeError('F2: ' +
				'If passed, "timesToListen" must be a number greater than 0.'
			);
		}

		// Create the event if we haven't seen it
		if (!_subs[name]) {
			_subs[name] = [];
		}

		if (!instanceIsBeingLoaded) {
			_subs[name].push({
				handler: handler,
				instance: instance,
				timesLeft: timesToListen
			});
		}
		else {
			// Wait for LoadApps to tell us that this app has been loaded
			LoadApps.addLoadListener(instance.instanceId, function(instance) {
				_subscribe(instance, name, handler, timesToListen);
			});
		}
	}

	function _unsubscribe(instance, name, handler) {
		var handlerIsValid = (handler && _.isFunction(handler));
		var instanceIsValid = (instance && (LoadApps.isLoadedApp(instance) || Guid.isTrackedGuid(instance)));

		var _i, matchesInstance, matchesHandler, namedSubs;

		if (!handlerIsValid && !instanceIsValid) {
			throw new TypeError('F2: ' +
				'The "off" function requires an app instance, InstanceId, or the container token'
			);
		}

		if (name && !_.isString(name)) {
			throw new TypeError('F2: ' +
				'If passed, "name" must be a string.'
			);
		}

		// Create a local reference to reduce access time:
		// http://oreilly.com/server-administration/excerpts/even-faster-websites/writing-efficient-javascript.html
		namedSubs = _subs[name];
		if (name && namedSubs) {
			// Start from the end to reduce index unnecessary index shifting
			for (_i = namedSubs.length - 1; _i >= 0; --_i) {
				matchesInstance = namedSubs[_i].instance === instance;
				matchesHandler = namedSubs[_i].handler === handler;

				if (matchesInstance &&
					(!handlerIsValid) ||
					(handlerIsValid && matchesHandler)
				) {
					namedSubs.splice(_i, 1);
				}	
			}
			// Do some garbage collection, otherwise the
			// subs object only grows and lookups take forever
			if (namedSubs.length === 0) {
				delete _subs[name];
			}
		}
		else {
			for (var event in _subs) {
				_unsubscribe(instance, event, handler);
			}
		}
	}

	// ---------------------------------------------------------------------------
	// API
	// ---------------------------------------------------------------------------

	/**
	 *
	 * @method emit
	 * @param {String} name The event name
	 * @return void
	 */
	var _prototype_emit = function(filters, name) {
		var args = Array.prototype.slice.call(arguments, 2);

		// If "filters" is a string then the user didn't actually pass any
		// "filters" will be "name" and "name" will be the first param to the handler
		if (_.isString(filters)) {
			// Reassign the params
			name = filters;
			// Provide a default filter set
			filters = ['*'];
			// Recalculate the N-args
			args = Array.prototype.slice.call(arguments, 1);
		}

		return _send(name, args, filters);
	};

	Object.defineProperty(F2.prototype, 'emit', {
		value : _prototype_emit,
		writable : false,
		configurable : false
	});

	/**
	 *
	 * @method off
	 * @param {String} name The event name
	 * @param {Function} handler Function to handle the event
	 * @return void
	 */
	var _prototype_off = function(instance, name, handler) {
		_unsubscribe(instance, name, handler);
	};

	Object.defineProperty(F2.prototype, 'off', {
		value : _prototype_off,
		writable : false,
		configurable : false
	});

	/**
	 *
	 * @method on
	 * @param {String} name The event name
	 * @param {Function} handler Function to handle the event
	 * @return void
	 */
	var _prototype_on = function(instance, name, handler, timesToListen) {
		_subscribe(instance, name, handler, timesToListen);
	};

	Object.defineProperty(F2.prototype, 'on', {
		value : _prototype_on,
		writable : false,
		configurable : false
	});


})(Helpers._, Helpers.LoadApps, Helpers.Guid);
