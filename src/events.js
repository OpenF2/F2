import EventEmitter2 from 'eventemitter2';

/**
 * Handles [Context](../../app-development.html#context) passing from
 * containers to apps and apps to apps.
 * @class F2.Events
 */
export default (function () {
	// init EventEmitter
	var _events = new EventEmitter2({
		wildcard: true
	});

	// unlimited listeners, set to > 0 for debugging
	_events.setMaxListeners(0);

	return {
		/**
		 * Execute each of the listeners that may be listening for the specified
		 * event name in order with the list of arguments.
		 * @method emit
		 * @param {string} event The event name
		 * @param {object} [arg]* The arguments to be passed
		 */
		emit: function () {
			return EventEmitter2.prototype.emit.apply(
				_events,
				[].slice.call(arguments)
			);
		},
		/**
		 * Adds a listener that will execute n times for the event before being
		 * removed. The listener is invoked only the first time the event is
		 * fired, after which it is removed.
		 * @method many
		 * @param {string} event The event name
		 * @param {int} timesToListen The number of times to execute the event
		 * before being removed
		 * @param {function} listener The function to be fired when the event is
		 * emitted
		 */
		many: function (event, timesToListen, listener) {
			return _events.many(event, timesToListen, listener);
		},
		/**
		 * Remove a listener for the specified event.
		 * @method off
		 * @param {string} event The event name
		 * @param {function} listener The function that will be removed
		 */
		off: function (event, listener) {
			return _events.off(event, listener);
		},
		/**
		 * Adds a listener for the specified event
		 * @method on
		 * @param {string} event The event name
		 * @param {function} listener The function to be fired when the event is
		 * emitted
		 */
		on: function (event, listener) {
			return _events.on(event, listener);
		},
		/**
		 * Adds a one time listener for the event. The listener is invoked only
		 * the first time the event is fired, after which it is removed.
		 * @method once
		 * @param {string} event The event name
		 * @param {function} listener The function to be fired when the event is
		 * emitted
		 */
		once: function (event, listener) {
			return _events.once(event, listener);
		}
	};
})();
