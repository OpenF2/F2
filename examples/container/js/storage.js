/**
 *
 */
F2.extend('Storage', (function() {

	var _hasLocalStorage = typeof Storage !== 'undefined' && !!window.localStorage;

	var _getKey = function(key) {
		return 'F2-' + key;
	};

	return {
		/**
		 * @method getItem
		 * @param {string} key The key of the item to retrieve
		 */
		getItem:function(key) {

			var value = null;

			if (!key) { return; }

			key = _getKey(key);

			if (_hasLocalStorage) {
				value = localStorage.getItem(key);
			} else {
				var cookies = document.cookie.split(/\s*;\s*/);
				for (var i = 0, len = cookies.length; i < len; i++) {
					var parts = cookies[i].split(/\s*=\s*/);
					if (parts.length > 1 && unescape(parts[0]) == key) {
						value = unescape(parts[1]);
					}
				}
			}

			if (!!value) {
				value = F2.parse(value);
			}

			return value;
		},
		/**
		 * @method removeItem
		 * @param {string} key The key of the item to remove
		 */
		removeItem:function(key) {

			if (!key) { return; }

			key = _getKey(key);

			if (_hasLocalStorage) {
				localStorage.removeItem(key);
			} else {
				document.cookie = escape(key) + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
			}
		},
		/**
		 * @method setItem
		 * @param {string} key The key of the item to set
		 * @param {object} value The value to be stored
		 */
		setItem:function(key, value) {

			if (!key || !value) { return; }

			key = _getKey(key);
			value = F2.stringify(value);

			if (_hasLocalStorage) {
				localStorage.setItem(key, value);
			} else {
				var exp = new Date();
				exp.setFullYear((new Date()).getFullYear() + 100);
				document.cookie = escape(key) + '=' + escape(value) + '; expires=' + exp.toUTCString() + '; path=/';
			}
		}
	};
})());