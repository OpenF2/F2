/* global EventEmitter2 */

var constants = require('./constants');
var F2 = require('./F2');
var rpc = require('./rpc');

/**
  Handles [Context](../../app-development.html#context) passing from containers
  to apps and apps to apps.
  @class F2.Events
*/
module.exports = (function() {
  var _events = new EventEmitter2({
    wildcard: true
  });

  // Unlimited listeners, set to > 0 for debugging
  _events.setMaxListeners(0);

  return {
    /**
      Same as F2.Events.emit except that it will not send the event to all
      sockets.
      @method _socketEmit
      @private
      @param {string} event The event name
      @param {object} [arg]* The arguments to be passed
      @returns {object} EventEmitter2 instance
    */
    _socketEmit: function() {
      return EventEmitter2.prototype.emit.apply(_events, [].slice.call(arguments));
    },
    /**
      Execute each of the listeners that may be listening for the specified
      event name in order with the list of arguments.
      @method emit
      @param {string} event The event name
      @param {object} [arg]* The arguments to be passed
      @returns {object} EventEmitter2 instance
    */
    emit: function() {
      rpc.broadcast(constants.Sockets.EVENT, [].slice.call(arguments));
      return EventEmitter2.prototype.emit.apply(_events, [].slice.call(arguments));
    },
    /**
      Adds a listener that will execute n times for the event before being
      removed. The listener is invoked only the first time the event is fired,
      after which it is removed.
      @method many
      @param {string} event The event name
      @param {int} timesToListen The number of times to execute the event
      before being removed
      @param {function} listener The function to be fired when the event is
      emitted
      @returns {object} EventEmitter2 instance
    */
    many: function(event, timesToListen, listener) {
      return _events.many(event, timesToListen, listener);
    },
    /**
      Remove a listener for the specified event.
      @method off
      @param {string} event The event name
      @param {function} listener The function that will be removed
      @returns {object} EventEmitter2 instance
    */
    off: function(event, listener) {
      return _events.off(event, listener);
    },
    /**
      Adds a listener for the specified event
      @method on
      @param {string} event The event name
      @param {function} listener The function to be fired when the event is
      emitted
      @returns {object} EventEmitter2 instance
    */
    on: function(event, listener) {
      return _events.on(event, listener);
    },
    /**
      Adds a one time listener for the event. The listener is invoked only
      the first time the event is fired, after which it is removed.
      @method once
      @param {string} event The event name
      @param {function} listener The function to be fired when the event is
      emitted
      @returns {object} EventEmitter2 instance
    */
    once: function(event, listener) {
      return _events.once(event, listener);
    }
  };
})();
