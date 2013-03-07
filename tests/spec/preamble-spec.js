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

describe('F2.inArray', function() {

	it('returns true if an item is in the array', function() {
		expect(F2.inArray(1, [3, 2, 1])).toBeTruthy();
	});

	it('returns false if an item is not in the array', function() {
		expect(F2.inArray(1, [7, 8, 9])).toBeFalsy();
	});

});

describe('F2.parse', function() {

	it('should parse a json object', function() {
		expect(F2.parse('{"foo":"bar"}')).toEqual({ foo: 'bar' });
	});

});

describe('F2.stringify', function() {

	it('should convert an object to a json string', function() {
		expect(F2.stringify({ foo: 'bar' })).toMatch('{"foo":"bar"}');
	});

});