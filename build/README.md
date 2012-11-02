# Build F2

For those wishing to contribute back to F2, we've included a `build` file in the project which contains the logic for compiling F2.js and the specification docs. The build script runs on [Node.js](http://nodejs.org/) and has a few dependencies. To install, `cd` to your `F2/build` folder, and run the following commands in npm:

`$> npm install uglify-js wrench fs-extra yuidocjs optimist handlebars`

`$> npm install less markitdown -g`

Depending on your configuration, you may need to be an admin to install some of these Node packages. Additionally, some packages may need to be [installed globally](http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation/) using the `-g` switch.

To **build F2**, run:

`$> node build`

For help, run:

`$> node build -h`

## Versioning

To adhere to industry standards, F2 will be maintained under the Semantic Versioning guidelines as much as possible.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

For more information on SemVer, please visit <http://semver.org/>.

You can run this command to check the version of your local copy of F2:

`$> node build -v`

## Talk

Have a question? Want to talk? Ask it on our [Google Group](https://groups.google.com/forum/#!forum/OpenF2) or send an email to <info@openf2.org>.

## Bug Tracking

To track bugs and issues, we are using [Issues on GitHub](https://github.com/OpenF2/F2/issues).

## Copyright and License

F2 is released under the MIT License.

Copyright &copy; 2012 Markit On Demand, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.