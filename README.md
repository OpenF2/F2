# F2 enables smarter financial apps.

<img src="http://www.gravatar.com/avatar/81a91ece480ee15ae86a26a7a818b620.png?s=128" align="right">

The goal of F2 is to define a [development standard](http://docs.openf2.org) for the financial services industry that offers a cost saving, risk-reducing method for building innovative, multi-provider solutions.

F2 makes **integration** simple, standardized and modern. It's the next-generation of content integration created by [the team](http://www.markit.com/Product/Markit-On-Demand) who has the most experience developing integrated solutions in financial services.

Visit [OpenF2.org](http://www.openf2.org) and follow [@OpenF2](http://twitter.com/OpenF2) on Twitter.

## Demos

Visit [docs.openf2.org](http://docs.openf2.org/index.html#examples) for a list of all available demos, including [jsFiddle](http://jsfiddle.net/user/OpenF2js/fiddles/) and [Codepen](http://codepen.io/OpenF2/) examples.

## Contributing

F2 is currently maintained by [Markit On Demand](http://www.markit.com/Product/Markit-On-Demand) and governed by an [Advisory Board](http://www.openf2.org/#advisory-board) (shown below).

![image](http://www.openf2.org/img/advisory-board.png)

Join the team and help contribute to F2 on GitHub. Begin by reading our [contribution guidelines](CONTRIBUTING.md), and then start by [forking the repo](https://github.com/OpenF2/F2/fork), sending [pull requests](https://help.github.com/articles/using-pull-requests), or [submitting issues](https://github.com/OpenF2/F2/issues).

**Thank you to the [growing list of contributors](https://github.com/OpenF2/F2/graphs/contributors)!**

## Developers [![Build Status](https://travis-ci.org/OpenF2/F2.svg?branch=master)](https://travis-ci.org/OpenF2/F2) [![Slack](https://openf2-slack.herokuapp.com/badge.svg)](https://openf2.slack.com)

### Get F2.js

* Choose a [F2.js package](http://docs.openf2.org/f2js-sdk.html#packages), including [F2.basic.js](https://raw.github.com/OpenF2/F2/master/sdk/packages/f2.basic.min.js) (7kb, minified and gzipped)
* Grab any version of F2 [on cdnjs.com](http://cdnjs.com/libraries/F2/).
* For .NET developers: install the [NuGet Package](https://nuget.org/packages/F2/) or `PM> Install-Package F2`
* Bower: `bower install F2`

### Docs

The F2 development standard and API docs are available at [docs.openf2.org](http://docs.openf2.org).

### Contributions

#### Setup

Be sure you have cloned this repository and have [Node.js](http://nodejs.org/) installed, then run the following command from the project root:

`$> npm install`

This command will install the [Grunt CLI](http://gruntjs.com/getting-started#installing-the-cli) in addition to all dependencies needed to build F2. Some packages may need to be [installed globally](http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation/) using the `-g` switch.

#### Build F2

After any edits to the core F2 javascript or docs, run this task to compile dist:

`$> grunt`

For help and a list of available grunt tasks, run:

`$> grunt --help`

### Versioning

The latest version of F2.js will always be in `master` and the version number/release date is available on the command line by using:

`$> grunt version`

In accordance with industry standards, F2 is currently maintained, in as far as reasonably possible, under the Semantic Versioning guidelines. Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

For more information on SemVer, please visit [SemVer.org](http://semver.org/).

#### Upgrading

It is our goal to make upgrading to the latest version of F2 a minor effort for development teams. [Read more in the Docs](http://docs.openf2.org/f2js-sdk.html#upgrading).

### Issues, Enhancements, Bugs

Have a question? Find a bug? Open an [Issue on GitHub](https://github.com/OpenF2/F2/issues), post a topic on the [Google Group](https://groups.google.com/forum/#!forum/OpenF2) or send an email to <info@openf2.org>.

To track bugs, issues and enhancement requests, we are using [Issues on GitHub](https://github.com/OpenF2/F2/issues).

## Copyright and License

Copyright &copy; 2015 Markit On Demand, Inc.

"F2" is licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: 

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and limitations under the License.

Please note that F2 ("Software") may contain third party material that Markit On Demand Inc. has a license to use and include within the Software (the "Third Party Material").  A list of the software comprising the Third Party Material and the terms and conditions under which such Third Party Material is distributed are reproduced in the [ThirdPartyMaterial.md](ThirdPartyMaterial.md) file. The inclusion of the Third Party Material in the Software does not grant, provide nor result in you having acquiring any rights whatsoever, other than as stipulated in the terms and conditions related to the specific Third Party Material, if any. 

