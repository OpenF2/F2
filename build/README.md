# Build F2

For those wishing to contribute, we've included a `build.js` file in the project which contains the logic for compiling F2.js and the documentation. The build script runs on [Node.js](http://nodejs.org/), and has a few dependencies. To install, `cd` to your `F2\build` folder, and run the following commands in npm:

`$> npm install uglify-js wrench fs-extra yuidocjs optimist handlebars`

`$> npm install less markitdown -g`

Depending on your configuration, you may need to be an admin to install some of these Node packages. Additionally, some packages may need to be [installed globally](http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation/) using the `-g` switch.

To **build F2**, run:

`$> node build`

For help, run:

`$> node build -h`