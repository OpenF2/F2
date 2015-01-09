(function(window) {

  // Set a variable so that the index page knows the server is up and running
  window.F2_NODE_TEST_SERVER = {};

  // Verify that we're running on the node server
  var rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/;
  var url = window.location.href.toLowerCase();
  var parts = rurl.exec(url);

  // run the tests on the server if it's running so that the port numbers match
  if (parts[1] != 'http:' || parts[2] != 'localhost' || parts[3] != '8080') {
    window.location = 'http://localhost:8080/tests' + /\/[\w.+-]+\.html$/.exec(window.location.pathname)[0];
  }

})(window);
