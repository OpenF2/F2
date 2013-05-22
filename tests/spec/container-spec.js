describe('F2.registerApps - pre-load', function() {

	it('should throw exception if F2.init() is not called prior.', function() {
		expect(function(){

			var appConfig = {
				appId:'com_alikhatami_preloaded_test',
				manifestUrl:'http://www.openf2.org',
				root: $("body").find("div.com_alikhatami_preloaded_test:first").get(0)
			};

			F2.registerApps([appConfig]);
		}).toLog('F2.init() must be called before F2.registerApps()');
	});

	it('should throw exception if no appConfigs are passed.', function() {
		expect(function(){
			F2.init();
			F2.registerApps();
		}).toLog('At least one AppConfig must be passed when calling F2.registerApps()');
	});

	it('should allow you to pass single appConfig as object to F2.registerApps.', function() {
		expect(function(){
			F2.init();
			var appConfig = {
				appId:'com_alikhatami_preloaded_test',				
				root: $("body").find("div.com_alikhatami_preloaded_test:first").get(0)
			};
			F2.registerApps(appConfig);
		}).not.toThrow();
	});

	it('should not require appConfig.manifestUrl when passing pre-load appConfig to F2.registerApps.', function() {
		expect(function(){
			F2.init();
			var appConfig = {
				appId:'com_alikhatami_preloaded_test',				
				root: $("body").find("div.com_alikhatami_preloaded_test:first").get(0)
			};
			F2.registerApps(appConfig);
		}).not.toLog('"manifestUrl" missing from app object');
	});

	it('should throw exception if you pass an invalid appConfig to F2.registerApps.', function() {
		expect(function(){
			F2.init();
			F2.registerApps({});
		}).toLog('"appId" missing from app object');
	});

	it('should request apps without valid root property and auto init pre-load apps with root when passing mix to F2.registerApps.', function() {
		var bAfterFired = false
		F2.PreloadTestComplete = false;
		F2.PreloadAppInitialized = false;
		F2.PreloadRetrievedEmit = false;

		var appConfigs = [
			{
				appId: 'com_openf2_examples_csharp_stocknews',
				manifestUrl: 'http://www.openf2.org/f2/apps'
			},
			{
				appId:'com_alikhatami_preloaded_test',				
				root: $("body").find('div.com_alikhatami_preloaded_test:first').get(0)
			}
		];

		F2.init();

		F2.AppHandlers.on(F2.AppHandlers.getToken(), "appRenderAfter", function(){ bAfterFired = true; });
		
		F2.registerApps(appConfigs);

		waitsFor(
			function()
			{
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
			appId:'com_alikhatami_preloaded_test',
			manifestUrl:'http://www.openf2.org',
			root: $("body").find("div.com_alikhatami_preloaded_test:first").get(0)
		};

		F2.init();

		// init is called above
		F2.registerApps([appConfig]);

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
		F2.registerApps(appConfigs);

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
		})

		// wait long enough for registerApps to have failed
		waits(1000);

		// F2.log should not have run
		runs(function() {
			expect(passedMessage).toBeFalsy();
		})
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