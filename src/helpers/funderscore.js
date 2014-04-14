/*
	Code generously borrowed from the underscore library. Some code has been
	modified to work outside the complete library.

	http://underscorejs.org/
*/
(function() {

	Helpers._ = {
		defaults: function(obj) {
			Array.prototype.slice.call(arguments, 1).forEach(function(source) {
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
			Array.prototype.slice.call(arguments, 1).forEach(function(source) {
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
		isNode: function(test) {
			return test && test.nodeType === 1;
		},
		isString: function(test) {
			return typeof test === 'string';
		},
		isObject: function(test) {
			return test === Object(test);
		},
		isNull: function(test) {
			return test === null;
		},
		pluck: function(list, property) {
			var props = [];

			for (var i = 0; i < list.length; i++) {
				if (list[i] && list[i][property]) {
					props.push(list[i][property]);
				}
			}

			return props;
		},
		unique: function(array) {
			if (!array) {
				return [];
			}

			var result = [];
			var seen = [];

			for (var i = 0, length = array.length; i < length; i++) {
				var value = array[i];

				if (value && result.indexOf(value) === -1) {
					result.push(value);
				}

				seen.push(value);
			}

			return result;
		}
	};

})();
