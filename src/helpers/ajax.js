(function(reqwest) {

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
		var m = String(url)
			.replace(/^\s+|\s+$/g, '')
			.match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
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
			// Use the href since IE will modify it given document.location
			ajaxLocation = document.createElement('a');
			ajaxLocation.href = '';
			ajaxLocation = ajaxLocation.href;
		}

		ajaxLocation = ajaxLocation.toLowerCase();

		// The url must be relative. Make it fully qualified and re-regex url
		if (!parts) {
			urlLower = _absolutizeURI(ajaxLocation, urlLower).toLowerCase();
			parts = rurl.exec(urlLower);
		}

		// Segment location into parts
		ajaxLocParts = rurl.exec(ajaxLocation) || [];

		// Do hostname, protocol, port of manifest URL match location.href?
		// (a "local" request on the same domain)
		var matched = !(parts &&
			(parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] ||
				(parts[3] || (parts[1] === 'http:' ? '80' : '443')) !==
				(ajaxLocParts[3] || (ajaxLocParts[1] === 'http:' ? '80' : '443'))));

		return matched;
	}

	function rand() {
		return Math.floor(Math.random() * 1000000);
	}

	// --------------------------------------------------------------------------
	// GET/POST
	// --------------------------------------------------------------------------

	Helpers.Ajax = {
		request: function(params, cache) {
			if (!params.url) {
				throw 'F2.Ajax: you must provide a url.';
			}

			params.crossOrigin = !_isLocalRequest(params.url);
			var isFile = (params.url.indexOf('.json') !== -1 || params.url.indexOf('.js') !== -1);

			// Determine the method if none was provided
			if (!params.method) {
				if (params.crossOrigin) {
					params.type = 'jsonp';
				}
				else if (isFile) {
					params.method = 'get';
				}
				else {
					params.method = 'post';
				}
			}

			if (!params.type) {
				params.type = 'json';
			}

			// Bust cache if asked
			if ((params.method === 'get' || params.type === 'jsonp') && !cache) {
				params.url += delim(params.url) + rand();
			}

			if (params.type === 'jsonp') {
				// Create a random callback name
				params.jsonpCallbackName = 'F2_' + rand();

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

			// Kick off the request
			var req = reqwest(params);

			return {
				isAborted: false,
				abort: function() {
					this.isAborted = true;
					req.request.abort();
				}
			};
		}
	};

})(reqwest);
