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
		}).toLog('manifestUrl" missing from app object');
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
	/*
	it('should eval AppManifest.inlineScripts when AppManifest.scripts are defined', function(){
		F2.init();
		F2.registerApps([{appId:'com_openf2_tests_helloworld', manifestUrl:'/'}], [{"inlineScripts": ["(function(){F2.inlineScriptsEvaluated=true;})()"], "scripts":["http://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/js/bootstrap.min.js"],"apps":[{}]}]);
		expect(F2.inlineScriptsEvaluated).not.toBeUndefined();
	});
	*/
	it('should eval AppManifest.inlineScripts when AppManifest.scripts are not defined', function(){
		F2.init();
		F2.registerApps([{appId:'com_openf2_tests_helloworld', manifestUrl:'/'}], [{"inlineScripts": ["(function(){F2.inlineScriptsEvaluated=true;})()"],"apps":[{ html: '<div class="test-app-2">Testing</div>' }]}]);
		expect(F2.inlineScriptsEvaluated).not.toBeUndefined();
	});
});