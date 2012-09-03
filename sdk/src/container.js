/**
 * Core Container functionality
 * @module f2
 * @class F2
 */
F2.extend('', (function(){

	var _apps = {};
	var _config = {};

	/**
	 * Renders the html for an App.
	 * @method _getAppHtml
	 * @private
	 * @param {F2.App} app The App object
	 * @param {string} html The string of html
	 */
	var _getAppHtml = function(app, html) {

		function outerHtml(html) {
			return $('<div></div>').append(html).html();
		}

		// apply APP_CONTAINER class
		html = outerHtml($(html).addClass(F2.Constants.Css.APP_CONTAINER + ' app' + app.appId));

		// optionally apply wrapper html
		if (_config.appWrapper) {
			html = _config.appWrapper(app, html);
		}

		// apply APP class and instanceId
		return outerHtml($(html).addClass(F2.Constants.Css.APP).attr('id', app.instanceId));
	};

	/**
	 * Adds properties and methods to the App object
	 * @method _hydrateApp
	 * @private
	 * @param {F2.App} app The App object
	 */
	var _hydrateApp = function(app) {

		// create the instanceId for the App
		app.instanceId = app.instanceId || F2.guid();

		app.setTitle = function(title) {

			if (F2.Rpc.isRemote(this.instanceId)) {
				F2.Rpc.call(
					this.instanceId,
					F2.Constants.Sockets.APP_RPC,
					'setTitle',
					[
						title
					]
				);
			} else {
				$('#' + this.instanceId).find('.' + F2.Constants.Css.APP_TITLE).text(title);
			}
		};

		app.updateHeight = function(height) {

			height = height || $('#' + this.instanceId).outerHeight();

			if (F2.Rpc.isRemote(this.instanceId)) {
				F2.Rpc.call(
					this.instanceId,
					F2.Constants.Sockets.APP_RPC,
					'updateHeight',
					[
						height
					]
				);
			} else {
				this.height = height;
				$('#' + this.instanceId).find('iframe').height(this.height);
			}
		};
	};

	/**
	 * Attach App events
	 * @method _initAppEvents
	 * @private
	 */
	var _initAppEvents = function (app) {

		var appContainer = $('#' + app.instanceId);

		// these events should only be attached outside of the secure app
		if (!_config.isSecureAppPage) {

			// it is assumed that all containers will at least have
			// F2.Constants.Views.HOME
			if (_config.supportedViews.length > 1) {
				$(appContainer).on('click', '.' + F2.Constants.Css.APP_VIEW_TRIGGER + '[' + F2.Constants.Views.DATA_ATTRIBUTE + ']', function(event) {

					var view = $(this).attr(F2.Constants.Views.DATA_ATTRIBUTE);

					// handle the special REMOVE view
					if (view == F2.Constants.Views.REMOVE) {
						F2.removeApp(app.instanceId);

					// make sure the app supports this type of view
					} else if (F2.inArray(view, app.views)) {
						// tell the app that the view has changed
						F2.Events.emit(F2.Constants.Events.APP_VIEW_CHANGE + app.instanceId, view);
					}
				});
			}
		}
	};

	/**
	 * Attach Container Events
	 * @method _initContainerEvents
	 * @private
	 */
	var _initContainerEvents = function() {

		var resizeTimeout;
		var resizeHandler = function() {
			F2.Events.emit(F2.Constants.Events.CONTAINER_WIDTH_CHANGE);
		};

		$(window).on('resize', function() {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(resizeHandler, 100);
		});
	};

	/**
	 * Loads the App's html/css/javascript
	 * @method loadApp
	 * @private
	 * @param {Array} apps An array of {{#crossLink "F2.App"}}{{/crossLink}}
	 * objects
	 * @param {F2.AppManifest} [appManifest] The AppManifest object
	 */
	var _loadApps = function(apps, appManifest) {

		apps = [].concat(apps);

		// check for secure app
		if (apps.length == 1 && apps[0].isSecure && !_config.isSecureAppPage) {
			_loadSecureApp(apps[0], appManifest);
			return;
		}

		// check that the number of apps in manifest matches the number requested
		if (apps.length != appManifest.apps.length) {
			F2.log('The number of Apps defined in the AppManifest do not match the number requested.', appManifest);
		}

		var scripts = appManifest.scripts || [];
		var styles = appManifest.styles || [];
		var inlines = appManifest.inlineScripts || [];
		var scriptCount = scripts.length;
		var scriptsLoaded = 0;
		var appInit = function() {
			$.each(apps, function(i, a) {
				if (F2.Apps[a.appId] !== undefined) {
					if (typeof F2.Apps[a.appId] === 'function') {
						F2.Apps[a.appId].appClass = new F2.Apps[a.appId](a, appManifest.apps[i]);
						if (F2.Apps[a.appId].appClass['init'] !== undefined) {
							F2.Apps[a.appId].appClass.init();
						}
					} else {
						F2.log('App initialization class is defined but not a function. (' + a.appId + ')');
					}
				}
			});
		};

		// load styles
		var stylesFragment = [];
		$.each(styles, function(i, e) {
			stylesFragment.push('<link rel="stylesheet" type="text/css" href="' + e + '"/>');
		});
		$('head').append(stylesFragment.join(''));

		// load html
		$.each(appManifest.apps, function(i, a) {
			// load html
			_writeAppHtml(apps[i], _getAppHtml(apps[i], a.html));
			// init events
			_initAppEvents(apps[i]);
		});

		// load scripts and eval inlines once complete
		$.each(scripts, function(i, e) {
			$.ajax({
				url:e,
				async:false,
				dataType:'script',
				type:'GET',
				success:function() {
					if (++scriptsLoaded == scriptCount) {
						$.each(inlines, function(i, e) {
							try {
								eval(e);
							} catch (exception) {
								F2.log('Error loading inline script: ' + exception + '\n\n' + e);
							}
						});
						// fire the load event to tell the App it can proceed
						appInit();
					}
				},
				error:function(jqxhr, settings, exception) {
					F2.log(['Failed to load script (' + e +')', exception.toString()]);
				}
			});
		});

		// if no scripts were to be processed, fire the appLoad event
		if (!scriptCount) {
			appInit();
		}
	};

	/**
	 * Loads the App's html/css/javascript into an iframe
	 * @method loadSecureApp
	 * @private
	 * @param {F2.App} app The App's context object.
	 * @param {F2.AppManifest} appManifest The App's html/css/js to be loaded into the
	 * page.
	 */
	var _loadSecureApp = function(app, appManifest) {

		// make sure the Container is configured for secure apps
		if (_config.secureAppPagePath) {
			// create the html container for the iframe
			_writeAppHtml(app, _getAppHtml(app, '<div></div>'));
			// init events
			_initAppEvents(app);
			// create RPC socket
			F2.Rpc.register(app, appManifest);
		} else {
			F2.log('Unable to load secure app: \"secureAppPagePath\" is not defined in ContainerConfiguration.');
		}
	};

	/**
	 * Checks if the App is valid
	 * @method _validateApp
	 * @private
	 * @param {F2.App} app The App object
	 * @returns {bool} True if the App is valid
	 */
	var _validateApp = function(app) {

		// check for valid App configurations
		if (!app.appId) {
			F2.log('"appId" missing from App object');
			return false;
		} else if (!app.manifestUrl) {
			F2.log('manifestUrl" missing from App object');
			return false;
		} else if (!app.views || !F2.inArray(F2.Constants.Views.HOME, app.views)) {
			F2.log('views" not defined or missing "F2.Constants.Views.HOME" view.');
			return false;
		}

		return true;
	};

	/**
	 * Appends the App's html to the DOM
	 * @method _writeAppHtml
	 * @private
	 * @param {F2.App} app The App object
	 * @param {string} html The string of html
	 * @return {Element} The DOM Element that contains the App
	 */
	var _writeAppHtml = function(app, html) {
		var handler = _config.appWriter || function(app, html) {
			$('body').append(html);
		};
		handler(app, html);

		return $('#' + app.instanceId).get(0);
	};

	return {
		/**
		 * Description of Events goes here
		 * @class F2.Events
		 */
		Events:(function() {
			// init EventEmitter
			var events = new EventEmitter2({
				wildcard:true
			});

			// unlimited listeners, set to > 0 for debugging
			events.setMaxListeners(0);

			return {
				/**
				 * Same as F2.Events.emit except that it will not send the event
				 * to all sockets.
				 * @method _socketEmit
				 * @private
				 * @param {string} event The event name
				 * @param {object} [arg]* The arguments to be passed
				 */
				_socketEmit:function() {
					return EventEmitter2.prototype.emit.apply(events, [].slice.call(arguments));
				},
				/**
				 * Execute each of the listeners tha may be listening for the specified
				 * event name in order with the list of arguments
				 * @method emit
				 * @param {string} event The event name
				 * @param {object} [arg]* The arguments to be passed
				 */
				emit:function() {
					F2.Rpc.broadcast(F2.Constants.Sockets.EVENT, [].slice.call(arguments));
					return EventEmitter2.prototype.emit.apply(events, [].slice.call(arguments));
				},
				/**
				 * Adds a listener that will execute n times for the event before being 
				 * removed. The listener is invoked only the first time the event is 
				 * fired, after which it is removed.
				 * @method many
				 * @param {string} event The event name
				 * @param {int} timesToListen The number of times to execute the event
				 * before being removed
				 * @param {function} listener The function to be fired when the event is
				 * emitted
				 */
				many:function(event, timesToListen, listener) {
					return events.many(event, timesToListen, listener);
				},
				/**
				 * Remove a listener for the specified event.
				 * @method off
				 * @param {string} event The event name
				 * @param {function} listener The function that will be removed
				 */
				off:function(event, listener) {
					return events.off(event, listener);
				},
				/**
				 * Adds a listener for the specified event
				 * @method on
				 * @param {string} event The event name
				 * @param {function} listener The function to be fired when the event is
				 * emitted
				 */
				on:function(event, listener){
					return events.on(event, listener);
				},
				/**
				 * Adds a one time listener for the event. The listener is invoked only
				 * the first time the event is fired, after which it is removed.
				 * @method once
				 * @param {string} event The event name
				 * @param {function} listener The function to be fired when the event is
				 * emitted
				 */
				once:function(event, listener) {
					return events.once(event, listener);
				}
			};
		})(),
		/**
		 * Gets the current list of Apps in the container
		 * @method getContainerState
		 * @returns {Array} An array of objects containing the appId and...
		 * @for F2
		 */
		getContainerState:function() {
			return $.map(_apps, function(e, i) {
				return { appId: e.app.appId };
			});
		},
		/**
		 * Initializes the Container. This method must be called before performing
		 * any other actions in the Container.
		 * @method init
		 * @param {F2.ContainerConfiguration} config The configuration object
		 * @for F2
		 */
		init:function(config) {
			_config = config;

			F2.Rpc.init(_config.secureAppPagePath);

			if (!_config.isSecureAppPage) {
				_initContainerEvents();
			}
		},
		/**
		 * Begins the loading process for all Apps. The App will
		 * be passed the {{#crossLink "F2.App"}}{{/crossLink}} object which will
		 * contain the App's unique instanceId within the Container. Optionally, the
		 * {{#crossLink "F2.AppManifest"}}{{/crossLink}} can be passed in and those
		 * assets will be used instead of making a request.
		 * @method registerApps
		 * @param {Array} apps An array of {{#crossLink "F2.App"}}{{/crossLink}}
		 * objects
		 * @param {Array} [appManifests] An array of
		 * {{#crossLink "F2.AppManifest"}}{{/crossLink}}
		 * objects. This array must be the same length as the apps array that is
		 * objects. This array must be the same length as the apps array that is
		 * passed in. This can be useful if Apps are loaded on the server-side and
		 * passed down to the client.
		 */
		registerApps:function(apps, appManifests) {

			var appStack = [];
			var batches = {};
			var callbackStack = {};
			var haveManifests = false;
			apps = [].concat(apps);
			appManifests = appManifests || [];
			haveManifests = !!appManifests.length;

			// ensure that the array of apps and manifests are qual
			if (apps.length && haveManifests && apps.length != appManifests.length) {
				F2.log('The length of "apps" does not equal the length of "appManifests"');
				return;
			}

			// validate each app and assign it an instanceId
			// then determine which apps can be batched together
			$.each(apps, function(i, a) {

				if (!_validateApp(a)) {
					return; // move to the next app
				}

				// add properties and methods
				_hydrateApp(a);

				// save app
				_apps[a.instanceId] = { app:a };

				// if we have the manifest, go ahead and load the app
				if (haveManifests) {
					_loadApps(a, appManifests[i]);
				} else {
					// check if this app can be batched
					if (a.enableBatchRequests && !a.isSecure) {
						batches[a.manifestUrl.toLowerCase()] = batches[a.manifestUrl.toLowerCase()] || [];
						batches[a.manifestUrl.toLowerCase()].push(a);
					} else {
						appStack.push({
							apps:[a],
							url:a.manifestUrl
						});
					}
				}
			});

			// we don't have the manifests, go ahead and load them
			if (!haveManifests) {
				// add the batches to the appStack
				$.each(batches, function(i, b) {
					appStack.push({ url:i, apps:b })
				});

				// if an App is being loaded more than once on the page, there is the
				// potential that the jsonp callback will be clobbered if the request
				// for the AppManifest for the app comes back at the same time as
				// another request for the same app.  We'll create a callbackStack
				// that will ensure that requests for the same app are loaded in order
				// rather than at the same time
				$.each(appStack, function(i, req) {
					// define the callback function based on the first app's App ID
					var jsonpCallback = F2.Constants.JSONP_CALLBACK + req.apps[0].appId;

					// push the request onto the callback stack
					callbackStack[jsonpCallback] = callbackStack[jsonpCallback] || [];
					callbackStack[jsonpCallback].push(req);
				});

				// loop through each item in the callback stack and make the request
				// for the AppManifest. When the request is complete, pop the next 
				// request off the stack and make the request.
				$.each(callbackStack, function(i, requests) {

					var manifestRequest = function(jsonpCallback, req) {
						if (!req) { return; }

						$.ajax({
							url:req.url,
							data:{
								params:F2.stringify(req.apps)
							},
							jsonp:false, /* do not put 'callback=' in the query string */
							jsonpCallback:jsonpCallback, /* Unique function name */
							dataType:'jsonp',
							success:function(appManifest) {
								_loadApps(req.apps, appManifest);
							},
							error:function(jqxhr, settings, exception) {
								F2.log('Failed to load app(s)', exception.toString(), req.apps);
							},
							complete:function() {
								manifestRequest(i, requests.pop());
							}
						});
					};
					manifestRequest(i, requests.pop());
				});
			}
		},
		/**
		 * Removes all Apps from the Container
		 * @method removeAllApps
		 */
		removeAllApps:function() {
			$.each(_apps, function(i, a) {
				F2.removeApp(a.instanceId);
			});
		},
		/**
		 * Removes an App from the Container
		 * @method removeApp
		 * @param {string} instanceId The App's instanceId
		 */
		removeApp:function(instanceId) {
			if (_apps[instanceId]) {
				delete _apps[instanceId];
				$('#' + instanceId).fadeOut(function() {
					$(this).remove();
				});
			}
		}
	};
})());