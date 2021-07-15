describe('F2.registerApps - pre-load', function() {

	beforeEachReloadF2(function() {
		spyOn(console, 'log').and.callThrough();
		// refresh the preloaded apps since the F2/F2.Apps namespace was wiped out
		window.F2_PRELOADED.forEach(f => f());
	});
	afterEachDeleteTestScripts();

	it('should throw exception if F2.init() is not called prior', function() {
		var appConfig = {
			appId: TEST_PRELOADED_APP_ID,
			manifestUrl: TEST_PRELOADED_MANIFEST_URL,
			root: document.querySelector(`div.${TEST_PRELOADED_APP_ID}`)
		};
		F2.registerApps([appConfig]);

		expect(console .log).toHaveBeenCalledWith('F2.init() must be called before F2.registerApps()');
	});

	it('should throw exception if no appConfigs are passed.', function() {
		F2.init();
		F2.registerApps();
		expect(console.log).toHaveBeenCalledWith('At least one AppConfig must be passed when calling F2.registerApps()');
	});

	it('should allow you to pass single appConfig as object to F2.registerApps', function() {
		expect(function() {
			F2.init();
			var appConfig = {
				appId: TEST_PRELOADED_APP_ID,
				root: document.querySelector(`div.${TEST_PRELOADED_APP_ID}`)
			};
			F2.registerApps(appConfig);
		}).not.toThrow();
	});

	it('should not require appConfig.manifestUrl when passing pre-load appConfig to F2.registerApps', function() {
		F2.init();
		var appConfig = {
			appId: TEST_PRELOADED_APP_ID,
			root: document.querySelector(`div.${TEST_PRELOADED_APP_ID}`)
		};
		F2.registerApps(appConfig);
		expect(console.log).not.toHaveBeenCalledWith('"manifestUrl" missing from app object');
	});

	it('should throw exception if you pass an invalid appConfig to F2.registerApps', function() {
		F2.init();
		F2.registerApps({});
		expect(console.log).toHaveBeenCalledWith('"appId" missing from app object');
	});

	it('should request apps without valid root property and auto init pre-load apps with root when passing mix to F2.registerApps', function(done) {
		// we're basically looking to ensure that the second app passed in gets
		// initialized properly because it already existed on the page
		var appConfigs = [{
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		}, {
			appId: TEST_PRELOADED_APP_ID,
			root: document.querySelector(`div.${TEST_PRELOADED_APP_ID}`)
		}];

		F2.init();

		F2.AppHandlers.on(
			F2.AppHandlers.getToken(),
			F2.Constants.AppHandlers.APP_RENDER_AFTER,
			function() {
				F2.Events.emit('PreloadAppTestOne', 'one');
			}
		);

		F2.Events.on('PreloadAppResponseOne', function(val) {
			expect(val).toBe('one');
			done();
		});

		F2.registerApps(appConfigs);
	});

	it('should allow you to init/register multiple of the same app that are already on the page.', function(done) {

		var appsOnPage = document.querySelectorAll(`div.${TEST_PRELOADED_APP_ID}`);
		var appConfigs = [{
			appId: TEST_PRELOADED_APP_ID,
			context: {
				app: 1
			},
			manifestUrl: TEST_PRELOADED_MANIFEST_URL,
			root: appsOnPage[0]
		}, {
			appId: TEST_PRELOADED_APP_ID,
			context: {
				app: 2
			},
			manifestUrl: TEST_PRELOADED_MANIFEST_URL,
			root: appsOnPage[1]
		}];

		F2.init();

		var appResponseCount = 0;
		F2.Events.on('PreloadAppResponseTwo', function(val) {
			expect(val).toBeTruthy();
			appResponseCount++;

			if (appResponseCount === 2) {
				done();
			}
		});

		F2.registerApps(appConfigs);
	});

	// TODO: This is currently broken in that F2 is treating the existing element
	// on the page as a placeholder element and therefore refusing to load the
	// appManifest.
	// See container.js line 979
	//
	it('should pass appConfig, appContent, and root to preloaded AppClasses when given AppContent', function(done) {

		var appConfig = {
			appId:'com_openf2_tests_preloaded_argtester',
			root: document.querySelector('div.com_openf2_tests_preloaded_argtester')
		};
		var appManifest = {
			scripts: ["/tests/apps/com_openf2_tests_preloaded_argtester/appclass.js"],
			apps: [{
				html: '<div class="test-app-2">Testing</div>'
			}]
		};

		F2.init();

		F2.Events.on('PreloadAppArgumentCount', function(count) {
			expect(count).toEqual(3);
			done();
		});

		F2.registerApps(appConfig, appManifest);
	});
});

describe('F2.init', function() {

	beforeEachReloadF2();

	it('should allow for no parameters', function() {
		expect(function() {
			F2.init();
		}).not.toThrow();
	});

	it('should allow for an empty object parameter', function() {
		expect(function() {
			F2.init({});
		}).not.toThrow();
	});

});

describe('F2.init - xhr overrides', function() {

	beforeEachReloadF2();

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
		}).toThrow('ContainerConfig.xhr.dataType should be a function');
	});

	it('should throw an exception when xhr.type is not a function', function() {
		expect(function() {
			F2.init({
				xhr: {
					type: true
				}
			});
			F2.registerApps(appConfig);
		}).toThrow('ContainerConfig.xhr.type should be a function');
	});

	it('should throw an exception when xhr.url is not a function', function() {
		expect(function() {
			F2.init({
				xhr: {
					url: true
				}
			});
			F2.registerApps(appConfig);
		}).toThrow('ContainerConfig.xhr.url should be a function');
	});
});

describe('F2.isInit', function() {

	beforeEachReloadF2();

	it('should return false when F2.init has not been called', function() {
		expect(F2.isInit()).toBeFalsy();
	});

	it('should return true when F2.init has been called', function() {
		F2.init();
		expect(F2.isInit()).toBeTruthy();
	});
});

describe('F2.init - internationalization', function() {

	beforeEachReloadF2();
	afterEachDeleteTestScripts();

	var appConfig = {
		appId: TEST_APP_ID,
		manifestUrl: TEST_MANIFEST_URL,
		localeSupport: ['en-us','de-de']
	};

	var appManifest = {
		scripts: [],
		styles: [],
		inlineScripts: [],
		apps: [{
			html: '<div class="test-app-2">Testing</div>'
		}]
	};

	it('should not fail F2.init when locale is undefined', function() {
		F2.init();
		//F2.registerApps(appConfig,appManifest);
		expect(F2.isInit()).toBeTruthy();
	});

	it('F2.getContainerLocale() should return null when locale is undefined', function() {
		F2.init();
		//F2.registerApps(appConfig,appManifest);
		expect(F2.getContainerLocale()).toBe(null);
	});

	it('F2.getContainerLocale() should return current locale', function() {
		F2.init({
			locale: 'en-us'
		});
		//F2.registerApps(appConfig,appManifest);
		expect(F2.getContainerLocale()).toBe('en-us');
	});

	it('F2.getContainerLocale() should be a string', function() {
		F2.init({
			locale: 'en-us'
		});
		//F2.registerApps(appConfig,appManifest);
		expect(typeof F2.getContainerLocale() === 'string').toBeTruthy();
	});

	it('F2.getContainerLocale() should be a valid IETF tag', function() {
		F2.init({
			locale: 'en-us'
		});
		//F2.registerApps(appConfig,appManifest);
		//see http://www.w3.org/TR/xmlschema11-2/#language
		expect( /[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*/.test( F2.getContainerLocale() ) ).toBeTruthy();
	});

	it('should not modify original appConfig', function() {
		F2.init({
			locale: 'en-us'
		});
		F2.registerApps(appConfig,appManifest);
		expect(appConfig.containerLocale).toBeFalsy();
		expect(appConfig.locale).toBeFalsy();
	});

	it('app should receive locale as "containerLocale" in appConfig', function(done) {
		F2.init({
			locale: 'en-us'
		});

		F2.registerApps({
			appId: TEST_APP_ID3,
			manifestUrl: TEST_MANIFEST_URL3
		});

		F2.Events.on('com_openf2_examples_nodejs_helloworld-init', data => {
			expect(data.testLocaleFromAppConfig).toEqual(F2.getContainerLocale());
			done();
		});
	});

	it('app should not receive locale as "containerLocale" in appConfig when locale is not defined', function(done) {
		F2.init();

		F2.registerApps({
			appId: TEST_APP_ID3,
			manifestUrl: TEST_MANIFEST_URL3
		});

		F2.Events.on('com_openf2_examples_nodejs_helloworld-init', data => {
			expect(data.testLocaleFromAppConfig).toBeFalsy();
			done();
		});
	});

	it('should update containerLocale when CONTAINER_LOCALE_CHANGE is fired', function(done) {
		var _locale;
		F2.init({
			locale: 'en-us'
		});
		F2.registerApps(appConfig,appManifest);

		//locale was defined, should be en-us
		expect(F2.getContainerLocale() == 'en-us').toBeTruthy();

		//listen for changes
		F2.Events.on(F2.Constants.Events.CONTAINER_LOCALE_CHANGE,function(data){
			_locale = data.locale;
			//now locale should be changed
			expect(F2.getContainerLocale() == 'de-de').toBeTruthy();
			done();
		});

		//now change locale
		F2.Events.emit(F2.Constants.Events.CONTAINER_LOCALE_CHANGE,{
			locale: 'de-de'
		});
	});

	it('should update containerLocale when CONTAINER_LOCALE_CHANGE is fired after being undefined', function(done) {
		F2.init();
		F2.registerApps(appConfig,appManifest);

		//locale was not defined, should be null
		expect(F2.getContainerLocale()).toBe(null);

		//listen for changes
		F2.Events.on(F2.Constants.Events.CONTAINER_LOCALE_CHANGE,function(data){
			//now locale should be changed
			expect(F2.getContainerLocale() == 'de-de').toBeTruthy();
			done();
		});

		//now change locale
		F2.Events.emit(F2.Constants.Events.CONTAINER_LOCALE_CHANGE,{
			locale: 'de-de'
		});
	});

	it('AppManifest should support localeSupport property', function() {
		F2.init({
			locale: 'en-us'
		});
		F2.registerApps(appConfig,appManifest);

		expect(appConfig.localeSupport).toBeTruthy();
	});

	it('AppManifest\'s localeSupport property should be an array', function() {
		F2.init({
			locale: 'en-us'
		});
		F2.registerApps(appConfig,appManifest);

		expect(typeof appConfig.localeSupport == 'object').toBeTruthy();
	});

	it('AppManifest\'s localeSupport property should have 2 items', function() {
		F2.init({
			locale: 'en-us'
		});
		F2.registerApps(appConfig,appManifest);

		expect(appConfig.localeSupport.length == 2).toBeTruthy();
	});

	it('app should receive localeSupport in appConfig', function(done) {
		F2.init({
			locale: 'en-us'
		});

		F2.registerApps({
			appId: TEST_APP_ID3,
			manifestUrl: TEST_MANIFEST_URL3,
			localeSupport: ['en-us']
		});

		F2.Events.on('com_openf2_examples_nodejs_helloworld-init', data => {
			expect(data.testLocaleSupportFromAppConfig).toEqual(['en-us']);
			done();
		});
	});

	it('app should receive localeSupport in appConfig and have 2 items', function(done) {
		F2.init({
			locale: 'en-us'
		});

		F2.registerApps({
			appId: TEST_APP_ID3,
			manifestUrl: TEST_MANIFEST_URL3,
			localeSupport: ['en-us','de-de']
		});

		F2.Events.on('com_openf2_examples_nodejs_helloworld-init', data => {
			expect(data.testLocaleSupportFromAppConfig.length).toBe(2);
			done();
		});
	});

});

describe('F2.registerApps - basic', function() {

	beforeEachReloadF2(function() {
		spyOn(console, 'log').and.callThrough();
	});

	it('should fail on empty parameters', function() {
		F2.init();
		F2.registerApps();
		expect(console.log).toHaveBeenCalledWith('At least one AppConfig must be passed when calling F2.registerApps()');
	});

	it('should fail when passed an empty array', function() {
		F2.init();
		F2.registerApps([]);
		expect(console.log).toHaveBeenCalledWith('At least one AppConfig must be passed when calling F2.registerApps()');
	});

	it('should fail when the parameters are invalid', function() {
		F2.init();
		F2.registerApps(null, []);
		expect(console.log).toHaveBeenCalled();
		expect(console.log).toHaveBeenCalledWith('At least one AppConfig must be passed when calling F2.registerApps()');
	});

	it('should fail when the AppConfig is invalid', function() {
		F2.init();
		F2.registerApps({});
		expect(console.log).toHaveBeenCalledWith('"appId" missing from app object');

		F2.registerApps({
			appId: TEST_APP_ID
		});
		expect(console.log).toHaveBeenCalledWith('"manifestUrl" missing from app object');
	});

	it('should fail when the parameter lengths do not match', function() {
		F2.init();
		F2.registerApps({
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		}, [{}, {}]);
		expect(console.log).toHaveBeenCalledWith('The length of "apps" does not equal the length of "appManifests"');
	});

	it('should not fail when a single appManifest is passed (#55)', function(done) {
		F2.init();
		F2.registerApps({
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		}, {
			apps: [{
				html: '<div></div>'
			}]
		});

		// wait long enough for registerApps to have failed
		setTimeout(function() {
			// F2.log should not have run
			expect(console.log).not.toHaveBeenCalled();
			done();
		}, 1000);
	});

	it('should not modify the original AppConfig that was passed in', function() {
		var appConfig = {
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		};
		F2.init();
		F2.registerApps(appConfig);

		// original appConfig object should remain clean
		expect(appConfig.instanceId).toBeFalsy();
	});
});

describe('F2.registerApps - xhr overrides', function() {

	beforeEachReloadF2();

	var appConfig = {
		appId: TEST_APP_ID,
		manifestUrl: TEST_MANIFEST_URL
	};

	it('should call xhr if it is defined', function() {
		var spy = jasmine.createSpy('xhr')

		F2.init({
			xhr: spy
		});
		F2.registerApps(appConfig);

		expect(spy).toHaveBeenCalled();
	});

	it('should pass 5 parameters to xhr', function(done) {
		F2.init({
			xhr: function(url, appConfigs, success, error, complete) {
				expect(arguments.length).toBe(5);
				expect(typeof url).toBe('string');
				expect(appConfigs instanceof Array).toBeTruthy();
				expect(typeof success).toBe('function');
				expect(typeof error).toBe('function');
				expect(typeof complete).toBe('function');
				done();
			}
		});
		F2.registerApps(appConfig);
	});

	it('should call xhr.dataType', function() {
		var spy = jasmine.createSpy('dataType').and.returnValue('jsonp');
		F2.init({
			xhr: {
				dataType: spy
			}
		});
		F2.registerApps(appConfig);

		expect(spy).toHaveBeenCalled();
	});

	it('should throw an exception when xhr.dataType does not return a string', function() {
		expect(function() {
			F2.init({
				xhr: {
					dataType: function() {}
				}
			});
			F2.registerApps(appConfig);
		}).toThrow('ContainerConfig.xhr.dataType should return a string');
	});

	it('should call xhr.type', function() {
		var spy = jasmine.createSpy('xhrType').and.returnValue('GET');
		F2.init({
			xhr: {
				type: spy
			}
		});
		F2.registerApps(appConfig);
		expect(spy).toHaveBeenCalled();
	});

	it('should throw an exception when xhr.type does not return a string', function() {
		expect(function() {
			F2.init({
				xhr: {
					type: function() {}
				}
			});
			F2.registerApps(appConfig);
		}).toThrow('ContainerConfig.xhr.type should return a string');
	});

	it('should call xhr.url', function() {
		var spy = jasmine.createSpy('url').and.returnValue(TEST_MANIFEST_URL);
		F2.init({
			xhr: {
				url: spy
			}
		});
		F2.registerApps(appConfig);

		expect(spy).toHaveBeenCalled();
	});

	it('should throw an exception when xhr.url does not return a string', function() {
		expect(function() {
			F2.init({
				xhr: {
					url: function() {}
				}
			});
			F2.registerApps(appConfig);
		}).toThrow('ContainerConfig.xhr.url should return a string');
	});

	it('should use POST when the domain of the container matches that of the app (#41, #59)', function(done) {

		F2.log = function(isPost) {
			expect(isPost).toBeTruthy();
			done();
		};

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

	it('should use GET when the domain of the container does not match that of the app (#41, #59)', function(done) {

		F2.log = function(isPost) {
			expect(isPost).toBeFalsy();
			done();
		};

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
			manifestUrl: TEST_MANIFEST_URL_HTTP_XDOMAIN
		});
	});
});

describe('F2.registerApps - rendering', function() {

	beforeEachReloadF2();
	afterEachDeleteTestScripts();

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
	var appClass = 'http://localhost:8080/tests/apps/com_openf2_examples_nodejs_helloworld/appclass.js';

	it('should eval AppManifest.inlineScripts when AppManifest.scripts are defined', function(done) {
		F2.inlineScriptsEvaluated = function() {
			expect(true).toBeTruthy(); // the fact that we made it here is success
			done();
		};

		F2.init();
		F2.registerApps([{
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		}], [{
			'inlineScripts': ['(function(){F2.inlineScriptsEvaluated();})()'],
			'scripts': [appClass],
			'apps': [{
				'html': '<div class="test-app-2">Testing</div>'
			}]
		}]);
	});

	it('should eval AppManifest.inlineScripts when AppManifest.scripts are not defined', function(done) {
		F2.inlineScriptsEvaluated = function() {
			expect(true).toBeTruthy(); // the fact that we made it here is success
			done();
		};

		F2.init();
		F2.registerApps([{
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		}], [{
			'inlineScripts': ['(function(){F2.inlineScriptsEvaluated();})()'],
			'apps': [{
				'html': '<div class="test-app-2">Testing</div>'
			}]
		}]);
	});

	it('should add cache buster to AppManifest.scripts when F2.ContainerConfig.debugMode is true', function(done) {

		F2.checkCacheBuster = function() {
			var bustedCache = false;
			var scripts = document.querySelectorAll('script');

			for (var i = 0; i < scripts.length; i++) {
				if (/appclass.js\?cachebuster/.test(scripts[i].src)) {
					bustedCache = true;
					break;
				}
			}

			expect(bustedCache).toBe(true);
			done();
		};

		F2.init({
			debugMode: true
		});
		F2.registerApps([{
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		}], [{
			'inlineScripts': ['(function() {F2.checkCacheBuster();})()'],
			'scripts': [appClass],
			'apps': [{
				'html': '<div class="test-app-2">Testing</div>'
			}]
		}]);
	});

	it('should not add cache buster to AppManifest.scripts when F2.ContainerConfig.debugMode is undefined or false', function(done) {
		F2.checkCacheBuster = function() {
			var bustedCache = false;
			var scripts = document.querySelectorAll('script');

			for (var i = 0; i < scripts.length; i++) {
				if (/appclass.js/.test(scripts[i].src)) {
					bustedCache = /cachebuster/.test(scripts[i].src);
					break;
				}
			}

			expect(bustedCache).toBe(false);
			done();
		};

		F2.init();
		F2.registerApps([{
			appId: TEST_APP_ID,
			manifestUrl: TEST_MANIFEST_URL
		}], [{
			'inlineScripts': ['(function() {F2.checkCacheBuster();})()'],
			'scripts': [appClass],
			'apps': [{
				'html': '<div class="test-app-2">Testing</div>'
			}]
		}]);
	});

	it('should always init an appclass', function(done) {
		var appsInitialized = 0;

		F2.init();

		F2.Events.on('com_openf2_examples_nodejs_helloworld-init', () => {
			appsInitialized++;
			if (appsInitialized === 3) {
				expect(appsInitialized).toBe(3);
				done();
			}
		});

		// load a few of the same apps; existing scripts should not cause
		// app #2 and later to be loaded prematurely
		F2.registerApps([
			{
				appId: TEST_APP_ID3,
				manifestUrl: TEST_MANIFEST_URL3
			},
			{
				appId: TEST_APP_ID3,
				manifestUrl: TEST_MANIFEST_URL3
			},
			{
				appId: TEST_APP_ID3,
				manifestUrl: TEST_MANIFEST_URL3
			}
		]);
	}, 10000);

	it('should load and execute scripts in order', function(done) {

		F2.init();

		//load 1 app with 2 script files, the 2nd one defines F2.HightChartsIsDefined global.
		F2.registerApps([{
				appId: TEST_APP_ID3,
				manifestUrl: TEST_MANIFEST_URL3
		}], [{
			'scripts': [
				'https://cdnjs.cloudflare.com/ajax/libs/highcharts/4.0.3/highcharts.js',
				'http://localhost:8080/tests/apps/com_openf2_examples_nodejs_helloworld/appclass.js'
			],
			'apps': [{
				'html': '<div class="test-app-1">Testing</div>'
			}]
		}]);

		//notify when dependencies have been loaded
		F2.Events.on('com_openf2_examples_nodejs_helloworld-init', data => {
			expect(data.HightChartsIsDefined).toBeTruthy();
			done();
		});
	});

});
