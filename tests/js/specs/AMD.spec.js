describe('AMD', function() {

	var F2 = require('F2');

	it('should be able to load F2 modules', function() {
		expect(F2).toBeDefined();
	});

	it('should defer to a previously loaded AMD framework', function() {
		expect(requirejs._defined).not.toBeDefined();
	});

});