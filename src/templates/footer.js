	// Make a factory module that can spawn new instances
	define('F2Factory', [], function() {
		// Wrap up the output in a function to prevent prototype tempering
		return function(params) {
			return new F2(params);
		};
	});

	// Make the F2 singleton module
	define('F2', ['F2Factory'], function(Factory) {
		return new Factory();
	});

	console.timeEnd('F2 - startup');

})();
