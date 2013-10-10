define('F2.Ajax', ['F2.Promise'], function(Promise) {

	// --------------------------------------------------------------------------
	// GET/POST
	// --------------------------------------------------------------------------

	// Derived from http://www.quirksmode.org/js/xmlhttp.html
	function _sendRequest(url, callback, postData) {
		var req = _createXMLHTTPObject();

		if (!req) {
			return;
		}

		var method = (postData) ? 'POST' : 'GET';
		req.open(method, url, true);
		req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');

		if (postData) {
			req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		}

		req.onreadystatechange = function() {
			if (req.readyState != 4) {
				return;
			}

			if (req.status != 200 && req.status != 304) {
				return;
			}

			callback(req);
		};

		if (req.readyState == 4) {
			return;
		}

		req.send(postData);
	}

	var _XMLHttpFactories = [
		function() {
			return new XMLHttpRequest();
		},
		function() {
			return new ActiveXObject('Msxml2.XMLHTTP');
		},
		function() {
			return new ActiveXObject('Msxml3.XMLHTTP');
		},
		function() {
			return new ActiveXObject('Microsoft.XMLHTTP');
		}
	];

	function _createXMLHTTPObject() {
		var xmlhttp = false;

		for (var i = 0; i < _XMLHttpFactories.length; i++) {
			try {
				xmlhttp = _XMLHttpFactories[i]();
			}
			catch (e) {
				continue;
			}
			break;
		}

		return xmlhttp;
	}

	// --------------------------------------------------------------------------
	// JSONP
	// --------------------------------------------------------------------------

	// --------------------------------------------------------------------------
	// API
	// --------------------------------------------------------------------------

	function _ajax() { }

	_ajax.get = function(url, data, cache) {
		var deferred = Promise.defer();

		// Translate data into query string params

		if (cache) {
			// Add random
		}

		_sendRequest(url, function(req) {
			if (req.status === 200) {
				var parsed = req.responseText;

				// Attempt to parse the response as JSON
				try {
					JSON.parse(req.responseText);
				}
				catch (e) { }

				deferred.resolve(parsed);
			}
			else {
				deferred.reject(req);
			}
		});

		return deferred.promise;
	};

	return _ajax;

});