describe('F2.registerPreLoadedApps', function() {

	it('should throw exception if F2.init() is not called prior.', function() {
		expect(function(){

			var appConfig = {
				appId:'com_alikhatami_preloaded_test',
				manifestUrl:'http://www.openf2.org',
				root: $("body").find("div.com_alikhatami_preloaded_test:first").get(0)
			};

			F2.registerPreLoadedApps([appConfig]);
		}).toThrow();
	});

	it('should throw exception if no appConfigs are passed.', function() {
		expect(function(){
			F2.init();
			F2.registerPreLoadedApps();
		}).toThrow();
	});

	it('should allow you to pass single appConfig as object to F2.registerPreLoadedApps.', function() {
		expect(function(){
			F2.init();
			var appConfig = {
				appId:'com_alikhatami_preloaded_test',
				manifestUrl:'http://www.openf2.org',
				root: $("body").find("div.com_alikhatami_preloaded_test:first").get(0)
			};
			F2.registerPreLoadedApps(appConfig);
		}).not.toThrow();
	});

	it('should throw exception if you pass an invalid appConfig to F2.registerPreLoadedApps.', function() {
		expect(function(){
			F2.init();
			F2.registerPreLoadedApps({});
		}).toThrow();
	});

	it('should throw exception if you pass a valid appConfig without a valid root property to F2.registerPreLoadedApps.', function() {
		expect(function(){
			F2.init();
			var appConfig = {
				appId:'com_alikhatami_preloaded_test',
				manifestUrl:'http://www.openf2.org',
				root: ""
			};
			F2.registerPreLoadedApps(appConfig);
		}).toThrow();
	});
	
	it('should allow you to init/register apps that are already on the page.', function() {
		
		F2.init();
		F2.PreloadTestComplete = false;
		F2.PreloadAppInitialized = false;
		F2.PreloadRetrievedEmit = false;

		var appConfig = {
			appId:'com_alikhatami_preloaded_test',
			manifestUrl:'http://www.openf2.org',
			root: $("body").find("div.com_alikhatami_preloaded_test:first").get(0)
		};

		// init is called above
		F2.registerPreLoadedApps([appConfig]);

		waitsFor(
			function()
			{
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

		var $appsOnPage = $("body").find("div.com_alikhatami_preloaded_test");
		var appConfigs = [
			{
				appId:'com_alikhatami_preloaded_test',
				manifestUrl:'http://www.openf2.org',
				root: $appsOnPage.get(0)
			},
			{
				appId:'com_alikhatami_preloaded_test',
				manifestUrl:'http://www.openf2.org',
				root: $appsOnPage.get(1)
			}
		];

		// init is called above
		F2.registerPreLoadedApps(appConfigs);

		waitsFor(
			function()
			{
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
			F2.registerApps({appId:'com_openf2_tests_helloworld'});
		}).toLog('"manifestUrl" missing from app object');
	});

	it('should fail when the parameter lengths do not match', function() {
		expect(function() {
			F2.registerApps({appId:'com_openf2_tests_helloworld', manifestUrl:'http://www.openf2.org'}, [{}, {}]);
		}).toLog('The length of "apps" does not equal the length of "appManifests"');
	});

	it('should not fail when a single appManifest is passed (#55)', function() {

		var passedMessage = false;
		F2.log = function(message) {
			passedMessage = true;
		};

		runs(function() {
			F2.registerApps({appId:'com_openf2_tests_helloworld', manifestUrl:'http://www.openf2.org'}, {apps:[{html:'<div></div>'}]});
		});

		// wait long enough for registerApps to have failed
		waits(1000);

		// F2.log should not have run
		runs(function() {
			expect(passedMessage).toBeFalsy();
		});
	});

	itConditionally(window.F2_NODE_TEST_SERVER, 'should use POST when the domain of the container matches that of the app (#41, #59)', function() {

		var isPost = false,
			hasReturned = false;	
		F2.log = function(isPost) {
			hasReturned = true;
			isPost = isPost;
		};

		runs(function() {
			F2.registerApps({appId:'com_openf2_tests_helloworld', manifestUrl:'http://localhost:8080/httpPostTest'});	
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
		appId: 'com_openf2_tests_helloworld',
		manifestUrl: 'http://www.openf2.org'
	};
	var appManifest = {
		scripts:[],
		styles:[],
		inlineScripts:[],
		apps:[
			{
				html: '<div class="test-app">Testing</div>'
			}
		]
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
			expect(isFired).toBeTruthy();
		})
	});

	it('should allow beforeAppRender to return null', function() {
		F2.init({
			beforeAppRender: function() {
				return null;
			}
		});

		F2.registerApps(appConfig, [appManifest]);
	});
	
	it('should eval AppManifest.inlineScripts when AppManifest.scripts are defined', function(){
		F2.inlineScriptsEvaluated = false;
		F2.init();
		F2.registerApps([{appId:'com_openf2_tests_helloworld', manifestUrl:'/'}], [{"inlineScripts": ["(function(){F2.inlineScriptsEvaluated=true;})()"], "scripts":["js/test.js"],"apps":[{ html: '<div class="test-app-2">Testing</div>' }]}]);
		
		waitsFor(
			function()
			{
				return F2.inlineScriptsEvaluated;
			},
			'Inline scripts were never evaluated',
			10000
		);
		
		runs(function() {
			expect(F2.inlineScriptsEvaluated).toBe(true);
		});	
		
	});
	
	it('should eval AppManifest.inlineScripts when AppManifest.scripts are not defined', function(){
		F2.inlineScriptsEvaluated = false;
		F2.init();
		F2.registerApps([{appId:'com_openf2_tests_helloworld', manifestUrl:'/'}], [{"inlineScripts": ["(function(){F2.inlineScriptsEvaluated=true;})()"],"apps":[{ html: '<div class="test-app-2">Testing</div>' }]}]);
		waitsFor(
			function()
			{
				return F2.inlineScriptsEvaluated;
			},
			'Inline scripts were never evaluated',
			10000
		);
		
		runs(function() {
			expect(F2.inlineScriptsEvaluated).toBe(true);
		});	
	});
});