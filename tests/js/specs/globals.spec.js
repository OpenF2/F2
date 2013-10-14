describe('globals', function() {

	it('should expose "define", "require", "requirejs" (AMD)', function() {
		expect(define).toBeDefined();
		expect(require).toBeDefined();
		expect(requirejs).toBeDefined();
	});

	it('should expose "JSON"', function() {
		expect(JSON).toBeDefined();
	});

	it('should not expose F2 modules if AMD is present', function() {
		expect(window.F2).not.toBeDefined();
	});

	it('should not expose third party libraries', function() {
		expect(window.tv4).not.toBeDefined();
		expect(window.reqwest).not.toBeDefined();
		expect(window.LazyLoad).not.toBeDefined();
		expect(window._).not.toBeDefined();
	});

});