describe('AMD', function() {

	it('should define F2 both as an AMD module and global', function(done) {
		require(["../sdk/f2.min.js"], function (nonGlobalF2) {
			expect(nonGlobalF2).toBeDefined();
			expect(window.F2).toBeDefined();
			done();
		});
	});

});