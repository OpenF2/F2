describe('globals', function() {

	it('should expose "define", "require", "requirejs" (AMD)', function() {
		expect(define).toBeDefined();
		expect(require).toBeDefined();
		expect(requirejs).toBeDefined();
	});

	it('should expose "JSON"', function() {
		expect(JSON).toBeDefined();
	});

	it('should expose F2 modules', function() {
		expect(window.F2).toBeDefined();
		expect(window.F2.Ajax).toBeDefined();
		expect(window.F2.BaseAppClass).toBeDefined();
		expect(window.F2.Constants).toBeDefined();
		expect(window.F2.Events).toBeDefined();
		expect(window.F2.Interfaces).toBeDefined();
		expect(window.F2.UI).toBeDefined();
	});

	it('should not expose third party libraries', function() {
		expect(window.tv4).not.toBeDefined();
		expect(window.reqwest).not.toBeDefined();
		expect(window.LazyLoad).not.toBeDefined();
		expect(window._).not.toBeDefined();
	});

});