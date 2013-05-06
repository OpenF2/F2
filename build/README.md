### Build F2 [![Build Status](https://travis-ci.org/OpenF2/F2.png?branch=master)](https://travis-ci.org/OpenF2/F2)

For those wishing to [contribute back to F2](../CONTRIBUTING.md), we've included a `build` file in the project which contains the logic for compiling F2.js and the specification docs. The build script runs [Node.js](http://nodejs.org/) and has a few dependencies. To configure your environment, be sure you have Node installed and run the following command from the project root directory:

`$> npm install`

Depending on your configuration, you may need to be an admin to install some of these Node packages. Additionally, some packages may need to be [installed globally](http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation/) using the `-g` switch. If the installation fails due to directory permissions, use:

`$> sudo npm install`

Additionally, some packages may need to be [installed globally](http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation/) using the `-g` switch.

To **build F2**, `cd` to the `build` directory and run:

For help, run:

`$> node build -h`

We are using [markitdown](https://github.com/markitondemand/markitdown), a lightweight pandoc wrapper, for converting markdown files to HTML for the [docs](http://docs.openf2.org). [pandoc](https://github.com/jgm/pandoc) is required for markitdown.

#### NuGet Package

Good news if you're using C#! We have an [F2 NuGet package available](https://nuget.org/packages/F2/). In the Package Manager Console run:

`PM> Install-Package F2`

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

Copyright &copy; 2013 Markit On Demand, Inc.

"F2" is licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: 

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and limitations under the License.

Please note that F2 ("Software") may contain third party material that Markit on Demand Inc. has a license to use and include within the Software (the "Third Party Material").  A list of the software comprising the Third Party Material and the terms and conditions under which such Third Party Material is distributed are reproduced in the [ThirdPartyMaterial.md](../ThirdPartyMaterial.md) file. The inclusion of the Third Party Material in the Software does not grant, provide nor result in you having acquiring any rights whatsoever, other than as stipulated in the terms and conditions related to the specific Third Party Material, if any. 
