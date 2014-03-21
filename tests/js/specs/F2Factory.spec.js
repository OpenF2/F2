define([], function() {

	describe('F2Factory', function() {

		it('should be defined as an AMD module', function(done) {
			require(['F2Factory'], function(F2Factory) {
				expect(F2Factory).toBeDefined();
				done();
			});
		});

		it('should create new instances of F2', function(done) {
			require(['F2Factory'], function(F2Factory) {
				expect(new F2Factory()).not.toBe(new F2Factory());

				done();
			});
		});

		it('should not allow changes to F2.prototype', function(done) {
			require(['F2Factory'], function(F2Factory) {
				// Try to null out the "guid" function
				F2Factory.prototype.guid = undefined;

				expect(new F2Factory().guid).toBeDefined();

				done();
			});
		});

	});

});
