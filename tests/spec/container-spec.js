describe('F2.init', function() {

	it('should allow for no parameters', function() {
		F2.init();
		//assert.pass();
	});

	it('should allow for an empty object parameter', function() {
		F2.init({});
		//assert.pass();
	});

});

describe('F2.isInit', function() {
	it('should return true when F2.init has been called', function() {
		expect(F2.isInit()).toBeTruthy();
		//assert.pass();
	});
});

describe('F2.registerApps', function() {

	beforeEach(function() {
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

});