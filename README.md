# An open framework for the financial services industry.

F2 is an open and free web integration framework designed to help you and other financial industry participants develop custom solutions that combine the best tools and content from multiple providers into one, privately-labeled, seamlessly integrated front-end. The [essential components](http://docs.openf2.org/index.html#framework) defined by the F2 specification are the Container, Apps, Context and Store&mdash;all supported under the hood by **[F2.js](http://docs.openf2.org/f2js-sdk.html)**, a JavaScript SDK which provides an extensible foundation powering all F2-based web applications. 

F2 is maintained by [Markit On Demand](http://www.markitondemand.com). Visit [OpenF2.org](http://www.openf2.org) for more information. Follow [@OpenF2](http://twitter.com/OpenF2) on Twitter.

## Developers

### Quick Start

Clone the repo, `git clone https://github.com/OpenF2/F2.git`, or [download the latest version](https://github.com/OpenF2/F2/zipball/master).

Now you've got F2, if you are ready to start building F2 containers or apps, [read the documentation](http://docs.openf2.org/app-development.html). If you just want to see examples point your browser at `http://path/to/your/clone/F2/examples/`.

#### Notice ####

If you only want to build F2 [containers](http://docs.openf2.org/container-development.html) or [apps](http://docs.openf2.org/app-development.html), you can **skip the [Build F2](#build-f2)** section below.

### Collaboration 

Join our team and help contribute to F2 on GitHub. Begin by [forking the repo](https://github.com/OpenF2/F2/fork_select), sending [pull requests](https://help.github.com/articles/using-pull-requests), or [submitting issues](https://github.com/OpenF2/F2/issues).

### Build F2

For those wishing to contribute back to F2, we've included a `build.js` file in the project which contains the logic for compiling F2.js and the documentation. The build script runs on [Node.js](http://nodejs.org/), and has a few dependencies. To install, `cd` to your `F2\build` folder, and run the following commands in npm:

`$> npm install uglify-js wrench fs-extra yuidocjs optimist handlebars`

`$> npm install less markitdown -g`

Depending on your configuration, you may need to be an admin to install some of these Node packages. Additionally, some packages may need to be [installed globally](http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation/) using the `-g` switch.

To **build F2**, run:

`$> node build`

For help, run:

`$> node build -h`

### Versioning

To adhere to industry standards, F2 will be maintained under the Semantic Versioning guidelines as much as possible.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

For more information on SemVer, please visit <http://semver.org/>.

### Talk

Have a question? Want to talk? Ask it on our [Google Group](https://groups.google.com/forum/#!forum/OpenF2) or on [Ost.io](http://ost.io/OpenF2).

### Bug Tracking

To track bugs or issues, we are using [Issues on GitHub](https://github.com/OpenF2/F2/issues).

### Copyright and License

F2 is released under the MIT License.

Copyright &copy; 2012 Markit On Demand, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.