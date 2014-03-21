/**
 * Handles context passing
 * @class F2.Events
 */
(function(_) {

	var _subs = {};

	// ---------------------------------------------------------------------------
	// Utils
	// ---------------------------------------------------------------------------

	function _subscribe(name, handler, timesToListen) {
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

		_subs[name].push({
			handler: handler,
			timesLeft: timesToListen
		});
	}

	function _unsubscribe(name, handler) {
		// Check for only handler being passed
		if (name && _.isFunction(name) && !handler) {
			handler = name;
			name = undefined;
		}

		if (!handler) {
			throw 'F2.Events: you must pass a handler.';
		}

		if (_subs[name]) {
			var len = _subs[name].length;

			while (len--) {
				if (_subs[name][len].handler === handler) {
					_subs[name].splice(len, 1);
				}
			}
		}
		else {
			// Look for the handler in each subscriber
			for (var subName in _subs) {
				_unsubscribe(subName, handler);
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
			if (!name || name !== name.toString()) {
				throw 'F2.Events: you must provide an event name to emit.';
			}

			if (_subs[name]) {
				var args = Array.prototype.slice.call(arguments, 1);
				var len = _subs[name].length;

				while (len--) {
					// Execute the handler
					_subs[name][len].handler.apply(window, args);

					// See if this is limited to a # of executions
					if (_subs[name][len].timesLeft !== undefined && --_subs[name][len].timesLeft === 0) {
						_subs[name].splice(len, 1);
					}
				}
			}
		},
		/**
		 *
		 * @method many
		 * @param {String} name The event name
		 * @param {Number} timesToListen The number of times the handler should be fired
		 * @param {Function} handler Function to handle the event
		 * @return void
		 */
		many: function(name, timesToListen, handler) {
			return _subscribe(name, handler, timesToListen);
		},
		/**
		 *
		 * @method off
		 * @param {String} name The event name
		 * @param {Function} handler Function to handle the event
		 * @return void
		 */
		off: function(name, handler) {
			return _unsubscribe(name, handler);
		},
		/**
		 *
		 * @method on
		 * @param {String} name The event name
		 * @param {Function} handler Function to handle the event
		 * @return void
		 */
		on: function(name, handler) {
			return _subscribe(name, handler);
		},
		/**
		 *
		 * @method once
		 * @param {String} name The event name
		 * @param {Function} handler Function to handle the event
		 * @return void
		 */
		once: function(name, handler) {
			return _subscribe(name, handler, 1);
		}
	};

})(Helpers._);
