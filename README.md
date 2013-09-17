# An open web framework for the financial services industry.

<img src="https://secure.gravatar.com/avatar/4a9321787652abeea63089c8fdf0face?s=125" align="right">

F2 is an open and free web integration framework designed to help the financial services community develop custom web and mobile applications. These solutions can combine the best tools and content from multiple parties into one, privately-labeled, seamlessly integrated front-end.

F2 is currently maintained by [Markit On Demand](http://www.markitondemand.com). Visit [OpenF2.org](http://www.openf2.org) for more information, follow [@OpenF2](http://twitter.com/OpenF2) on Twitter and subscribe to the [F2 blog](http://blog.openf2.org).

## Get Started

Two core components of F2 are **containers** and **apps** which are stitched together by **F2.js**. Get started by browsing to the framework documentation at [**docs.openf2.org**](http://docs.openf2.org).

## Developers [![Build Status](https://travis-ci.org/OpenF2/F2.png?branch=master)](https://travis-ci.org/OpenF2/F2)


### Get F2.js

* **Production**: [F2.js](https://raw.github.com/OpenF2/F2/master/F2.latest.js) (34.3kb, minified and gzipped)
* **Development**: [F2.debug.js](https://raw.github.com/OpenF2/F2/master/sdk/f2.debug.js)
* **[F2.js packages](http://docs.openf2.org/f2js-sdk.html#packages)** are also available, including [F2.basic.js](https://raw.github.com/OpenF2/F2/master/sdk/packages/f2.basic.min.js) (7kb, minified and gzipped)
* We have [CDN support](http://blog.openf2.org/2013/09/f2-now-on-cdnjs.html)&mdash;get F2.js and any packages **[on cdnjs.com](http://cdnjs.com/libraries/F2/)**.
* For .NET developers: install the **[NuGet Package](https://nuget.org/packages/F2/)**.

### Get Examples

Example containers and apps can be found in at least two places: [openf2.org/examples](http://www.openf2.org/examples) and in the [downloadable F2 examples](http://docs.openf2.org/F2-examples.zip) zip archive. There are also [numerous jsFiddles](http://docs.openf2.org/container-development.html#requesting-apps-on-demand) available in the documentation. This repository contains examples, too. 

* Clone this repository using `git clone git@github.com:OpenF2/F2.git`, or
* Download the [latest version](https://github.com/OpenF2/F2/zipball/master) of this repository

### Docs

We have robust documentation divided into three main sections:

* Understanding [the Basics](http://docs.openf2.org)
* Developing [apps](http://docs.openf2.org/app-development.html),  [containers](http://docs.openf2.org/container-development.html), or [F2 plugins](http://docs.openf2.org/extending-f2.html).
* [F2.js API](http://docs.openf2.org/sdk/classes/F2.html)


### Contribute to F2

Join our team and help contribute to F2 on GitHub. Begin by reading our [contribution guidelines](CONTRIBUTING.md), and then start by [forking the repo](https://github.com/OpenF2/F2/fork), sending [pull requests](https://help.github.com/articles/using-pull-requests), or [submitting issues](https://github.com/OpenF2/F2/issues).

**Thank you to the [growing list of contributors](https://github.com/OpenF2/F2/graphs/contributors)!**

#### Setup

Be sure you have cloned this repository and have [Node.js](http://nodejs.org/) installed, then run the following command from the project root directory:

`$> npm install`

This command will install the [Grunt CLI](http://gruntjs.com/getting-started#installing-the-cli) in addition to all dependencies needed to build F2. Depending on your configuration, you may need to be an admin to install some of these Node packages. Additionally, some packages may need to be [installed globally](http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation/) using the `-g` switch. If the installation fails due to directory permissions, use:

`$> sudo npm install`

We are using [markitdown](https://github.com/markitondemand/markitdown), a lightweight pandoc wrapper, for converting markdown files to HTML for the [F2 docs](http://docs.openf2.org). **[Pandoc](http://johnmacfarlane.net/pandoc/index.html) is required** for markitdown and there are [installation packages available](http://johnmacfarlane.net/pandoc/installing.html) for Windows and Mac OS.

#### Build F2

To compile F2.js and the accompanying docs, run:

`$> grunt`

For help and a list of available grunt tasks, run:

`$> grunt --help`

### Versioning

The latest version of F2.js will always be in `master` and the version number/release date is available on the command line by using:

`$> grunt version`.

In accordance with industry standards, F2 is currently maintained, in as far as reasonably possible, under the Semantic Versioning guidelines. Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

For more information on SemVer, please visit [SemVer.org](http://semver.org/).

#### Upgrading

It is our goal to make upgrading to the latest version of F2 a minor effort for development teams. [Read more in the Docs](http://docs.openf2.org/f2js-sdk.html#upgrading).

### Issues, Enhancements, Bugs

Have a question? Find a bug? Open an [Issue on GitHub](https://github.com/OpenF2/F2/issues), post a topic on the [Google Group](https://groups.google.com/forum/#!forum/OpenF2) or send an email to <info@openf2.org>.

To track bugs, issues and enhancement requests, we are using [Issues on GitHub](https://github.com/OpenF2/F2/issues).

## Copyright and License

Copyright &copy; 2013 Markit On Demand, Inc.

"F2" is licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: 

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and limitations under the License.

Please note that F2 ("Software") may contain third party material that Markit On Demand Inc. has a license to use and include within the Software (the "Third Party Material").  A list of the software comprising the Third Party Material and the terms and conditions under which such Third Party Material is distributed are reproduced in the [ThirdPartyMaterial.md](ThirdPartyMaterial.md) file. The inclusion of the Third Party Material in the Software does not grant, provide nor result in you having acquiring any rights whatsoever, other than as stipulated in the terms and conditions related to the specific Third Party Material, if any. 

