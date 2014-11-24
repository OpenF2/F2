describe('F2.registerApps - pre-load', function() {

	it('should throw exception if F2.init() is not called prior', function() {
		expect(function() {

			var appConfig = {
				appId: TEST_APP_ID,
				manifestUrl: TEST_MANIFEST_URL,
				root: $("body").find("div." + TEST_APP_ID + ":first").get(0)
			};

			F2.registerApps([appConfig]);
		}).toLog('F2.init() must be called before F2.registerApps()');
	});

	it('should throw exception if no appConfigs are passed.', function() {
		expect(function() {
			F2.init();
			F2.registerApps();
		}).toLog('At least one AppConfig must be passed when calling F2.registerApps()');
	});

	it('should allow you to pass single appConfig as object to F2.registerApps', function() {
		expect(function() {
			F2.init();
			var appConfig = {
				appId: TEST_APP_ID,
				root: $("body").find("div." + TEST_APP_ID + ":first").get(0)
			};
			F2.registerApps(appConfig);
		}).not.toThrow();
	});

	it('should not require appConfig.manifestUrl when passing pre-load appConfig to F2.registerApps', function() {
		expect(function() {
			F2.init();
			var appConfig = {
				appId: TEST_APP_ID,
				root: $("body").find("div." + TEST_APP_ID + ":first").get(0)
			};
			F2.registerApps(appConfig);
		}).not.toLog('"manifestUrl" missing from app object');
	});

	it('should throw exception if you pass an invalid appConfig to F2.registerApps', function() {
		expect(function() {
			F2.init();
			F2.registerApps({});
		}).toLog('"appId" missing from app object');
	});

	it('should request apps without valid root property and auto init pre-load apps with root when passing mix to F2.registerApps', function() {
		var bAfterFired = false
		F2.PreloadTestComplete = false;
		F2.PreloadAppInitialized = false;
		F2.PreloadRetrievedEmit = false;

		var appConfigs = [{
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		}, {
			appId: TEST_APP_ID,
			root: $("body").find('div.' + TEST_APP_ID + ':first').get(0)
		}];

		F2.init();

		F2.AppHandlers.on(F2.AppHandlers.getToken(), F2.Constants.AppHandlers.APP_RENDER_AFTER, function() {
			bAfterFired = true;
		});

		F2.registerApps(appConfigs);

		waitsFor(
			function() {
				return bAfterFired;
			},
			'appRenderAfter was never fired',
			10000
		);

		runs(function() {
			F2.Events.emit("PreloadAppCommuncation", [true]);
			expect(bAfterFired).toBeTruthy();
			expect(F2.PreloadTestComplete).toBe(true);
			//expect(F2.PreloadRetrievedEmit).toBe(true);
		});
	});

	it('should allow you to init/register apps that are already on the page.', function() {

		F2.PreloadTestComplete = false;
		F2.PreloadAppInitialized = false;
		F2.PreloadRetrievedEmit = false;

		var appConfig = {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL,
			root: $("body").find("div." + TEST_APP_ID + ":first").get(0)
		};

		F2.init();

		// init is called above
		F2.registerApps([appConfig]);

		waitsFor(
			function() {
				return F2.PreloadAppInitialized;
			},
			'Emit retrieve was never fired',
			10000
		);

		runs(function() {
			// fires the emit to make sure the app is actually listening
			F2.Events.emit("PreloadAppCommuncation", [true]);
			expect(F2.PreloadTestComplete).toBe(true);
			expect(F2.PreloadRetrievedEmit).toBe(true);
			F2.removeApp(appConfig.removeApp);
		});
	});

	it('should allow you to init/register multiple of the same app that are already on the page.', function() {

		F2.PreloadTestComplete = false;
		F2.PreloadAppInitialized = false;
		F2.PreloadRetrievedEmit = false;
		F2.PreloadTestCompleteCounter = 0;
		F2.PreloadAppInitializedCounter = 0;
		F2.PreloadRetrievedEmitCounter = 0;

		var $appsOnPage = $("body").find("div." + TEST_APP_ID);
		var appConfigs = [{
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL,
			root: $appsOnPage.get(0)
		}, {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL,
			root: $appsOnPage.get(1)
		}];

		// init is called above
		F2.registerApps(appConfigs);

		waitsFor(
			function() {
				return (F2.PreloadAppInitializedCounter == 2);
			},
			'Emit retrieve was never fired',
			10000
		);

		runs(function() {
			// fires the emit to make sure the app is actually listening
			F2.Events.emit("PreloadAppCommuncation", [true]);
			expect(F2.PreloadTestCompleteCounter).toBe(2);
			expect(F2.PreloadRetrievedEmitCounter).toBe(2);
		});
	});
});

describe('F2.init', function() {

	var async = new AsyncSpec(this);
	async.beforeEachReloadF2();

	it('should allow for no parameters', function() {
		F2.init();
	});

	it('should allow for an empty object parameter', function() {
		F2.init({});
	});

});

describe('F2.init - loader overrides', function() {

	var async = new AsyncSpec(this);
	async.beforeEachReloadF2();

	var appConfig = {
		appId: TEST_APP_ID,
		manifestUrl: TEST_MANIFEST_URL
	};

	var appManifest = {
		scripts: [],
		styles: [],
		inlineScripts: [],
		apps: [{
			html: '<div class="test-app">Testing</div>'
		}]
	};

	it('should allow the container to provide a custom "loadScripts", "loadInlineScripts", "loadStyles" function', function() {
		var didCallScripts = false;
		var didCallInlineScripts = false;
		var didCallStyles = false;
		var didRender = false;

		F2.init({
			loadScripts: function(scripts, cb) {
				didCallScripts = true;
				cb();
			},
			loadInlineScripts: function(inlines, cb) {
				didCallInlineScripts = true;
				cb();
			},
			loadStyles: function(styles, cb) {
				didCallStyles = true;
				cb();
			},
			beforeAppRender: function() {
				didRender = true;
			}
		});

		F2.registerApps([appConfig], [appManifest]);

		waitsFor(function() {
			return didRender;
		}, 3000);

		runs(function() {
			expect(didCallScripts && didCallInlineScripts && didCallStyles).toBe(true);
		});
	});

	it('should not load scripts, inlines, or styles if the user provides overrides', function() {
		var didRender = false;
		var didLoadScripts = false;
		var didLoadInlineScripts = false;
		var didLoadStyles = false;

		F2.init({
			loadScripts: function(scripts, cb) {
				cb();
			},
			loadInlineScripts: function(inlines, cb) {
				cb();
			},
			loadStyles: function(styles, cb) {
				cb();
			},
			beforeAppRender: function() {
				didRender = true;
			}
		});

		F2.registerApps([appConfig], [{
			'inlineScripts': ['window.inlinesLoaded = true;'],
			'scripts': ['js/test_global.js'],
			'styles': ['css/test.css'],
			'apps': [{
				'html': '<div></div>'
			}]
		}]);

		waitsFor(function() {
			return didRender;
		}, 3000);

		// See if the script exists
		if (window.test_global) {
			didLoadScripts = true;
		}

		// See if the inlines exist
		if (window.inlinesLoaded) {
			didLoadInlineScripts = true;
		}

		// See if the styles exist
		$("head link[rel=stylesheet]").each(function(i, link) {
			if (link.href.indexOf("test.css") != -1) {
				didLoadStyles = true;
				return false;
			}
		});

		runs(function() {
			expect(didLoadScripts && didLoadInlineScripts && didLoadStyles).toBe(false);
		});
	});
});

describe('F2.init - xhr overrides', function() {
	var async = new AsyncSpec(this);
	async.beforeEachReloadF2(function() {
		// nothing to do after reload
	});

	it('should throw an exception when ContainerConfig.xhr is not an object or function', function() {
		expect(function() {
			F2.init({
				xhr: true
			});
		}).toThrow('ContainerConfig.xhr should be a function or an object');
	});

	it('should throw an exception when xhr.dataType is not a function', function() {
		expect(function() {
			F2.init({
				xhr: {
					dataType: true
				}
			});
		}).toThrow(new Error('ContainerConfig.xhr.dataType should be a function'));
	});

	it('should throw an exception when xhr.type is not a function', function() {
		expect(function() {
			F2.init({
				xhr: {
					type: true
				}
			});
			F2.registerApps(appConfig);
		}).toThrow(new Error('ContainerConfig.xhr.type should be a function'));
	});

	it('should throw an exception when xhr.url is not a function', function() {
		expect(function() {
			F2.init({
				xhr: {
					url: true
				}
			});
			F2.registerApps(appConfig);
		}).toThrow(new Error('ContainerConfig.xhr.url should be a function'));
	});
});

describe('F2.isInit', function() {

	var async = new AsyncSpec(this);
	async.beforeEachReloadF2();

	it('should return false when F2.init has not been called', function() {
		expect(F2.isInit()).toBeFalsy();
	});

	it('should return true when F2.init has been called', function() {
		F2.init();
		expect(F2.isInit()).toBeTruthy();
	});
});

describe('F2.registerApps - basic', function() {

	var async = new AsyncSpec(this);
	async.beforeEachReloadF2(function() {
		F2.init();
	});

	it('should fail on empty parameters', function() {
		expect(function() {
			F2.registerApps();
		}).toLog('At least one AppConfig must be passed when calling F2.registerApps()');
	});

	it('should fail when passed an empty array', function() {
		expect(function() {
			F2.registerApps([]);
		}).toLog('At least one AppConfig must be passed when calling F2.registerApps()');
	});

	it('should fail when the parameters are invalid', function() {
		expect(function() {
			F2.registerApps(null, []);
		}).toLog('At least one AppConfig must be passed when calling F2.registerApps()');
	});

	it('should fail when the AppConfig is invalid', function() {
		expect(function() {
			F2.registerApps({});
		}).toLog('"appId" missing from app object');

		expect(function() {
			F2.registerApps({
				appId: TEST_APP_ID
			});
		}).toLog('"manifestUrl" missing from app object');
	});

	it('should fail when the parameter lengths do not match', function() {
		expect(function() {
			F2.registerApps({
				appId: TEST_APP_ID,
				manifestUrl: TEST_MANIFEST_URL
			}, [{}, {}]);
		}).toLog('The length of "apps" does not equal the length of "appManifests"');
	});

	it('should not fail when a single appManifest is passed (#55)', function() {

		var passedMessage = false;
		F2.log = function(message) {
			passedMessage = true;
		};

		runs(function() {
			F2.registerApps({
				appId: TEST_APP_ID,
				manifestUrl: TEST_MANIFEST_URL
			}, {
				apps: [{
					html: '<div></div>'
				}]
			});
		});

		// wait long enough for registerApps to have failed
		waits(1000);

		// F2.log should not have run
		runs(function() {
			expect(passedMessage).toBeFalsy();
		});
	});

	it('should not modify the original AppConfig that was passed in', function() {
		var appConfig = {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
		F2.registerApps(appConfig);

		// original appConfig object should remain clean
		expect(appConfig.instanceId).toBeFalsy();
	});
});

describe('F2.registerApps - xhr overrides', function() {

	var async = new AsyncSpec(this);
	async.beforeEachReloadF2(function() {
		// nothing to do after reload
	});

	var appConfig = {
		appId: TEST_APP_ID,
		manifestUrl: TEST_MANIFEST_URL
	};

	it('should call xhr if it is defined', function() {
		var isFired = false;
		runs(function() {
			F2.init({
				xhr: function(url, apps, success, error, complete) {
					$.ajax({
			            url: url,
			            type: 'POST',
			            data: {
			                params: F2.stringify(apps[0], F2.appConfigReplacer)
			            },
			            jsonp: false, // do not put 'callback=' in the query string
			            jsonpCallback: F2.Constants.JSONP_CALLBACK + apps[0].appId, // Unique function name
			            dataType: 'json',
			            success: function(appManifest) {
			                // custom success logic
			                success(appManifest); // fire success callback
			            },
			            error: function() {
			                // custom error logic
			                error(); // fire error callback
			            },
			            complete: function() {
			                // custom complete logic
			                complete(); // fire complete callback
			            }
			        });
					isFired = true;
				}
			});
			F2.registerApps(appConfig);
		});
		waitsFor(function() {
			return isFired;
		});
		runs(function() {
			expect(isFired).toBeTruthy();
		})
	});

	it('should pass 5 parameters to xhr', function() {
		var isFired = false,
			numArgs = 0,
			urlParam, appConfigsParam, successParam, errorParam, completeParam;

		runs(function() {
			F2.init({
				xhr: function(url, appConfigs, success, error, complete) {
					numArgs = arguments.length;
					urlParam = url;
					appConfigsParam = appConfigs;
					successParam = success;
					errorParam = error;
					completeParam = complete;

					isFired = true;
				}
			});
			F2.registerApps(appConfig);
		});

		waitsFor(function() {
			return isFired;
		});

		runs(function() {
			expect(numArgs).toBe(5);
			expect(typeof urlParam).toBe('string');
			expect(appConfigsParam instanceof Array).toBeTruthy();
			expect(typeof successParam).toBe('function');
			expect(typeof errorParam).toBe('function');
			expect(typeof completeParam).toBe('function');
		})
	});

	it('should call xhr.dataType', function() {
		var isFired = false;
		runs(function() {
			F2.init({
				xhr: {
					dataType: function() {
						isFired = true;
						return 'jsonp';
					}
				}
			});
			F2.registerApps(appConfig);
		});
		waitsFor(function() {
			return isFired;
		}, 'xhr.dataType was not fired', 10000);
		runs(function() {
			expect(isFired).toBeTruthy();
		});
	});

	it('should throw an exception when xhr.dataType does not return a string', function() {
		expect(function() {
			F2.init({
				xhr: {
					dataType: function() {}
				}
			});
			F2.registerApps(appConfig);
		}).toThrow(new Error('ContainerConfig.xhr.dataType should return a string'));
	});

	it('should call xhr.type', function() {
		var isFired = false;
		F2.init({
			xhr: {
				type: function() {
					isFired = true;
					return 'GET';
				}
			}
		});
		F2.registerApps(appConfig);
		waitsFor(function() {
			return isFired;
		}, 'xhr.type was not fired', 10000);
		runs(function() {
			expect(isFired).toBeTruthy();
		});
	});

	it('should throw an exception when xhr.type does not return a string', function() {
		expect(function() {
			F2.init({
				xhr: {
					type: function() {}
				}
			});
			F2.registerApps(appConfig);
		}).toThrow(new Error('ContainerConfig.xhr.type should return a string'));
	});

	it('should call xhr.url', function() {
		var isFired = false;
		F2.init({
			xhr: {
				url: function() {
					isFired = true;
					return '/F2/apps/test/hello-world';
				}
			}
		});
		F2.registerApps(appConfig);
		waitsFor(function() {
			return isFired;
		}, 'xhr.url was not fired', 10000);
		runs(function() {
			expect(isFired).toBeTruthy();
		});
	});

	it('should throw an exception when xhr.url does not return a string', function() {
		expect(function() {
			F2.init({
				xhr: {
					url: function() {}
				}
			});
			F2.registerApps(appConfig);
		}).toThrow(new Error('ContainerConfig.xhr.url should return a string'));
	});

	itConditionally(window.F2_NODE_TEST_SERVER, 'should use POST when the domain of the container matches that of the app (#41, #59)', function() {

		var isPost = false,
			hasReturned = false;
		F2.log = function(message) {
			hasReturned = true;
			isPost = message;
		};

		runs(function() {
			F2.init({
				xhr: {
					dataType: function(url) {
						return F2.isLocalRequest(url) ? 'json' : 'jsonp';
					},
					type: function(url) {
						return F2.isLocalRequest(url) ? 'POST' : 'GET';
					}
				}
			});
			F2.registerApps({
				appId: 'com_test_app',
				manifestUrl: TEST_MANIFEST_URL_HTTP_POST
			});
		});

		// wait for registerApps to complete and load the app
		waitsFor(function() {
			return hasReturned;
		}, 'test app was never loaded', 10000);

		runs(function() {
			expect(isPost).toBeTruthy();
		});
	});

	itConditionally(window.F2_NODE_TEST_SERVER, 'should use GET when the domain of the container does not match that of the app (#41, #59)', function() {

		var isPost = false,
			hasReturned = false;
		F2.log = function(message) {
			hasReturned = true;
			isPost = message;
		};

		runs(function() {
			F2.init({
				xhr: {
					dataType: function(url) {
						return F2.isLocalRequest(url) ? 'json' : 'jsonp';
					},
					type: function(url) {
						return F2.isLocalRequest(url) ? 'POST' : 'GET';
					}
				}
			});
			F2.registerApps({
				appId: 'com_test_app',
				manifestUrl: 'http://www.openf2.org/httpPostTest'
			});
		});

		// wait for registerApps to complete and load the app
		waitsFor(function() {
			return hasReturned;
		}, 'test app was never loaded', 10000);

		runs(function() {
			expect(isPost).toBeFalsy();
		});
	});
});

describe('F2.registerApps - rendering', function() {

	var async = new AsyncSpec(this);
	async.beforeEachReloadF2(function() {
		// nothing to do after reload
	});

	var appConfig = {
		appId: TEST_APP_ID,
		manifestUrl: TEST_MANIFEST_URL
	};
	var appManifest = {
		scripts: [],
		styles: [],
		inlineScripts: [],
		apps: [{
			html: '<div class="test-app">Testing</div>'
		}]
	};

	it('should fire beforeAppRender when it is defined', function() {
		var isFired = false;
		F2.init({
			beforeAppRender: function() {
				isFired = true;
			}
		});
		F2.registerApps(appConfig, [appManifest]);
		waitsFor(function() {
			return isFired;
		}, 'beforeAppRender was never fired', 10000);
		runs(function() {
			expect(isFired).toBe(true);
		});
	});

	it('should allow beforeAppRender to return null', function() {
		F2.init({
			beforeAppRender: function() {
				return null;
			}
		});

		F2.registerApps(appConfig, [appManifest]);
	});


	it('should eval AppManifest.inlineScripts when AppManifest.scripts are defined', function() {
		F2.inlineScriptsEvaluated = false;
		F2.init();
		F2.registerApps([{
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		}], [{
			'inlineScripts': ['(function(){F2.inlineScriptsEvaluated=true;})()'],
			'scripts': ['js/test.js'],
			'apps': [{
				'html': '<div class="test-app-2">Testing</div>'
			}]
		}]);

		waitsFor(
			function() {
				return F2.inlineScriptsEvaluated;
			},
			'Inline scripts were never evaluated',
			10000
		);

		runs(function() {
			expect(F2.inlineScriptsEvaluated).toBe(true);
		});
	});

	it('should eval AppManifest.inlineScripts when AppManifest.scripts are not defined', function() {
		F2.inlineScriptsEvaluated = false;
		F2.init();
		F2.registerApps([{
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		}], [{
			'inlineScripts': ['(function(){F2.inlineScriptsEvaluated=true;})()'],
			'apps': [{
				'html': '<div class="test-app-2">Testing</div>'
			}]
		}]);
		waitsFor(
			function() {
				return F2.inlineScriptsEvaluated;
			},
			'Inline scripts were never evaluated',
			10000
		);

		runs(function() {
			expect(F2.inlineScriptsEvaluated).toBe(true);
		});
	});

	it('should add cache buster to AppManifest.scripts when F2.ContainerConfig.debugMode is true', function() {
		var bustedCache = false;
		F2.init({
			debugMode: true
		});
		F2.registerApps([{
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		}], [{
			'scripts': ['js/cacheBusterAdded.js'],
			'apps': [{
				'html': '<div class="test-app-2">Testing</div>'
			}]
		}]);
		runs(function() {

			$('script').each(function(idx, item) {
				var src = $(item).attr('src');
				//find script, test for cachebuster string
				if (/cacheBusterAdded.js\?cachebuster/.test(src)) {
					bustedCache = true;
					return false; //break from $.each
				}
			});

			expect(bustedCache).toBe(true);
		});
	});

	it('should not add cache buster to AppManifest.scripts when F2.ContainerConfig.debugMode is undefined or false', function() {
		var bustedCache = false;
		F2.init();
		F2.registerApps([{
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		}], [{
			'scripts': ['js/cacheBusterNotAdded.js'],
			'apps': [{
				'html': '<div class="test-app-2">Testing</div>'
			}]
		}]);

		runs(function() {

			$('script').each(function(idx, item) {
				var src = $(item).attr('src');
				//find script
				if (/cacheBusterNotAdded.js/.test(src)) {
					bustedCache = /cachebuster/.test(src);
					return false; //break from $.each
				}
			});

			expect(bustedCache).toBe(false);
		});
	});	
});


describe('F2.loadPlaceholders - auto', function() {

	describe('single app by id', function() {
		// force F2 to be reloaded
		var async = new AsyncSpec(this);
		async.beforeEachReloadF2();

		beforeEach(function() {
			$('#test-fixture').append(
				'<div id="f2-autoload" data-f2-appid="' + TEST_APP_ID + '" data-f2-manifesturl="' + TEST_MANIFEST_URL + '"></div>'
			);
		});

		it('should automatically auto-init F2 when f2-autoload id is on the page', function() {
			// need to wait for dom ready before F2.init() will be called
			waitsFor(
				function() {
					return F2.isInit();
				},
				'F2.init() never called',
				3000
			);
			runs(function() {
				expect(F2.isInit()).toBe(true);
			});
		});

		it('should automatically find and register apps', function() {

			var children = 0;

			waitsFor(
				function() {
					children = $('#f2-autoload').children().length;
					return children;
				},
				'placeholder app to load',
				3000
			);

			runs(function() {
				expect(children).toEqual(1);
			});
		});
	});

	describe('single app by id, with children', function() {
		// force F2 to be reloaded
		var async = new AsyncSpec(this);
		async.beforeEachReloadF2();

		beforeEach(function() {
			$('#test-fixture').append(
				'<div id="f2-autoload" data-f2-appid="' + TEST_APP_ID + '" data-f2-manifesturl="' + TEST_MANIFEST_URL + '">',
					'<div data-f2-appid="' + TEST_APP_ID2 + '" data-f2-manifesturl="' + TEST_MANIFEST_URL2 + '"></div>',
				'</div>'
			);
		});

		it('should automatically find and register apps', function() {

			var children = 0;

			waitsFor(
				function() {
					children = $('#f2-autoload').children().length;
					return children;
				},
				'placeholder app to load',
				3000
			);

			runs(function() {
				expect(children).toEqual(1);
			});
		});

		it('should ignore apps within apps', function() {

			var proceed = false;
			var timeout;

			waitsFor(
				function() {
					// wait an arbitrary 5 seconds for the apps to load
					timeout = timeout || setTimeout(function() { proceed = true; }, 5000);
					return proceed;
				},
				'placeholder app to load',
				10000
			);

			runs(function() {
				expect($('#f2-autoload').children().length).toEqual(1);
				expect($('#f2-autoload [data-f2-appid]').length).toEqual(0);
			});
		});
	});

	describe('single app by attribute', function() {
		// force F2 to be reloaded
		var async = new AsyncSpec(this);
		async.beforeEachReloadF2();

		beforeEach(function() {
			$('#test-fixture').append(
				'<div data-f2-autoload data-f2-appid="' + TEST_APP_ID + '" data-f2-manifesturl="' + TEST_MANIFEST_URL + '"></div>'
			);
		});

		it('should automatically auto-init F2 when data-f2-autoload attribute is on the page', function() {
			// need to wait for dom ready before F2.init() will be called
			waitsFor(
				function() {
					return F2.isInit();
				},
				'F2.init() never called',
				3000
			);
			runs(function() {
				expect(F2.isInit()).toBe(true);
			});
		});

		it('should automatically find and register apps', function() {

			var children = 0;

			waitsFor(
				function() {
					children = $('#test-fixture [data-f2-appid]').children().length;
					return children;
				},
				'placeholder app to load',
				3000
			);

			runs(function() {
				expect(children).toEqual(1);
			});
		});
	});

	describe('single app by class', function() {
		// force F2 to be reloaded
		var async = new AsyncSpec(this);
		async.beforeEachReloadF2();

		beforeEach(function() {
			$('#test-fixture').append(
				'<div class="f2-autoload" data-f2-appid="' + TEST_APP_ID + '" data-f2-manifesturl="' + TEST_MANIFEST_URL + '"></div>'
			);
		});

		it('should automatically auto-init F2 when f2-autoload class is on the page', function() {
			// need to wait for dom ready before F2.init() will be called
			waitsFor(
				function() {
					return F2.isInit();
				},
				'F2.init() never called',
				3000
			);
			runs(function() {
				expect(F2.isInit()).toBe(true);
			});
		});

		it('should automatically find and register apps', function() {

			var children = 0;

			waitsFor(
				function() {
					children = $('#test-fixture [data-f2-appid]').children().length;
					return children;
				},
				'placeholder app to load',
				3000
			);

			runs(function() {
				expect(children).toEqual(1);
			});
		});
	});

	describe('single app by id, nested', function() {
		// force F2 to be reloaded
		var async = new AsyncSpec(this);
		async.beforeEachReloadF2();

		beforeEach(function() {
			$('#test-fixture').append([
				'<div id="f2-autoload">',
					'<div data-f2-appid="' + TEST_APP_ID + '" data-f2-manifesturl="' + TEST_MANIFEST_URL + '"></div>',
				'</div>'
			].join(''));
		});

		it('should automatically find and register apps', function() {

			var children = 0;

			waitsFor(
				function() {
					children = $('#f2-autoload [data-f2-appid]').children().length;
					return children;
				},
				'placeholder app to load',
				3000
			);

			runs(function() {
				expect(children).toEqual(1);
			});
		});
	});

	describe('single app by attribute, nested', function() {
		// force F2 to be reloaded
		var async = new AsyncSpec(this);
		async.beforeEachReloadF2();

		beforeEach(function() {
			$('#test-fixture').append([
				'<div id="f2-autoload-single" data-f2-autoload>',
					'<div data-f2-appid="' + TEST_APP_ID + '" data-f2-manifesturl="' + TEST_MANIFEST_URL + '"></div>',
				'</div>'
			].join(''));
		});

		it('should automatically find and register apps', function() {

			var children = 0;

			waitsFor(
				function() {
					children = $('#f2-autoload-single [data-f2-appid]').children().length;
					return children;
				},
				'placeholder app to load',
				3000
			);

			runs(function() {
				expect(children).toEqual(1);
			});
		});
	});

	describe('single app by class, nested', function() {
		// force F2 to be reloaded
		var async = new AsyncSpec(this);
		async.beforeEachReloadF2();

		beforeEach(function() {
			$('#test-fixture').append([
				'<div id="f2-autoload-single" class="f2-autoload">',
					'<div data-f2-appid="' + TEST_APP_ID + '" data-f2-manifesturl="' + TEST_MANIFEST_URL + '"></div>',
				'</div>'
			].join(''));
		});

		it('should automatically find and register apps', function() {

			var children = 0;

			waitsFor(
				function() {
					children = $('#f2-autoload-single [data-f2-appid]').children().length;
					return children;
				},
				'placeholder app to load',
				3000
			);

			runs(function() {
				expect(children).toEqual(1);
			});
		});
	});

	describe('many apps by id', function() {
		// force F2 to be reloaded
		var async = new AsyncSpec(this);
		async.beforeEachReloadF2();

		beforeEach(function() {
			$('#test-fixture').append([
				'<div id="f2-autoload">',
					'<div data-f2-appid="' + TEST_APP_ID + '" data-f2-manifesturl="' + TEST_MANIFEST_URL + '"></div>',
					'<div data-f2-appid="' + TEST_APP_ID2 + '" data-f2-manifesturl="' + TEST_MANIFEST_URL2 + '"></div>',
				'</div>'
			].join(''));
		});

		it('should automatically find and register multiple apps', function() {

			var children = 0;

			waitsFor(
				function() {
					children = $('#f2-autoload [data-f2-appid]').children().length;
					return children == 2;
				},
				'placeholder app to load',
				3000
			);

			runs(function() {
				expect(children).toEqual(2);
			});
		});
	});

	describe('many apps by attribute', function() {
		// force F2 to be reloaded
		var async = new AsyncSpec(this);
		async.beforeEachReloadF2();

		beforeEach(function() {
			$('#test-fixture').append([
				'<div id="f2-autoload-many" data-f2-autoload>',
					'<div data-f2-appid="' + TEST_APP_ID + '" data-f2-manifesturl="' + TEST_MANIFEST_URL + '"></div>',
					'<div data-f2-appid="' + TEST_APP_ID2 + '" data-f2-manifesturl="' + TEST_MANIFEST_URL2 + '"></div>',
				'</div>'
			].join(''));
		});

		it('should automatically find and register multiple apps', function() {

			var children = 0;

			waitsFor(
				function() {
					children = $('#f2-autoload-many [data-f2-appid]').children().length;
					return children == 2;
				},
				'placeholder app to load',
				3000
			);

			runs(function() {
				expect(children).toEqual(2);
			});
		});
	});

	describe('many apps by class', function() {
		// force F2 to be reloaded
		var async = new AsyncSpec(this);
		async.beforeEachReloadF2();

		beforeEach(function() {
			$('#test-fixture').append([
				'<div id="f2-autoload-many" class="f2-autoload">',
					'<div data-f2-appid="' + TEST_APP_ID + '" data-f2-manifesturl="' + TEST_MANIFEST_URL + '"></div>',
					'<div data-f2-appid="' + TEST_APP_ID2 + '" data-f2-manifesturl="' + TEST_MANIFEST_URL2 + '"></div>',
				'</div>'
			].join(''));
		});

		it('should automatically find and register multiple apps', function() {

			var children = 0;

			waitsFor(
				function() {
					children = $('#f2-autoload-many [data-f2-appid]').children().length;
					return children == 2;
				},
				'placeholder app to load',
				3000
			);

			runs(function() {
				expect(children).toEqual(2);
			});
		});
	});

	describe('many placeholders by attribute', function() {
		// force F2 to be reloaded
		var async = new AsyncSpec(this);
		async.beforeEachReloadF2();

		beforeEach(function() {
			$('#test-fixture').append([
				'<div data-f2-autoload>',
					'<div data-f2-appid="' + TEST_APP_ID + '" data-f2-manifesturl="' + TEST_MANIFEST_URL + '"></div>',
				'</div>',
				'<div data-f2-autoload>',
					'<div data-f2-appid="' + TEST_APP_ID2 + '" data-f2-manifesturl="' + TEST_MANIFEST_URL2 + '"></div>',
				'</div>',
			].join(''));
		});

		it('should automatically find and register apps within multiple placeholders', function() {

			var children = 0;

			waitsFor(
				function() {
					children = $('#test-fixture [data-f2-appid]').children().length;
					return children == 2;
				},
				'placeholder app to load',
				3000
			);

			runs(function() {
				expect(children).toEqual(2);
			});
		});
	});

	describe('many placeholders by class', function() {
		// force F2 to be reloaded
		var async = new AsyncSpec(this);
		async.beforeEachReloadF2();

		beforeEach(function() {
			$('#test-fixture').append([
				'<div class="f2-autoload">',
					'<div data-f2-appid="' + TEST_APP_ID + '" data-f2-manifesturl="' + TEST_MANIFEST_URL + '"></div>',
				'</div>',
				'<div class="f2-autoload">',
					'<div data-f2-appid="' + TEST_APP_ID2 + '" data-f2-manifesturl="' + TEST_MANIFEST_URL2 + '"></div>',
				'</div>',
			].join(''));
		});

		it('should automatically find and register apps within multiple placeholders', function() {

			var children = 0;

			waitsFor(
				function() {
					children = $('#test-fixture [data-f2-appid]').children().length;
					return children == 2;
				},
				'placeholder app to load',
				3000
			);

			runs(function() {
				expect(children).toEqual(2);
			});
		});
	});
});

describe('F2.loadPlaceholders - manual', function() {
	// force F2 to be reloaded
	var async = new AsyncSpec(this);
	async.beforeEachReloadF2();

	// add the f2-autoload element to the test fixture for use in each
	// test
	beforeEach(function() {
		$('#test-fixture').append('<div id="f2-autoload"></div>');
	});

	it('should require the presence of data-f2-manifesturl', function() {
		// add the invalid placeholder
		$('#f2-autoload').append('<div data-f2-appid="' + TEST_APP_ID + '"></div>');

		// even though the manifesturl is missing, the message is generic because a null AppConfig was generated
		expect(function() {
			F2.init();
			F2.loadPlaceholders();
		}).toLog('"appId" missing from app object');
	});

	it('should find and register apps', function() {

		// add the placeholder
		var $f2Autoload = $('<div id="f2-autoload" />');
		$f2Autoload.append('<div data-f2-appid="' + TEST_APP_ID + '" data-f2-manifesturl="' + TEST_MANIFEST_URL + '"></div>');
		$('#test-fixture').append($f2Autoload);

		F2.init();
		F2.loadPlaceholders();

		var children = 0;

		waitsFor(
			function() {
				children = $('#f2-autoload [data-f2-appid]').children().length;
				return children;
			},
			'app never loaded',
			3000
		);

		runs(function() {
			expect(children).toEqual(1);
		});
	});

	it('should find and register multiple apps', function() {
		// add the placeholder
		var $f2Autoload = $('<div id="f2-autoload" />');
		$f2Autoload
			.append('<div data-f2-appid="' + TEST_APP_ID + '" data-f2-manifesturl="' + TEST_MANIFEST_URL + '"></div>')
			.append('<div data-f2-appid="' + TEST_APP_ID2 + '" data-f2-manifesturl="' + TEST_MANIFEST_URL2 + '"></div>');
		$('#test-fixture').append($f2Autoload);

		F2.init();
		F2.loadPlaceholders();

		var children = 0;

		waitsFor(
			function() {
				children = $('#f2-autoload [data-f2-appid]').children().length;
				return children == 2;
			},
			'app never loaded',
			5000
		);

		runs(function() {
			expect(children).toEqual(2);
		});
	});

	it('should throw an exception when an invalid parentNode is passed', function() {
		expect(function() {
			F2.init();
			F2.loadPlaceholders('foo');
		}).toThrow('"parentNode" must be null or a DOM node');
	});

	it('should find and register apps within a given scope', function() {
		// add the placeholder
		var $f2Autoload = $('<div id="f2-autoload" />');
		$f2Autoload
			.append('<div data-f2-appid="' + TEST_APP_ID + '" data-f2-manifesturl="' + TEST_MANIFEST_URL + '"></div>');
		$('#test-fixture').append($f2Autoload);

		F2.init();
		F2.loadPlaceholders(document.getElementById('test-fixture'));

		var children = 0;

		waitsFor(
			function() {
				children = $('#f2-autoload [data-f2-appid]').children().length;
				return children;
			},
			'app never loaded',
			3000
		);

		runs(function() {
			expect(children).toEqual(1);
		});
	});
});
