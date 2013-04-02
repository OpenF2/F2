# An open framework for the financial services industry.

F2 is an open and free web integration framework designed to help you and other financial industry participants develop custom solutions that combine the best tools and content from multiple providers into one, privately-labeled, seamlessly integrated front-end. The [essential components](http://docs.openf2.org/index.html#framework) defined by the F2 specification are the Container, Apps, Context and Store&mdash;all supported under the hood by **[F2.js](http://docs.openf2.org/f2js-sdk.html)**, a JavaScript SDK which provides an extensible foundation powering all F2-based web applications. 

F2 is currently maintained by [Markit On Demand](http://www.markitondemand.com) and you're encouraged to read [more details about the management of the F2 spec](http://docs.openf2.org/#spec-management). Visit [OpenF2.org](http://www.openf2.org) for more information and follow [@OpenF2](http://twitter.com/OpenF2) on Twitter.

## Quick Start

Clone the repo, `git clone https://github.com/OpenF2/F2.git`, or [download the latest version](https://github.com/OpenF2/F2/zipball/master).

Now you've got F2, you are ready to start building F2 containers or apps. Read the [Get Started documentation](http://docs.openf2.org/app-development.html) for F2 apps to begin. If you simply want to see examples, point your browser at `http://path/to/your/F2/examples/`.

**Important**: If you simply want to build F2 [containers](http://docs.openf2.org/container-development.html) or [apps](http://docs.openf2.org/app-development.html), you can **skip** the [Build F2](#build-f2) section below. You do not need the command line to work with F2.

## Versioning

To adhere to industry standards, F2 will be maintained under the Semantic Versioning guidelines as much as possible.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

For more information on SemVer, please visit <http://semver.org/>.

You can run this command to check the version of your local copy of F2 (if you've [setup the build](#developers)):

`$> node build -v`

## Talk

Have a question? Want to chat? Open an [Issue on GitHub](https://github.com/OpenF2/F2/issues), ask it on our [Google Group](https://groups.google.com/forum/#!forum/OpenF2) or send an email to <info@openf2.org>.

## Bug Tracking

To track bugs and issues, we are using [Issues on GitHub](https://github.com/OpenF2/F2/issues).

## Developers

If you just want to build F2 [containers](http://docs.openf2.org/container-development.html) and/or [apps](http://docs.openf2.org/app-development.html), you can **skip the [Build F2](#build-f2)** section below. You do not need the command line to work with F2.

### Build F2

For those wishing to contribute back to F2, we've included a `build` file in the project which contains the logic for compiling F2.js and the specification docs. The build script runs on [Node.js](http://nodejs.org/) and has a few dependencies. To install, `cd` to your `F2/build` folder, and run the following commands in npm:

`$> npm install uglify-js@1.3.4 wrench fs-extra yuidocjs optimist handlebars`

`$> npm install less markitdown -g`

Depending on your configuration, you may need to be an admin to install some of these Node packages. Additionally, some packages may need to be [installed globally](http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation/) using the `-g` switch.

To **build F2**, run:

`$> node build`

For help, run:

`$> node build -h`

We are using [markitdown](https://github.com/markitondemand/markitdown), a lightweight pandoc wrapper, for converting markdown files to HTML for the [docs](http://docs.openf2.org).

#### NuGet Package

Good news if you're using C#! We have an [F2 NuGet package available](https://nuget.org/packages/F2/). In the Package Manager Console run:

`PM> Install-Package F2`

### Collaboration 

Join our team and help contribute to F2 on GitHub. Begin by reading our [contribution guidelines](CONTRIBUTING.md), and then start by [forking the repo](https://github.com/OpenF2/F2/fork_select), sending [pull requests](https://help.github.com/articles/using-pull-requests), or [submitting issues](https://github.com/OpenF2/F2/issues).

## Copyright and License

F2 is released under the MIT License.

Copyright &copy; 2013 Markit On Demand, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
