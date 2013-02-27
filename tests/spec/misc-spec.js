describe('misc', function() {

	it('should not overwrite existing jQuery versions', function() {
		// the AMD test page does not include jquery
		if (typeof $ !== 'undefined') {
			// the jasmine test page loads 1.8.2 while 1.8.3 is bundled with F2
			expect($.fn.jquery).toEqual('1.8.2');
		}
	});

});