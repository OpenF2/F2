(function(F2, Helpers) {

	// --------------------------------------------------------------------------
	// Helpers
	// --------------------------------------------------------------------------

	function delim(url) {
		return (url.indexOf('?') === -1) ? '?' : '&';
	}

	/**
	 * Parses URI
	 * @method _parseURI
	 * @private
	 * @param {The URL to parse} url
	 * @returns {Parsed URL} string
	 * Source: https://gist.github.com/Yaffle/1088850
	 * Tests: http://skew.org/uri/uri_tests.html
	 */

	function _parseURI(url) {
		var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
		// authority = '//' + user + ':' + pass '@' + hostname + ':' port
		return (m ? {
			href: m[0] || '',
			protocol: m[1] || '',
			authority: m[2] || '',
			host: m[3] || '',
			hostname: m[4] || '',
			port: m[5] || '',
			pathname: m[6] || '',
			search: m[7] || '',
			hash: m[8] || ''
		} : null);
	}

	/**
	 * Abosolutizes a relative URL
	 * @method _absolutizeURI
	 * @private
	 * @param {e.g., location.href} base
	 * @param {URL to absolutize} href
	 * @returns {string} URL
	 * Source: https://gist.github.com/Yaffle/1088850
	 * Tests: http://skew.org/uri/uri_tests.html
	 */

	function _absolutizeURI(base, href) { // RFC 3986
		function removeDotSegments(input) {
			var output = [];
			input.replace(/^(\.\.?(\/|$))+/, '')
				.replace(/\/(\.(\/|$))+/g, '/')
				.replace(/\/\.\.$/, '/../')
				.replace(/\/?[^\/]*/g, function(p) {
					if (p === '/..') {
						output.pop();
					}
					else {
						output.push(p);
					}
				});
			return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
		}

		href = _parseURI(href || '');
		base = _parseURI(base || '');

		return !href || !base ? null : (href.protocol || base.protocol) +
			(href.protocol || href.authority ? href.authority : base.authority) +
			removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
			(href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
			href.hash;
	}

	/**
	 * Tests a URL to see if it's on the same domain (local) or not
	 * @method isLocalRequest
	 * @param {URL to test} url
	 * @returns {bool} Whether the URL is local or not
	 * Derived from: https://github.com/jquery/jquery/blob/master/src/ajax.js
	 */

	function _isLocalRequest(url) {
		var rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
			urlLower = url.toLowerCase(),
			parts = rurl.exec(urlLower),
			ajaxLocation,
			ajaxLocParts;

		try {
			ajaxLocation = location.href;
		}
		catch (e) {
			// Use the href attribute of an A element
			// since IE will modify it given document.location
			ajaxLocation = document.createElement('a');
			ajaxLocation.href = '';
			ajaxLocation = ajaxLocation.href;
		}

		ajaxLocation = ajaxLocation.toLowerCase();

		// uh oh, the url must be relative
		// make it fully qualified and re-regex url
		if (!parts) {
			urlLower = _absolutizeURI(ajaxLocation, urlLower).toLowerCase();
			parts = rurl.exec(urlLower);
		}

		// Segment location into parts
		ajaxLocParts = rurl.exec(ajaxLocation) || [];

		// do hostname and protocol and port of manifest URL match location.href? (a "local" request on the same domain)
		var matched = !(parts &&
			(parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] ||
				(parts[3] || (parts[1] === 'http:' ? '80' : '443')) !==
				(ajaxLocParts[3] || (ajaxLocParts[1] === 'http:' ? '80' : '443'))));

		return matched;
	}

	// --------------------------------------------------------------------------
	// GET/POST
	// --------------------------------------------------------------------------

	Helpers.Ajax = function(params, cache) {
		if (!params.url) {
			throw 'F2.Ajax: you must provide a url.';
		}

		params.crossOrigin = !_isLocalRequest(params.url);

		// Determine the method if none was provided
		if (!params.method) {
			if (params.crossOrigin) {
				params.type = 'jsonp';
			}
			else {
				params.method = 'post';
			}
		}

		if (!params.type) {
			params.type = 'json';
		}

		// Look for methods that use query strings
		if (params.method === 'get' || params.type === 'jsonp') {
			// Bust cache if asked
			if (!cache) {
				params.url += delim(params.url) + Math.floor(Math.random() * 1000000);
			}
		}

		if (params.type === 'jsonp') {
			// Create a random callback name
			params.jsonpCallbackName = 'F2_' + Math.floor(Math.random() * 1000000);

			// Add a jsonp callback to the window
			window[params.jsonpCallbackName] = function(response) {
				if (params.success) {
					params.success(response);
				}

				if (params.complete) {
					params.complete();
				}

				// Pull the callback off the window
				delete window[params.jsonpCallbackName];
			};
		}

		// Make the call
		var req = reqwest(params);

		// Return the xhr object
		return (function() {
			var output = {
				isAborted: false
			};

			output.abort = function() {
				output.isAborted = true;
				req.request.abort();
			};

			return output;
		})();
	};

})(F2, Helpers);