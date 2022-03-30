/**
 * Tests a URL to see if it's on the same domain (local) or not
 * @method isLocal
 * @param {URL to test} url
 * @return {bool} Whether the URL is local or not
 * Derived from: https://github.com/jquery/jquery/blob/master/src/ajax.js
 */
function isLocal(url) {
	var rurl = /^([\w.+-]+:)(?:\/\/([^/?#:]*)(?::(\d+)|)|)/,
		urlLower = url.toLowerCase(),
		parts = rurl.exec(urlLower),
		ajaxLocation,
		ajaxLocParts;

	try {
		ajaxLocation = location.href;
	} catch (e) {
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
		urlLower = toAbsolute(ajaxLocation, urlLower).toLowerCase();
		parts = rurl.exec(urlLower);
	}

	// Segment location into parts
	ajaxLocParts = rurl.exec(ajaxLocation) || [];

	// do hostname and protocol and port of manifest URL match location.href? (a "local" request on the same domain)
	var matched = !(
		parts &&
		(parts[1] !== ajaxLocParts[1] ||
			parts[2] !== ajaxLocParts[2] ||
			(parts[3] || (parts[1] === 'http:' ? '80' : '443')) !==
				(ajaxLocParts[3] || (ajaxLocParts[1] === 'http:' ? '80' : '443')))
	);

	return matched;
}

/**
 * Parses URI
 * @method parse
 * @param {The URL to parse} url
 * @return {Parsed URL} string
 * Source: https://gist.github.com/Yaffle/1088850
 * Tests: http://skew.org/uri/uri_tests.html
 */
function parse(url) {
	var m = String(url)
		.replace(/^\s+|\s+$/g, '')
		.match(
			/^([^:/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/
		);
	// authority = '//' + user + ':' + pass '@' + hostname + ':' port
	return m
		? {
				href: m[0] || '',
				protocol: m[1] || '',
				authority: m[2] || '',
				host: m[3] || '',
				hostname: m[4] || '',
				port: m[5] || '',
				pathname: m[6] || '',
				search: m[7] || '',
				hash: m[8] || ''
		  }
		: null;
}

/**
 * Abosolutizes a relative URL
 * @method toAbsolute
 * @param {e.g., location.href} base
 * @param {URL to absolutize} href
 * @return {string} URL
 * Source: https://gist.github.com/Yaffle/1088850
 * Tests: http://skew.org/uri/uri_tests.html
 */
function toAbsolute(base, href) {
	// RFC 3986

	function removeDotSegments(input) {
		var output = [];
		input
			.replace(/^(\.\.?(\/|$))+/, '')
			.replace(/\/(\.(\/|$))+/g, '/')
			.replace(/\/\.\.$/, '/../')
			.replace(/\/?[^/]*/g, function (p) {
				if (p === '/..') {
					output.pop();
				} else {
					output.push(p);
				}
			});
		return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
	}

	href = parse(href || '');
	base = parse(base || '');

	return !href || !base
		? null
		: (href.protocol || base.protocol) +
				(href.protocol || href.authority ? href.authority : base.authority) +
				removeDotSegments(
					href.protocol || href.authority || href.pathname.charAt(0) === '/'
						? href.pathname
						: href.pathname
						? (base.authority && !base.pathname ? '/' : '') +
						  base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) +
						  href.pathname
						: base.pathname
				) +
				(href.protocol || href.authority || href.pathname
					? href.search
					: href.search || base.search) +
				href.hash;
}

export default {
	isLocal,
	parse,
	toAbsolute
};
