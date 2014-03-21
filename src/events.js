/**
 * Handles context passing
 * @class F2.Events
 */
(function() {

	var _cache = {};

	// ---------------------------------------------------------------------------
	// Utils
	// ---------------------------------------------------------------------------

	function _subscribe(name, handler, context, timesToListen) {
		if (!name) {
			throw 'F2.Events: you must provide an event name.';
		}

		if (!handler) {
			throw 'F2.Events: you must provide an event handler.';
		}

		if (!_cache[name]) {
			_cache[name] = [];
		}

		// Don't allow the user to pass in window because it can confuse us later
		// when we try to unsubscribe
		if (context === window) {
			context = undefined;
		}

		_cache[name].push({
			handler: handler,
			context: context,
			timesLeft: timesToListen
		});
	}

	function _unsubscribe(name, handler, context) {
		if (!name && !handler && !context) {
			throw 'F2.Events: "off" accepts the following combinations of parameters: name/handler, name/context, handler, context.';
		}

		if (name && !handler && !context) {
			throw 'F2.Events: you must pass either a handler or context along with name';
		}

		if (_cache[name] && (handler || context)) {
			var len = _cache[name].length;

			while (len--) {
				var matchesHandler = (handler && _cache[name][len].handler === handler);
				var matchesContext = (context && _cache[name][len].context === context);

				if (matchesHandler || matchesContext) {
					_cache[name].splice(len, 1);
				}
			}
		}
		else if (context || handler) {
			// Search all events for the context
			for (var eventName in _cache) {
				_unsubscribe(eventName, handler, context);
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
		 * @param {Object} args* The arguments to emit
		 * @return void
		 */
		emit: function(name, args) {
			if (!name) {
				throw 'F2.Events: you must provide an event name to emit.';
			}

			if (_cache[name]) {
				// Get all the non "name" arguments passed in
				args = Array.prototype.slice.call(arguments, 1);

				var leakedContexts = [];
				var len = _cache[name].length;

				while (len--) {
					var sub = _cache[name][len];

					// Check for possible memory leak
					if (sub.context && sub.context.__f2Disposed__) {
						leakedContexts.push(sub.context);
					}
					else {
						// Execute the handler
						sub.handler.apply(sub.context || window, args);

						// See if this is limited to a # of executions
						if (sub.timesLeft !== undefined && --sub.timesLeft === 0) {
							_cache[name].splice(len, 1);
						}
					}
				}

				// Clean up the leaked contexts
				while (leakedContexts.length) {
					_unsubscribe(null, null, leakedContexts.shift());
				}
			}
		},
		/**
		 *
		 * @method many
		 * @param {String} name The event name
		 * @param {Number} timesToListen The number of times the handler should be fired
		 * @param {Function} handler Function to handle the event
		 * @param {Object} context
		 * @return void
		 */
		many: function(name, timesToListen, handler, context) {
			if (!timesToListen) {
				timesToListen = 0;
			}
			else {
				timesToListen = parseInt(timesToListen, 10);
			}

			if (timesToListen < 1) {
				throw 'F2.Events: "timesToListen" must be greater than 0.';
			}

			return _subscribe(name, handler, context, timesToListen);
		},
		/**
		 *
		 * @method off
		 * @param {String} name The event name
		 * @param {Function} handler Function to handle the event
		 * @param {Object} context
		 * @return void
		 */
		off: function(name, handler, context) {
			return _unsubscribe(name, handler, context);
		},
		/**
		 *
		 * @method on
		 * @param {String} name The event name
		 * @param {Function} handler Function to handle the event
		 * @param {Object} context
		 * @return void
		 */
		on: function(name, handler, context) {
			return _subscribe(name, handler, context);
		},
		/**
		 *
		 * @method once
		 * @param {String} name The event name
		 * @param {Function} handler Function to handle the event
		 * @param {Object} context
		 * @return void
		 */
		once: function(name, handler, context) {
			return _subscribe(name, handler, context, 1);
		}
	};

})();
