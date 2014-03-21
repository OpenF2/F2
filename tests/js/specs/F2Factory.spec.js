define(['jasmine', 'F2'], function() {

	describe('F2Factory', function() {

		var F2Factory;

		beforeEach(function() {
			// We have to require F2Factory the hard way
			require(['F2Factory'], function(Factory) {
				F2Factory = Factory;
			});

			waitsFor(function() {
				return F2Factory;
			}, DEFAULT_TIMEOUT);
		});

		afterEach(function() {
			F2Factory = undefined;
		});

		it('should be defined as an AMD module', function() {
			runs(function() {
				expect(F2Factory).toBeDefined();
			});
		});

		it('should create new instances of F2', function() {
			var F2_1 = new F2Factory();
			var F2_2 = new F2Factory();

			expect(F2_1).not.toBe(F2_2);
		});

		it('should not allow changes to F2.prototype', function() {
			// Try to null out the "guid" function
			F2Factory.prototype.guid = undefined;

			expect(new F2Factory().guid).toBeDefined();
		});

	});

});
