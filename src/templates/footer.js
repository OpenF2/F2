	// Make the F2 singleton module
	define('F2', [], function() {
		return new F2();
	});

	console.timeEnd('F2 - startup');

})(window, document);
