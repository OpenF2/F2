/**
 * Handles context passing
 * @class F2.Events
 */
(function(_, LoadApps, Guid) {

	var _subs = {};

	function appMatchesPattern(app, filters) {
		for (var i = 0, len = filters.length; i < len; i++) {
			// Check exact instanceId or appId match
			if (app.instanceId === filters[i] || app.appId === filters[i]) {
				return true;
			}

			// Pattern match
			var pattern = new RegExp(filters[i], 'gi');

			if (pattern.test(app.appId)) {
				return true;
			}
		}

		return false;
	}

	// ---------------------------------------------------------------------------
	// Utils
	// ---------------------------------------------------------------------------

	function _send(name, filters, args) {
		if (!name || !_.isString(name)) {
			throw 'F2.Events: you must provide an event name to emit.';
		}

		if (!filters || !_.isArray(filters)) {
			filters = [].concat(filters || []);
		}

		if (_subs[name]) {
			var len = _subs[name].length;

			while (len--) {
				var sub = _subs[name][len];
				// Strip out the bogus filters
				filters = _.filter(filters, function(filter) {
					return !!filter;
				});

				if (!filters.length || (filters.length && appMatchesPattern(sub.instance, filters))) {
					sub.handler.apply(sub.instance, args);
				}

				// See if this is limited to a # of executions
				if (sub.timesLeft !== undefined && --sub.timesLeft === 0) {
					_subs[name].splice(len, 1);
				}
			}
		}
	}

	function _subscribe(instance, name, handler, timesToListen) {
		var instanceIsBeingLoaded = (instance && LoadApps.isInFlightInstanceId(instance.instanceId));

		if (!instance) {
			throw 'F2.Events: you must provide an app instance or container token.';
		}
		else if (!instanceIsBeingLoaded) {
			var instanceIsApp = (!!LoadApps.getInstance(instance));
			var instanceIsToken = (instance === Guid.getOnetimeGuid());

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
		var instanceIsValid = (instance && !!LoadApps.getInstance(instance));

		if (!handlerIsValid && !instanceIsValid) {
			throw 'F2.Events: "off" requires at least an instance or handler.';
		}

		if (name && !_.isString(name)) {
			throw 'F2.Events: "name" must be a string if it is passed';
		}

		if (name && _subs[name]) {
			for (var i = 0; i < _subs[name].length; i++) {
				var matchesInstance = _subs[name][i].instance === instance;
				var matchesHandler = _subs[name][i].handler === handler;

				if (matchesInstance || matchesHandler) {
					_subs[name].splice(i--, 1);
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

	F2.prototype.Events = {
		/**
		 *
		 * @method emit
		 * @param {String} name The event name
		 * @return void
		 */
		emit: function(name) {
			var args = Array.prototype.slice.call(arguments, 1);
			return _send(name, [], args);
		},
		emitTo: function(filters, name) {
			var args = Array.prototype.slice.call(arguments, 2);
			return _send(name, filters, args);
		},
		/**
		 *
		 * @method many
		 * @param {String} name The event name
		 * @param {Number} timesToListen The number of times the handler should be fired
		 * @param {Function} handler Function to handle the event
		 * @return void
		 */
		many: function(instance, name, timesToListen, handler) {
			_subscribe(instance, name, handler, timesToListen);
		},
		/**
		 *
		 * @method off
		 * @param {String} name The event name
		 * @param {Function} handler Function to handle the event
		 * @return void
		 */
		off: function(instance, name, handler) {
			_unsubscribe(instance, name, handler);
		},
		/**
		 *
		 * @method on
		 * @param {String} name The event name
		 * @param {Function} handler Function to handle the event
		 * @return void
		 */
		on: function(instance, name, handler) {
			_subscribe(instance, name, handler);
		},
		/**
		 *
		 * @method once
		 * @param {String} name The event name
		 * @param {Function} handler Function to handle the event
		 * @return void
		 */
		once: function(instance, name, handler) {
			_subscribe(instance, name, handler, 1);
		}
	};

})(Helpers._, Helpers.LoadApps, Helpers.Guid);
