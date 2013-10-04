define("F2", ["F2.Defer", "json"], function(Defer, JSON) {

	// ---------------------------------------------------------------------------
	// Private Storage
	// ---------------------------------------------------------------------------

	var _config = {};

	// Keep a running tally of legacy apps we've had to wrap in define()
	var _appsWrappedInDefine = {};

	// ---------------------------------------------------------------------------
	// Helpers
	// ---------------------------------------------------------------------------

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
	var _absolutizeURI = function(base, href) { // RFC 3986
		function removeDotSegments(input) {
			var output = [];
			input.replace(/^(\.\.?(\/|$))+/, '')
				.replace(/\/(\.(\/|$))+/g, '/')
				.replace(/\/\.\.$/, '/../')
				.replace(/\/?[^\/]*/g, function(p) {
					if (p === '/..') {
						output.pop();
					} else {
						output.push(p);
					}
				});

			return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
		}

		var href = _parseURI(href || '');
		var base = _parseURI(base || '');

		return !href || !base ? null : (href.protocol || base.protocol) +
			(href.protocol || href.authority ? href.authority : base.authority) +
			removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
			(href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
			href.hash;
	};

	/**
	 * Parses URI
	 * @method _parseURI
	 * @private
	 * @param {The URL to parse} url
	 * @returns {Parsed URL} string
	 * Source: https://gist.github.com/Yaffle/1088850
	 * Tests: http://skew.org/uri/uri_tests.html
	 */
	var _parseURI = function(url) {
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
	};

	function _loadHtml(apps, deferred) {
		var rootParent = document.createElement("div");
		var deferArgs = {};

		// Make a promise argument for each app
		// This will let the container place the app on the page
		for (var i = 0, len = apps.length; i < len; i++) {
			if (apps[i].appId) {
				// Create a new element and add the app html
				// This will allow us to easily extract a DOM node from the markup
				rootParent.innerHTML = apps[i].html;

				deferArgs[apps[i].appId] = {
					instanceId: self.guid(),
					root: rootParent.firstChild
				};
			}
		}

		// Allow the container to act on the apps
		deferred.resolve(deferArgs);

		return deferArgs;
	}

	function _loadApps(appData) {
		var appIds = [];

		for (var appId in appData) {
			appIds.push(appId);

			// See if this app was defined the old way
			// e.g., "F2.Apps['goober'] = ...
			if (F2.Apps[appId] && !_appsWrappedInDefine[appId]) {
				// Wrap the app class inside define() so we can load it through AMD
				define(appId, [], F2.Apps[appId]);

				_appsWrappedInDefine[appId] = true;
			}
		}

		// App classes should be wrapped in "define()", so this will load them
		require(appIds, function(/* appClass1, appClass2 */) {
			var appClasses = Array.prototype.slice(arguments, appIds.length);

			// Instantiate the app classes
			for (var i = 0, len = appIds.length; i < len; i++) {
				var appDatum = appData[appIds[i]];
				
				var instance = new appClasses[i](appDatum.root, appDatum.instanceId);
				instance.init();
			}
		});
	}

	function _loadScripts(paths, inlines, callback) {
		var hasPaths = (paths && paths instanceof Array && paths.length);
		var hasInlines = (inlines && inlines instanceof Array && inlines.length);

		if (hasPaths || hasInlines) {
			// Check for user defined loader
			if (_config.loadScripts instanceof Function) {
				_config.loadScripts(paths, inlines, callback);
			}
			else {)
				require(paths, function() {
					// Load the inline scripts
					if (hasInlines) {
						for (var i = 0, len = inlines.length; i < len; i++) {
							try {
								eval(inlines[i]);
							}
							catch (exception) {
								F2.log('Error loading inline script: ' + exception + '\n\n' + inlines[i]);
							}
						}
					}

					callback();
				});
			}
		}
		else {
			callback();
		}
	}

	function _loadStyles(paths) {
		if (paths && paths instanceof Array && paths.length) {
			// Check for user defined loader
			if (_config.loadStyles instanceof Function) {
				_config.loadStyles(paths);
			}
			else {
				var frag = document.createDocumentFragment();
				var tags = document.getElementsByTagName("link");
				var existingPaths = {};

				// Find all the existing paths on the page
				for (var i = 0, iLen = tags.length; i < iLen; i++) {
					existingPaths[tags[i].href] = true;
				}

				// Create a link tag for each path
				for (var j = 0, jLen = paths.length; j < jLen; j++) {
					if (!existingPaths[paths[j]]) {
						var link = document.createElement("link");
						link.href = paths[j];
						frag.appendChild(link);
					}
				}

				// Add tags to the page
				document.getElementsByName("head")[0].appendChild(frag);
			}
		}
	}

	/**
		* Utility method to determine whether or not the argument passed in is or is not a native dom node.
		* @method isNativeDOMNode
		* @param {object} testObject The object you want to check as native dom node.
		* @return {bool} Returns true if the object passed is a native dom node.
		*/
	function isNativeDomNode(test) {
		return (test && test.nodeType === 1);
	}

	/**
		* Tests a URL to see if it's on the same domain (local) or not
		* @method isLocalRequest
		* @param {URL to test} url
		* @returns {bool} Whether the URL is local or not
		* Derived from: https://github.com/jquery/jquery/blob/master/src/ajax.js
		*/
	function isLocalRequest(url) {
		var rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
			urlLower = url.toLowerCase(),
			parts = rurl.exec(urlLower),
			ajaxLocation,
			ajaxLocParts;

		try {
			ajaxLocation = location.href;
		}
		catch (e) {
			// Use the href attribute of an A element since IE will modify it given document.location
			ajaxLocation = document.createElement('a');
			ajaxLocation.href = '';
			ajaxLocation = ajaxLocation.href;
		}

		ajaxLocation = ajaxLocation.toLowerCase();

		// Uh oh, the url must be relative
		// Make it fully qualified and re-regex url
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

	// ---------------------------------------------------------------------------
	// F2 Properties
	// ---------------------------------------------------------------------------

	// Every journey begins with a single step
	var F2 = {};

	F2.Apps = {};

	/** 
		* Generates an RFC4122 v4 compliant id
		* @method guid
		* @return {string} A random id
		* @for F2
		*/
	F2.guid = function() {
		'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0;
			var v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	};

	/**
		* Initializes the container. This method must be called before performing
		* any other actions in the container.
		* @method init
		* @param {F2.ContainerConfig} config The configuration object
		*/
	F2.init = function(config) {
		if (config) {
			F2.extend(true, _config, config);
		}

		_validateContainerConfig();
		_hydrateContainerConfig(_config);
	};

	/**
		* Begins the loading process for all apps and/or initialization process for pre-loaded apps.
		* The app will be passed the {{#crossLink "F2.AppConfig"}}{{/crossLink}} object which will
		* contain the app's unique instanceId within the container. If the 
		* {{#crossLink "F2.AppConfig"}}{{/crossLink}}.root property is populated the app is considered
		* to be a pre-loaded app and will be handled accordingly. Optionally, the
		* {{#crossLink "F2.AppManifest"}}{{/crossLink}} can be passed in and those
		* assets will be used instead of making a request.
		* @method load
		* @param {Array} appConfigs An array of {{#crossLink "F2.AppConfig"}}{{/crossLink}} objects
		* @param {Array} [appManifests] An array of {{#crossLink "F2.AppManifest"}}{{/crossLink}}
		* objects. This array must be the same length as the apps array that is passed in. This can 
		* be useful if apps are loaded on the server-side and passed down to the client.
		* @example
		* Traditional App requests.
		*
		*	// Traditional f2 app configs
		*	var arConfigs = [
		*		{
		*			appId: 'com_externaldomain_example_app',
		*			context: {},
		*			manifestUrl: 'http://www.externaldomain.com/F2/AppManifest'
		*		},
		*		{
		*			appId: 'com_externaldomain_example_app2',
		*			context: {},
		*			manifestUrl: 'http://www.externaldomain.com/F2/AppManifest'
		*		}
		*	];
		*	
		*	F2.init();
		*	F2.load(arConfigs);
		*
		* @example
		* Pre-loaded and tradition apps mixed.
		* 
		*	// Pre-loaded apps and traditional f2 app configs
		*	// you can preload the same app multiple times as long as you have a unique root for each
		*	var arConfigs = [
		*		{
		*			appId: 'com_mydomain_example_app',
		*			context: {},
		*			root: 'div#example-app-1',
		*			manifestUrl: ''
		*		},
		*		{
		*			appId: 'com_externaldomain_example_app',
		*			context: {},
		*			manifestUrl: 'http://www.externaldomain.com/F2/AppManifest'
		*		}
		*	];
		*
		*	F2.init();
		*	F2.load(arConfigs);
		*
		* @example
		* Apps with predefined manifests.
		*
		*	// Traditional f2 app configs
		*	var arConfigs = [
		*		{ appId: 'com_externaldomain_example_app' },
		*		{ appId: 'com_externaldomain_example_app2', context: {} }
		*	];
		*
		*	// Pre requested manifest responses
		*	var arManifests = [
		*		{
		*			apps: ['<div>Example App!</div>'],
		*			inlineScripts: [],
		*			scripts: ['http://www.domain.com/js/AppClass.js'],
		*			styles: ['http://www.domain.com/css/AppStyles.css']
		*		},
		*		{
		*			apps: ['<div>Example App 2!</div>'],
		*			inlineScripts: [],
		*			scripts: ['http://www.domain.com/js/App2Class.js'],
		*			styles: ['http://www.domain.com/css/App2Styles.css'] 
		*		}
		*	];
		*	
		*	F2.init();
		*	F2.load(arConfigs, arManifests);
		*/
	F2.load = function(appConfigs) {
		if (appConfigs instanceof Array === false) {
			appConfigs = [appConfigs];
		}

		var deferred = Defer.deferred();
		var appsByUrl = {};
		var numUrlsToRequest = 0;

		// Get an obj of appIds keyed by manifestUrl
		for (var i = 0, len = appConfigs.length; i < len; i++) {
			if (!appsByUrl[appConfigs[i].manifestUrl]) {
				appsByUrl[appConfigs[i].manifestUrl] = [];
				numUrlsToRequest += 1;
			}

			appsByUrl[appConfigs[i].manifestUrl].push(appIds[i]);
		}

		// Obj that holds all the xhr responses
		var responses = [{
			scripts: [],
			styles: [],
			inlineScripts: [],
			apps: []
		}];

		// Request all apps from each url
		for (var url in appsByUrl) {
			$.ajax({
				url: url,
				type: "post",
				data: {
					params: JSON.stringify(appsByUrl[url])
				},
				success: function(response) {
					if (response && _.isObject(response)) {
						responses.push(response);
					}

					// See if we've finished requesting all the apps
					if (--numUrlsToRequest === 0 && responses.length > 1) {
						// Combine all the valid responses
						var combined = _.extend.apply(_, responses);

						// Load the styles
						// We don't need to wait for these to finish since there's not a reliable way to tell
						_loadStyles(combined.styles);

						// Let the container add the html to the page
						// Get back an obj keyed by AppId that contains the root and instanceId
						var appDataById = _loadHtml(combined.apps, deferred);

						// Add the scripts and, once finished, instantiate the app classes
						_loadScripts(combined.scripts, combined.inlineScripts, function() {
							_loadApps(appDataById);
						});
					}
				}
			});
		}

		return deferred.promise;
	};

	// Return the singleton instance
	return F2;

});