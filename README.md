F2: Open Financial Framework
=================

**Helping you build smarter financial applications**

F2 is a web integration framework designed specifically for the financial markets. Its primary use is for integrating multi-party web applications into a single seamless desktop or mobile experience. It was created and is maintained by [Markit](http://www.markit.com).

To get started or to learn more, visit [OpenF2.com](http://www.openF2.com). Follow F2 on Twitter [@OpenF2](http://twitter.com/OpenF2).

## Developers

### Quick Start

Clone the repo, `git clone https://github.com/OpenF2/F2.git`, or [download the latest version](https://github.com/OpenF2/F2/zipball/master).

If you've cloned the repo and are ready to start building a F2 app, [read the documentation](http://docs.openf2.com/developing-f2-apps.html#developing-your-f2-app).

### Build F2

We've included a `build.js` file in the project which contains the logic for compiling F2.js and the documentation. The build script runs on Node.js, and has a few dependencies. To install, `cd` to your `F2` folder, and run the following command in npm:

`$> npm install uglify-js wrench yuidocjs optimist`

`$> npm install markitdown -g`

To **build F2**, run:

`$> node build`

For help, run:

`$> node build -h`

### Collaboration 

Help contribute to F2 on GitHub. Begin by [forking the repo](https://github.com/OpenF2/F2/fork_select), sending [pull requests](https://help.github.com/articles/using-pull-requests), or [submitting issues](https://github.com/OpenF2/F2/issues).

### Versioning

To adhere to industry standards, F2 will be maintained under the Semantic Versioning guidelines as much as possible.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

For more information on SemVer, please visit <http://semver.org/>.

### Mailing List/Forum

Have a question? Ask it on our Google Group.

<OpenF2@googlegroups.com>

<https://groups.google.com/forum/#!forum/OpenF2>

### Bug Tracking

To track bugs or issues, we are using Issues here on GitHub. Please search across open issues before submitting new ones to prevent any duplicates.

<https://github.com/OpenF2/F2/issues>

### Copyright and License

F2 is released under the MIT License.

Copyright &copy; 2012 Markit Group Limited.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.