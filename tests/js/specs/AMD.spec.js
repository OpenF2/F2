define(['F2'], function(F2) {

	describe('AMD', function() {

		it('should expose "define" and "require" to window', function() {
			expect(define).toBeDefined();
			expect(require).toBeDefined();
		});

		it('should be able to load F2 modules', function() {
			expect(F2).toBeDefined();
		});

	});

});