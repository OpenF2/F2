# Getting Started with F2

<p class="lead">The goal of F2 is to define a development standard for the financial services industry that offers a cost saving, risk-reducing method for building innovative, multi-provider solutions.</p>

Below you'll find links to the various sections of the F2 development standard as well as F2.js API reference documentation.

* * * *

<div class="docs-3x">
	<div class="row">
	  <div class="col-sm-4 align-center">
	    <h2><a href="container-development.html"><i class="fa fa-desktop fa-lg"></i></a></h2>
	    <h3>F2 Container</h3>
	    <p class="detail">For Container Providers</p>
	    <div><a href="container-development.html" class="btn btn-primary">Setup a Container</a></div>
	  </div>
	  <div class="col-sm-4 align-center">
	    <h2><a href="app-development.html"><i class="fa fa-cubes fa-lg"></i></a></h2>
	    <h3>F2 Apps</h3>
	    <p class="detail">For App Providers</p>
	    <div><a href="app-development.html" class="btn btn-primary">Develop Apps</a></div>
	  </div>
	  <div class="col-sm-4 align-center">
	    <h2><a href="./sdk"><i class="fa fa-code fa-lg"></i></a></h2>
	    <h3>API Reference</h3>
	    <p class="detail">For Container and App Developers</p>
	    <div><a href="./sdk" class="btn btn-primary">F2.js Reference</a></div>
	  </div>
	</div>
</div>

* * * *

## Latest Version

**The latest version of F2 is {{version}} which was released on {{_releaseDateFormatted}}**.

F2 v1.0 was originally open sourced in October 2012. A detailed [changelog](https://github.com/OpenF2/F2/wiki/Changelog) and [roadmap](https://github.com/OpenF2/F2/wiki/Roadmap) are available on GitHub.

<script src="https://gist.github.com/anonymous/3836902fbfbb14a7f186.js"></script>

<a href="https://github.com/OpenF2/F2/releases" class="btn btn-success">Download version {{version}}</a>

* * * *

## Examples

There are a few different types of examples available below.

<div class="media">
	<a class="media-left" href="http://www.openf2.org/examples"><i class="fa fa-compass"></i></a>
	<div class="media-body">
		<h4 class="media-heading">Examples</h4>
		Visit [openF2.org/examples](http://www.openf2.org/examples) for a live demo of production-grade Apps in a basic Container.
	</div>
</div>

<div class="media">
	<a class="media-left" href="http://docs.openf2.org/F2-examples.zip"><i class="fa fa-download"></i></a>
	<div class="media-body">
		<h4 class="media-heading">Download</h4>
		A variety of example Containers and Apps to [download](http://docs.openf2.org/F2-examples.zip) and run on your localhost. Most are "plain" javascript, others are written in .NET, PHP and Node.js. The [examples source code is also on GitHub](https://github.com/OpenF2/F2/tree/master/examples).
	</div>
</div>

<div class="media">
	<a class="media-left" href="http://jsfiddle.net/user/OpenF2js/fiddles/"><i class="fa fa-jsfiddle"></i></a>
	<div class="media-body">
		<h4 class="media-heading">jsFiddle</h4>
		Review a collection of fiddles on [jsfiddle.net/user/openF2js](http://jsfiddle.net/user/OpenF2js/fiddles/).
	</div>
</div>

<div class="media">
	<a class="media-left" href="http://codepen.io/OpenF2/"><i class="fa fa-codepen"></i></a>
	<div class="media-body">
		<h4 class="media-heading">Codepen</h4>
		Review a collection of pens on [codepen.io/openF2](http://codepen.io/OpenF2/).
	</div>
</div>

<div class="media">
	<a class="media-left" href="http://openf2.github.io/iOS-Container/"><i class="fa fa-apple"></i></a>
	<div class="media-body">
		<h4 class="media-heading">iOS Demo App</h4>
		An [iOS app](http://openf2.github.io/iOS-Container/) demonstrating F2 App integration using UIWebViews, a javascript bridge for [F2 Context](container-development.html#context), and a native symbol search control.
	</div>
</div>

* * * *

## Resources & Help

Have a question? Find a bug? Need help? 

<div class="media">
	<a class="media-left" href="#"><i class="fa fa-book"></i></a>
	<div class="media-body">
		<h4 class="media-heading">Guides</h4>
		_Coming soon..._
	</div>
</div>

<div class="media">
	<a class="media-left" href="https://github.com/OpenF2/F2/issues"><i class="fa fa-github"></i></a>
	<div class="media-body">
		<h4 class="media-heading">GitHub Issues</h4>
		Browse and submit to [Issues on GitHub](https://github.com/OpenF2/F2/issues) for bug reports, enhancement requests, etc. 
	</div>
</div>

<div class="media">
	<a class="media-left" href="https://openf2.slack.com/"><i class="fa fa-slack"></i></a>
	<div class="media-body">
		<h4 class="media-heading">Slack</h4>
		Join [F2's Slack](https://openf2.slack.com/) for real-time project updates. <br>
		_Slack is invite-only, [get yours now](http://openf2-slack.herokuapp.com/)!_
	</div>
</div>

<div class="media">
	<a class="media-left" href="https://groups.google.com/forum/#!forum/OpenF2"><i class="fa fa-google"></i></a>
	<div class="media-body">
		<h4 class="media-heading">OpenF2 Google Group</h4>
		Use the F2 mailing list on [Google Groups](https://groups.google.com/forum/#!forum/OpenF2) for support.
	</div>
</div>

<div class="media">
	<a class="media-left" href="mailto:info@openf2.org"><i class="fa fa-envelope"></i></a>
	<div class="media-body">
		<h4 class="media-heading">Email</h4>
		You can always email [info@openF2.org](mailto:info@openf2.org) with questions.
	</div>
</div>

* * * *

## Specification

The F2 development standard will continuously evolve to bring the community the best features, services and apps. F2's promise is to do this by building on the existing spec, not by changing it. The specification aims high to solve many problems and suit many needs. As the standard evolves and new requirements come to light, the functionality in F2 will expand accordingly. 

### Notational Conventions

The keywords "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", and "OPTIONAL" in this spec are to be interpreted as described in [RFC 2119](http://tools.ietf.org/html/rfc2119). For readability, these words often do not appear in all uppercase letters.

* * * *

## Contribute to F2

Join our team and help contribute to F2 on GitHub. Begin by reading our [contribution guidelines](https://github.com/OpenF2/F2/blob/master/CONTRIBUTING.md), and then start by [forking the repo](https://github.com/OpenF2/F2/fork), sending [pull requests](https://help.github.com/articles/using-pull-requests), or [submitting issues](https://github.com/OpenF2/F2/issues).

Thank you to the [growing list of contributors](https://github.com/OpenF2/F2/graphs/contributors)!
