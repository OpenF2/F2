describe('misc', function() {

	it('should not overwrite existing jQuery versions', function() {
		// the AMD test page does not include jquery
		if (typeof $ !== 'undefined') {
			// the jasmine test page loads 1.11.1 while 1.10.2 is bundled with F2
			expect($.fn.jquery).toEqual('1.11.1');
		}
	});

	it('F2.version() should return a version number (SemVer as String)', function() {
		//https://github.com/sindresorhus/semver-regex
		var testVersion = /\bv?(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?\b/ig.test(F2.version());
		expect(testVersion).toBeTruthy();
	});

});