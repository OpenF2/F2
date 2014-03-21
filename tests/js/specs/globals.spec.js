define(['F2'], function(F2) {

	describe('globals', function() {

		it('should not expose F2 modules if AMD is present', function() {
			expect(window.F2).not.toBeDefined();
		});

		it('should not expose third party libraries', function() {
			var vendor = ['tv4', 'reqwest', '_'];

			for (var i = 0; i < vendor.length; i++) {
				expect(window[vendor[i]]).not.toBeDefined();
			}
		});

	});

});
