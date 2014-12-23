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

describe('F2.guid', function() {

	it('should not produce equal guids', function() {
		expect(F2.guid()).not.toMatch(F2.guid());
	});

});
