	// Put the API together
	var F2 = function() {
		return Helpers._.defaults({}, Library);
	};

	// Make a factory module that can spawn new instances
	define('F2Factory', [], function() {
		return F2;
	});

	// Make the F2 singleton module
	define('F2', ['F2Factory'], function(Factory) {
		return new Factory();
	});

	console.timeEnd('F2 - startup');

})();
