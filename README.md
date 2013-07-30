# An open web framework for the financial services industry.

<img src="https://secure.gravatar.com/avatar/4a9321787652abeea63089c8fdf0face?s=125" align="right">

F2 is an open and free web integration framework designed to help the financial services community develop custom solutions that combine the best tools and content from multiple parties into one, privately-labeled, seamlessly integrated front-end. The [essential components](http://docs.openf2.org/index.html#framework) core to the framework are containers, apps, context, and the Registry&mdash;all supported under the hood by **[F2.js](http://docs.openf2.org/f2js-sdk.html)**, a JavaScript SDK which provides an extensible foundation powering all F2-enabled web applications.

F2 is currently maintained by [Markit On Demand](http://www.markitondemand.com). Visit [OpenF2.org](http://www.openf2.org) for more information and follow [@OpenF2](http://twitter.com/OpenF2) on Twitter.

## Quick Start

Clone the repo, `git clone https://github.com/OpenF2/F2.git`, or [download the latest version](https://github.com/OpenF2/F2/zipball/master).

Browse to the **Get Started** documentation for [containers](http://docs.openf2.org/container-development.html#get-started) or [apps](http://docs.openf2.org/app-development.html#get-started).

### Download F2.js

* Development: [F2.debug.js](https://github.com/OpenF2/F2/blob/master/sdk/f2.debug.js)
* Production: [F2.js](https://github.com/OpenF2/F2/blob/master/F2.latest.js) (34.3kb)


## Developers [![Build Status](https://travis-ci.org/OpenF2/F2.png?branch=master)](https://travis-ci.org/OpenF2/F2)

**Important**: If you just want to develop F2 containers or apps, you can skip the section below. _You do not need the command line, Node.js or Grunt to develop with F2_.

### Packages

Packages are variants of F2.js. They are ideally used when, for example, a container already has jQuery or [sandboxed apps](http://docs.openf2.org/app-development.html#secure-apps) aren't needed. [Read more about F2 packages](http://docs.openf2.org/f2js-sdk.html#packages).

* Basic: 
    * Development: [F2.basic.js](https://github.com/OpenF2/F2/blob/master/sdk/packages/f2.basic.js)
    * Production: [F2.basic.min.js](https://github.com/OpenF2/F2/blob/master/sdk/packages/f2.basic.min.js) (7.6kb)
* No easyXDM:
    * Development: [f2.no-easyXDM.js](https://github.com/OpenF2/F2/blob/master/sdk/packages/f2.no-easyXDM.js)
    * Production: [f2.no-easyXDM.min.js](https://github.com/OpenF2/F2/blob/master/sdk/packages/f2.no-easyXDM.min.js) (30.4kb)	    	    
* No Bootstrap: 
    * Development: [F2.no-bootstrap.js](https://github.com/OpenF2/F2/blob/master/sdk/packages/f2.no-bootstrap.js)
    * Production: [F2.no-bootstrap.min.js](https://github.com/OpenF2/F2/blob/master/sdk/packages/f2.no-bootstrap.min.js) (33.6kb)
* No jQuery, Bootstrap:
    * Development: [f2.no-jquery-or-bootstrap.js](https://github.com/OpenF2/F2/blob/master/sdk/packages/f2.no-jquery-or-bootstrap.js) 
    * Production: [f2.no-jquery-or-bootstrap.min.js](https://github.com/OpenF2/F2/blob/master/sdk/packages/f2.no-jquery-or-bootstrap.min.js) (11.5kb)


### Build F2

For those [contributing to F2](CONTRIBUTING.md), you'll need to setup your dev environment. To configure it, be sure you have [Node.js](http://nodejs.org/) installed, then run the following command from the project root directory:

`$> npm install`

This command will install the [Grunt CLI](http://gruntjs.com/getting-started#installing-the-cli) in addition to all dependencies needed to build F2. Depending on your configuration, you may need to be an admin to install some of these Node packages. Additionally, some packages may need to be [installed globally](http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation/) using the `-g` switch. If the installation fails due to directory permissions, use:

`$> sudo npm install`

We are using [markitdown](https://github.com/markitondemand/markitdown), a lightweight pandoc wrapper, for converting markdown files to HTML for the [F2 docs](http://docs.openf2.org). [Pandoc](http://johnmacfarlane.net/pandoc/index.html) is required for markitdown and there are [installation packages available](http://johnmacfarlane.net/pandoc/installing.html) for Windows and Mac OS.

To **build F2**, run:

`$> grunt`

For help and a list of available tasks, run:

`$> grunt --help`

_Some Mac users have run into a Grunt "cannot run in wd" error when using `grunt` and/or `npm install`. If you're getting that error in your shell, try using `--unsafe-perm` [as discussed here](https://github.com/isaacs/npm/issues/2984)._

### Versioning

The latest version of F2.js will always be in `master` and the version number/release date is available on the command line by using:

`$> grunt version`.

In accordance with industry standards, F2 is currently maintained, in as far as reasonably possible, under the Semantic Versioning guidelines.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

For more information on SemVer, please visit [SemVer.org](http://semver.org/).

### Upgrading

It is our goal to make upgrading to the latest version of F2 a minor effort for development teams. For more notes on upgrading your container or app to the latest version of F2, [read more in the Docs](http://docs.openf2.org/f2js-sdk.html#upgrading).

### Issues, Enhancements, Bugs

Have a question? Want to chat? Open an [Issue on GitHub](https://github.com/OpenF2/F2/issues), ask it on our [Google Group](https://groups.google.com/forum/#!forum/OpenF2) or send an email to <info@openf2.org>.

To track bugs, issues and enhancement requests, we are using [Issues on GitHub](https://github.com/OpenF2/F2/issues).

### NuGet Package

Good news if you're using C#! We have an [F2 NuGet package available](https://nuget.org/packages/F2/). In your Package Manager Console run:

`PM> Install-Package F2`

### Collaboration 

Join our team and help contribute to F2 on GitHub. Begin by reading our [contribution guidelines](CONTRIBUTING.md), and then start by [forking the repo](https://github.com/OpenF2/F2/fork_select), sending [pull requests](https://help.github.com/articles/using-pull-requests), or [submitting issues](https://github.com/OpenF2/F2/issues).

Thank you to the [growing list of contributors](https://github.com/OpenF2/F2/graphs/contributors)!

## Copyright and License

Copyright &copy; 2013 Markit On Demand, Inc.

"F2" is licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: 

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and limitations under the License.

Please note that F2 ("Software") may contain third party material that Markit On Demand Inc. has a license to use and include within the Software (the "Third Party Material").  A list of the software comprising the Third Party Material and the terms and conditions under which such Third Party Material is distributed are reproduced in the [ThirdPartyMaterial.md](ThirdPartyMaterial.md) file. The inclusion of the Third Party Material in the Software does not grant, provide nor result in you having acquiring any rights whatsoever, other than as stipulated in the terms and conditions related to the specific Third Party Material, if any. 

