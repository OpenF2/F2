import uri from './uri';

export default {
	/**
	 * A function to pass into F2.stringify which will prevent circular
	 * reference errors when serializing objects
	 * @method appConfigReplacer
	 */
	appConfigReplacer: function(key, value) {
		if (key == 'root' || key == 'ui' || key == 'height') {
			return undefined;
		} else {
			return value;
		}
	},
	/**
	 * Creates a namespace on F2 and copies the contents of an object into
	 * that namespace optionally overwriting existing properties.
	 * @method extend
	 * @param {string} ns The namespace to create. Pass a falsy value to
	 * add properties to the F2 namespace directly.
	 * @param {object} obj The object to copy into the namespace.
	 * @param {bool} overwrite True if object properties should be overwritten
	 * @return {object} The created object
	 */
	extend: function (ns, obj, overwrite) {
		var isFunc = typeof obj === 'function';
		var parts = ns ? ns.split('.') : [];
		var parent = this;
		obj = obj || {};

		// ignore leading global
		if (parts[0] === 'F2') {
			parts = parts.slice(1);
		}

		// create namespaces
		for (var i = 0, len = parts.length; i < len; i++) {
			if (!parent[parts[i]]) {
				parent[parts[i]] = isFunc && i + 1 == len ? obj : {};
			}
			parent = parent[parts[i]];
		}

		// copy object into namespace
		if (!isFunc) {
			for (var prop in obj) {
				if (typeof parent[prop] === 'undefined' || overwrite) {
					parent[prop] = obj[prop];
				}
			}
		}

		return parent;
	},
	/**
	 * Generates a somewhat random id
	 * @method guid
	 * @return {string} A random id
	 * @for F2
	 */
	guid: function() {
		var S4 = function() {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return (S4()+S4()+'-'+S4()+'-'+S4()+'-'+S4()+'-'+S4()+S4()+S4());
	},
	/**
	 * Tests a URL to see if it's on the same domain (local) or not
	 * @method isLocal
	 * @param {URL to test} url
	 * @return {bool} Whether the URL is local or not
	 */
	isLocalRequest: uri.isLocal,
	/**
	 * A utility logging function to write messages or objects to the browser console. This is a proxy for the [`console` API](https://developers.google.com/chrome-developer-tools/docs/console).
	 * @method log
	 * @param {object|string} Object/Method An object to be logged _or_ a `console` API method name, such as `warn` or `error`. All of the console method names are [detailed in the Chrome docs](https://developers.google.com/chrome-developer-tools/docs/console-api).
	 * @param {object} [obj2]* An object to be logged
	 * @example
		//Pass any object (string, int, array, object, bool) to .log()
		F2.log('foo');
		F2.log(myArray);
		//Use a console method name as the first argument.
		F2.log('error', err);
		F2.log('info', 'The session ID is ' + sessionId);
		* Some code derived from [HTML5 Boilerplate console plugin](https://github.com/h5bp/html5-boilerplate/blob/master/js/plugins.js)
		*/
	log: function() {
		var _log;
		var _logMethod = 'log';
		var method;
		var noop = function () { };
		var methods = [
			'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
			'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
			'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
			'timeStamp', 'trace', 'warn'
		];
		var length = methods.length;
		var console = (window.console = window.console || {});
		var args;

		while (length--) {
			method = methods[length];

			// Only stub undefined methods.
			if (!console[method]) {
				console[method] = noop;
			}

			//if first arg is a console function, use it.
			//defaults to console.log()
			if (arguments && arguments.length > 1 && arguments[0] == method){
				_logMethod = method;
				//remove console func from args
				args = Array.prototype.slice.call(arguments, 1);
			}
		}

		if (Function.prototype.bind) {
			_log = Function.prototype.bind.call(console[_logMethod], console);
		} else {
			_log = function() {
				Function.prototype.apply.call(console[_logMethod], console, (args || arguments));
			};
		}

		_log.apply(this, (args || arguments));
	},
	/**
	 * Wrapper to convert a JSON string to an object
	 * @method parse
	 * @param {string} str The JSON string to convert
	 * @return {object} The parsed object
	 */
	parse: function(str) {
		return JSON.parse(str);
	},
	/**
	 * Wrapper to convert an object to JSON
	 *
	 * **Note: When using F2.stringify on an F2.AppConfig object, it is
	 * recommended to pass F2.appConfigReplacer as the replacer function in
	 * order to prevent circular serialization errors.**
	 * @method stringify
	 * @param {object} value The object to convert
	 * @param {function|Array} replacer An optional parameter that determines
	 * how object values are stringified for objects. It can be a function or an
	 * array of strings.
	 * @param {int|string} space An optional parameter that specifies the
	 * indentation of nested structures. If it is omitted, the text will be
	 * packed without extra whitespace. If it is a number, it will specify the
	 * number of spaces to indent at each level. If it is a string (such as '\t'
	 * or '&nbsp;'), it contains the characters used to indent at each level.
	 * @return {string} The JSON string
	 */
	stringify: function(value, replacer, space) {
		return JSON.stringify(value, replacer, space);
	},
	/**
	 * Function to get the F2 version number
	 * @method version
	 * @return {string} F2 version number
	 */
	version: function() {
		/* jshint undef: false */
		return VERSION;
	}
};
