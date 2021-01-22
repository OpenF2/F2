describe('misc', function() {

	it('F2.version() should return a version number (SemVer as String)', function() {
		//https://github.com/sindresorhus/semver-regex
		var testVersion = /\bv?(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?\b/ig.test(F2.version());
		expect(testVersion).toBeTruthy();
	});

});