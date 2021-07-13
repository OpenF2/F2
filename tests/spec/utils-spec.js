describe('F2 utility methods', function() {

	beforeEachReloadF2();

	it('F2.version should return a version number (SemVer as String)', function() {
		//https://github.com/sindresorhus/semver-regex
		var testVersion = /\bv?(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)\.(?:0|[1-9][0-9]*)(?:-[\da-z\-]+(?:\.[\da-z\-]+)*)?(?:\+[\da-z\-]+(?:\.[\da-z\-]+)*)?\b/ig.test(F2.version());
		expect(testVersion).toBeTruthy();
	});

	it('F2.guid should not produce equal guids', function() {
		expect(F2.guid()).not.toMatch(F2.guid());
	});

	it('F2.parse should parse a json object', function() {
		expect(F2.parse('{"foo":"bar"}')).toEqual({ foo: 'bar' });
	});

	it('F2.stringify should convert an object to a json string', function() {
		expect(F2.stringify({ foo: 'bar' })).toMatch('{"foo":"bar"}');
	});

	describe('F2.extend', function() {
		it('should ignore extra F2 namespace', function() {
			F2.extend('F2.TestObj', { foo: 'bar' });
			expect(F2.TestObj).toEqual({ foo: 'bar' })
		});

		it('should not overwrite properties by default', function() {
			F2.extend('F2.TestObj', { foo: 'bar' });
			F2.extend('F2.TestObj', { foo: 'foo' });
			expect(F2.TestObj).toEqual({ foo: 'bar' });
		});

		it('should overwrite properties', function() {
			F2.extend('F2.TestObj', { foo: 'bar' });
			F2.extend('F2.TestObj', { foo: 'foo' }, true);
			expect(F2.TestObj).toEqual({ foo: 'foo' });
		});
	});
});