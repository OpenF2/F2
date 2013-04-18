describe('AMD', function() {

	it('should define F2', function() {

		var isLoaded = false;

		require(["../sdk/f2.min.js"], function (nonGlobalF2) {
			isLoaded = typeof nonGlobalF2 !== "undefined";
		});

		waitsFor(function() {
			//console.log('ping');
			return isLoaded;
		}, 'F2-AMD never loaded', 10000);

		runs(function() { });
	});

	it('should still globally define F2', function() {
		expect(F2).toBeDefined();
	});
	
});