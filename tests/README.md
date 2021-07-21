### Testing F2 [![Build Status](https://github.com/openf2/f2/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/OpenF2/F2/actions)

F2 tests are built with the behavior-driven framework [Jasmine](https://jasmine.github.io/). The test can be run via `npm test` or can be run in a browser by running `npm run test-live`. [Karma](https://karma-runner.github.io/) is used to assist with executing the tests in a browser (real or headless).

There is also a server component for the tests written in [Node.js](http://nodejs.org/) which can be found in `tests/server.js`. This server is used to provide F2 apps to the tests and allow for testing cross origin requests via JSONP. This server is automatically launched when `npm test` or `npm run test-live` is run.