(function(window) {

	// set a variable so that the index page knows the server is up and running
	window.F2_NODE_TEST_SERVER = {};

	// pick apart the url to verify that we're running on the node server
	var rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
		url = window.location.href.toLowerCase(),
		parts = rurl.exec(url);
	//console.log(parts);

	// run the tests on the node server if it is running so that the port numbers
	// will match
	if (parts[1] != 'http:' || parts[2] != 'localhost' || parts[3] != '8080') {
		window.location = 'http://localhost:8080/tests' + /\/[\w.+-]+\.html$/.exec(window.location.pathname)[0];
	}

})(window);