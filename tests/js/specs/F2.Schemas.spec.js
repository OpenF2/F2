define(['jasmine', 'F2'], function() {

	describe('F2.Schemas', function() {

		var F2 = require('F2');

		describe('add', function() {

			it('should permit adding schemas', function() {
				var exists = false;

				// Try first
				try {
					F2.Schemas.validate({}, 'test1');

					// We shouldn't reach this is the above threw an exception
					expect(true).toBe(false);
				}
				catch (e) {
					F2.Schemas.add('test1', {
						id: 'test1'
					});
					var isValid = F2.Schemas.validate({}, 'test1');
					expect(isValid).toBe(true);
				}
			});

			it('should return true if a schema was successfully added', function() {
				var schema = {
					id: 'test2'
				};
				var result = F2.Schemas.add('test2', schema);
				expect(result).toBe(true);
			});

			it('should throw if a duplicate schema name is added', function() {
				function attempt() {
					F2.Schemas.add('test1', {});
				}

				expect(attempt).toThrow();
			});

			it('should throw if no schema name is specified', function() {
				function attempt() {
					F2.Schemas.add(null, {});
				}

				expect(attempt).toThrow();
			});

			it('should throw if no schema definition is specified', function() {
				function attempt() {
					F2.Schemas.add('test3');
				}

				expect(attempt).toThrow();
			});

		});

		describe('isDefined', function() {

			it('should return true if checking a registered schema name', function() {
				var defined = F2.Schemas.isDefined('appConfig');

				expect(defined).toBe(true);
			});

			it('should return false if checking an unregistered schema name', function() {
				var defined = F2.Schemas.isDefined('__nothing__');

				expect(defined).toBe(false);
			});

			it('should not throw if the schema name is falsey', function() {
				function attempt() {
					F2.Schemas.isDefined();
				}

				expect(attempt).not.toThrow();
			});

		});

		describe('validate', function() {

			it('should return true when inspecting a valid schema', function() {
				var validAppConfig = {
					appId: ''
				};
				var isValid = F2.Schemas.validate(validAppConfig, 'appConfig');

				expect(isValid).toBe(true);
			});

			it('should return false in the event of a type mismatch', function() {
				var invalidAppConfig = {
					appId: []
				};
				var isValid = F2.Schemas.validate(invalidAppConfig, 'appConfig');

				expect(isValid).toBe(false);
			});

			it('should return false if a required property is missing', function() {
				var isValid = F2.Schemas.validate({}, 'appConfig');

				expect(isValid).toBe(false);
			});

			it('should return false if no JSON is provided', function() {
				var isValid = F2.Schemas.validate(null, 'appConfig');

				expect(isValid).toBe(false);
			});

			it('should throw if no schema name is provided', function() {
				function attempt() {
					F2.Schemas.validate({});
				}

				expect(attempt).toThrow();
			});

			it('should throw if the schema name is unrecognized', function() {
				function attempt() {
					F2.Schemas.validate({}, 'nothing');
				}

				expect(attempt).toThrow();
			});

		});

	});

});