### Testing F2 [![Build Status](https://travis-ci.org/OpenF2/F2.png?branch=master)](https://travis-ci.org/OpenF2/F2)

F2 tests are built with the behavior-driven framework [Jasmine](http://pivotal.github.io/jasmine/).  There are two main entry points into the tests: [index.html](index.html) and [index-amd.html](index-amd.html).  These two entry points are the same except that `index-amd.html` runs [specs](http://pivotal.github.io/jasmine/#section-Suites:_<code>describe</code>_Your_Tests) that are specific to [Asynchronous Module Definition](https://github.com/amdjs/amdjs-api/wiki/AMD).

There is also an optional server component written in [Node.js](http://nodejs.org/) for the tests. When running the tests, a red banner will be displayed at the top of the page notifying you when the server is not running.  When the server is running, you will be redirected to the server so that all requests are run from the server (usually at [http://localhost:8080/tests/index.html](http://localhost:8080/tests/index.html).

To run the server, you must first make sure that [Node.js](http://nodejs.org/) is installed and that the [F2 package is installed](../#build-f2-).  Once this is done, the server can be started by running the following command from the project root directory:

`$> node .\tests\js\server\server.js`

The server runs on port `8080`.