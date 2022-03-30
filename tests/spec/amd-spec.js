describe('AMD', function () {
	it('should define F2 both as an AMD module and global', function (done) {
		require(['../dist/f2.js'], function (nonGlobalF2) {
			expect(nonGlobalF2).toBeDefined();
			expect(nonGlobalF2.registerApps).toBeDefined();
			expect(window.F2).toBeDefined();
			done();
		});
	});
});
