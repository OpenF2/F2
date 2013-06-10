% F2.js SDK

<p class="lead">F2 enables all of us to build exactly the financial solutions that our customers want. Using the F2 Framework, you can efficiently create fully-integrated, multi-vendor, multi-asset class and multi-channel apps and deploy them in as many app ecosystems as you want.</p>

Developers who adhere to the F2 standard will make it possible for multiple apps, developed independently by different organizations, to function together creating a seamless and integrated experience.

* * * *

## F2.js

F2 is an open framework and to get Container and App Developers started, there is a JavaScript SDK&mdash;called F2.js&mdash;in addition to example apps as part of an open-source project maintained on [GitHub](https://github.com/OpenF2/F2/).

* * * *

## Download

Anyone is free to download F2.js from the [F2 project repository on GitHub](https://github.com/OpenF2/F2/). Once downloaded, F2.js can be added to any web page using a script tag:

```javascript
<script src="/path/to/your/container/f2.js"></script>
```

The latest version of F2.js is **{{version}}**.

<p><a href="https://raw.github.com/OpenF2/F2/master/f2.js" class="btn btn-primary">Download F2.js {{version}}</a> <a href="https://github.com/OpenF2/F2/" class="btn" target="_blank">View on GitHub</a></p>

* * * *

## Versioning

The latest version of F2.js will always be in the project root, and the version number is in the top of file. The version number is also available on the command line by using:

`$> grunt version`.

To adhere to industry standards, F2 will be maintained under the Semantic Versioning guidelines as much as possible.

Releases will be numbered with the following format:

`<major>.<minor>.<patch>`

For more information on SemVer, please visit [SemVer.org](http://semver.org/).

* * * *

## Upgrading

It is a goal of ours to make upgrading to the latest version of F2 a minor effort for development teams. The details from each release of F2, minor and major, are tracked in the [changelog](https://github.com/OpenF2/F2/wiki/Changelog). As of version 1.2, no breaking changes have been introduced and therefore upgrading should be as simple as [downloading the latest copy of F2.js](https://raw.github.com/OpenF2/F2/master/sdk/f2.min.js) and updating your website.

Developers can quick-link to the latest copy of F2.js:

`https://raw.github.com/OpenF2/F2/master/f2.js`

<span class="label label-info">Note</span> GitHub is [not a CDN](http://stackoverflow.com/questions/5502540/should-github-be-used-as-a-cdn-for-javascript-libraries).

A download ([zip](https://github.com/OpenF2/F2/zipball/master)) of the current version ({{version}}) of F2 is always available along with [tags of previous releases](https://github.com/OpenF2/F2/tags).

### Deprecated Features

There is a page on the wiki [tracking deprecated features in F2](https://github.com/OpenF2/F2/wiki/F2.js-Deprecated) and, starting with version 1.2, three `ContainerConfig` properties have been retired. As F2 features and/or F2.js APIs are deprecated, advance notice will be provided on any or all of the F2 [communication channels](https://github.com/OpenF2/F2/blob/master/CONTRIBUTING.md#keep-in-touch). In addition, backward compatibility will be maintained for at least one minor version of F2. For example, if `Feature X` is deprecated in `1.0`, backward compatibility will be maintained until at least version `1.1`. F2 documentation will be updated accordingly to reflect any changes, and the conversation behind deprecated features will be publicly [available on GitHub](https://github.com/OpenF2/F2/issues).


### Third Party Libraries

F2 uses third party libraries inside F2.js (see [Framework: Choices](http://docs.openf2.org/#choices)). These open-source libraries are all on different release schedules and when an update (or important security patch) is made available, the F2 team will take action to ensure F2.js uses the latest, most stable and most secure version of the third party software. These updates to F2 will be made through the normal release process on GitHub and comments will be open.

## Forum

Have a question? Ask it on the [F2 Google Group](https://groups.google.com/forum/#!forum/OpenF2) or start a discussion using [Issues on GitHub](https://github.com/OpenF2/F2/issues).

<OpenF2@googlegroups.com>

* * * *

## Bug Tracking

To track bugs or issues, F2 is using [Issues on GitHub](https://github.com/OpenF2/F2/issues).

* * * *

## License

F2 is licensed under the Apache License version 2.0. Details are available in the [project readme](https://github.com/OpenF2/F2#copyright-and-license).
