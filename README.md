# An open framework for the financial services industry.

F2 is an open and free web integration framework designed to help you and other financial industry participants develop custom solutions that combine the best tools and content from multiple providers into one, privately-labeled, seamlessly integrated front-end. The [essential components](http://docs.openf2.org/index.html#framework) defined by the F2 specification are the Container, Apps, Context and Store&mdash;all supported under the hood by **[F2.js](http://docs.openf2.org/f2js-sdk.html)**, a JavaScript SDK which provides an extensible foundation powering all F2-based web applications. 

F2 is currently maintained by [Markit On Demand](http://www.markitondemand.com) and you're encouraged to read [more details about the management of the F2 spec](http://docs.openf2.org/#spec-management). Visit [OpenF2.org](http://www.openf2.org) for more information and follow [@OpenF2](http://twitter.com/OpenF2) on Twitter.

## Quick Start

Clone the repo, `git clone https://github.com/OpenF2/F2.git`, or [download the latest version](https://github.com/OpenF2/F2/zipball/master).

Now you've got F2, you are ready to start building F2 containers or apps. Read the [Get Started documentation](http://docs.openf2.org/app-development.html) for F2 apps to begin. If you simply want to see examples, point your browser at `http://path/to/your/F2/examples/`.

**Important**: If you simply want to build F2 [containers](http://docs.openf2.org/container-development.html) or [apps](http://docs.openf2.org/app-development.html), you can **skip** the [Build F2](#build-f2-) section below. You do not need the command line to work with F2.

## Versioning

To adhere to industry standards, F2 will be maintained under the Semantic Versioning guidelines as much as possible.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

For more information on SemVer, please visit <http://semver.org/>.

You can run this command to check the version of your local copy of F2 (if you've [setup the build](#developers)):

`$> grunt version`

## Talk

Have a question? Want to chat? Open an [Issue on GitHub](https://github.com/OpenF2/F2/issues), ask it on our [Google Group](https://groups.google.com/forum/#!forum/OpenF2) or send an email to <info@openf2.org>.

## Bug Tracking

To track bugs and issues, we are using [Issues on GitHub](https://github.com/OpenF2/F2/issues).

## Developers

If you just want to build F2 [containers](http://docs.openf2.org/container-development.html) and/or [apps](http://docs.openf2.org/app-development.html), you can **skip the [Build F2](#build-f2)** section below. You do not need the command line to work with F2.

### Build F2 [![Build Status](https://travis-ci.org/OpenF2/F2.png?branch=master)](https://travis-ci.org/OpenF2/F2)

For those wishing to [contribute back to F2](CONTRIBUTING.md), we've included a `Gruntfile` for use with [Grunt](http://gruntjs.com/) which contains the logic for compiling and testing F2.js and the specification docs. Grunt is built on top of [Node.js](http://nodejs.org/) and is installed via [npm](https://npmjs.org/).

To configure your environment, be sure you have Node installed and run the following command from the project root directory:

`$> npm install`

Depending on your configuration, you may need to be an admin to install some of these Node packages. Additionally, some packages may need to be [installed globally](http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation/) using the `-g` switch. If the installation fails due to directory permissions, use:

`$> sudo npm install`

This command will install the [Grunt CLI](http://gruntjs.com/getting-started#installing-the-cli) in addition to all dependencies needed to run the `Gruntfile`.

To **build F2**, run:

`$> grunt`

For help, run:

`$> grunt --help`

We are using [markitdown](https://github.com/markitondemand/markitdown), a lightweight pandoc wrapper, for converting markdown files to HTML for the [docs](http://docs.openf2.org). [pandoc](https://github.com/jgm/pandoc) is required for markitdown.

#### NuGet Package

Good news if you're using C#! We have an [F2 NuGet package available](https://nuget.org/packages/F2/). In the Package Manager Console run:

`PM> Install-Package F2`

### Collaboration 

Join our team and help contribute to F2 on GitHub. Begin by reading our [contribution guidelines](CONTRIBUTING.md), and then start by [forking the repo](https://github.com/OpenF2/F2/fork_select), sending [pull requests](https://help.github.com/articles/using-pull-requests), or [submitting issues](https://github.com/OpenF2/F2/issues).

## Copyright and License

Copyright &copy; 2013 Markit On Demand, Inc.

"F2" is licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: 

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and limitations under the License.

Please note that F2 ("Software") may contain third party material that Markit On Demand Inc. has a license to use and include within the Software (the "Third Party Material").  A list of the software comprising the Third Party Material and the terms and conditions under which such Third Party Material is distributed are reproduced in the [ThirdPartyMaterial.md](ThirdPartyMaterial.md) file. The inclusion of the Third Party Material in the Software does not grant, provide nor result in you having acquiring any rights whatsoever, other than as stipulated in the terms and conditions related to the specific Third Party Material, if any. 

