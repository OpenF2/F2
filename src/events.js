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
			throw 'F2.Events: you must provide an event name to emit.';
		}

		if (!filters) {
			throw 'F2.Events: you must provide an array of filters.';
		}

		if (!_.isArray(filters)) {
			filters = [filters];
		}

		if (_subs[name]) {
			var len = _subs[name].length;

			while (len--) {
				var sub = _subs[name][len];
				// Strip out the bogus filters
				filters = filters.filter(function(filter) {
					return !!filter;
				});

				if (!filters || appMatchesPattern(sub.instance, filters)) {
					sub.handler.call(sub.instance, args);
				}

				// See if this is limited to a # of executions
				if (sub.timesLeft !== undefined && --sub.timesLeft === 0) {
					_subs[name].splice(len, 1);
				}
			}
		}
	}

	function _subscribe(instance, name, handler, timesToListen) {
		var instanceIsBeingLoaded = (instance && LoadApps.isRealInstanceId(instance.instanceId));

		if (!instance) {
			throw 'F2.Events: you must provide an app instance or container token.';
		}
		else if (!instanceIsBeingLoaded) {
			var instanceIsApp = LoadApps.isLoadedApp(instance);
			var instanceIsToken = Guid.isTrackedGuid(instance);

			if (!instanceIsApp && !instanceIsToken) {
				throw 'F2.Events: "instance" must be an app instance or a container token.';
			}
		}

		if (!name) {
			throw 'F2.Events: you must provide an event name.';
		}

		if (!handler) {
			throw 'F2.Events: you must provide an event handler.';
		}

		if (timesToListen !== undefined && isNaN(timesToListen) || timesToListen < 1) {
			throw 'F2.Events: "timesToListen" must be a number greater than 0.';
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
			throw 'F2.Events: "off" requires at least an instance or handler.';
		}

		if (name && !_.isString(name)) {
			throw 'F2.Events: "name" must be a string if it is passed';
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
				// Do some garbage collection, otherwise the
				// subs object only grows and lookups take forever
				if (namedSubs.length === 0) {
					delete _subs[name];
				}
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
	F2.prototype.emit = function(name, args, filters) {
		filters = filters || ['*'];
		return _send(name, args, filters);
	};

	/**
	 *
	 * @method off
	 * @param {String} name The event name
	 * @param {Function} handler Function to handle the event
	 * @return void
	 */
	F2.prototype.off = function(instance, name, handler) {
		_unsubscribe(instance, name, handler);
	};

	/**
	 *
	 * @method on
	 * @param {String} name The event name
	 * @param {Function} handler Function to handle the event
	 * @return void
	 */
	F2.prototype.on = function(instance, name, handler, timesToListen) {
		_subscribe(instance, name, handler, timesToListen);
	};

})(Helpers._, Helpers.LoadApps, Helpers.Guid);
