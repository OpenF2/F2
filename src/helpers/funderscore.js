/*
	Code generously borrowed from the underscore library. Some code has been
	modified to work outside the complete library.

	http://underscorejs.org/
*/
(function() {

	// Establish the object that gets returned to break out of a loop iteration.
	var breaker = {};

	Helpers._ = {
		map: function(obj, iterator, context) {
			var results = [];

			if (obj === null) {
				return results;
			}

			if (Array.prototype.map && obj.map === Array.prototype.map) {
				return obj.map(iterator, context);
			}

			this.each(obj, function(value, index, list) {
				results.push(iterator.call(context, value, index, list));
			});

			return results;
		},
		each: function(obj, iterator, context) {
			if (obj === null) {
				return;
			}

			if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
				obj.forEach(iterator, context);
			}
			else if (obj.length === +obj.length) {
				for (var i = 0; i < obj.length; i++) {
					if (iterator.call(context, obj[i], i, obj) === breaker) {
						return;
					}
				}
			}
			else {
				var keys = this.keys(obj);

				for (var j = 0; j < obj.length; j++) {
					if (iterator.call(context, obj[keys[j]], keys[j], obj) === breaker) {
						return;
					}
				}
			}
		},
		keys: function(obj) {
			if (Object.keys) {
				return Object.keys(obj);
			}

			if (obj !== Object(obj)) {
				throw new TypeError('Invalid object');
			}

			var keys = [];

			for (var key in obj) {
				if (Object.prototype.hasOwnProperty.call(obj, key)) {
					keys.push(key);
				}
			}

			return keys;
		},
		defaults: function(obj) {
			this.each(Array.prototype.slice.call(arguments, 1), function(source) {
				if (source) {
					for (var prop in source) {
						if (obj[prop] === void 0) {
							obj[prop] = source[prop];
						}
					}
				}
			});

			return obj;
		},
		extend: function(obj) {
			this.each(Array.prototype.slice.call(arguments, 1), function(source) {
				if (source) {
					for (var prop in source) {
						obj[prop] = source[prop];
					}
				}
			});

			return obj;
		},
		isArray: function(test) {
			if (Array.isArray) {
				return Array.isArray(test);
			}
			else {
				return Object.prototype.toString.call(test) == '[object Array]';
			}
		},
		isFunction: function(test) {
			return typeof test === 'function';
		},
		isString: function(test) {
			return typeof test === 'string';
		},
		isObject: function(test) {
			return test === Object(test);
		},
		filter: function(list, fn) {
			var output = [];

			for (var i = 0, len = list.length; i < len; i++) {
				if (fn(list[i], i, list)) {
					output.push(list[i]);
				}
			}

			return output;
		}
	};

})();
