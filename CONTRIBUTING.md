# How to Contribute to F2

F2 is an open and free web integration framework designed to help you and other financial industry participants develop custom solutions that combine the best tools and content from multiple providers into one, privately-labeled, seamlessly integrated front-end.

F2 is currently maintained by [Markit On Demand](http://www.markitondemand.com) and you're encouraged to contribute to this project right here on GitHub. The following are guidelines for contributing; please familiarize yourself before sending pull requests.

## Getting Started

A couple of ground rules.

* Make sure you have a [GitHub account](https://github.com/signup/free).
* [Submit a ticket for your issue](https://github.com/OpenF2/F2/issues), assuming one does not already exist. (Search first!)
	* Clearly describe the issue including steps to reproduce when it is a bug.
	* Be sure to include the F2 version number.
* Fork the F2 repository on GitHub.

## Making Changes

* Create a branch from where you want to base your changes.
* Do not work directly in `master`; create a branch _based on_ `master` using `git checkout -b 'your_branch_name' master`.
* Follow our [coding standards](https://github.com/OpenF2/F2/wiki/Contributing-to-F2).
* Preferably add _and document_ unit test(s) for your changes. 
* Re-run all the Jasmine tests to confirm your changes didn't break anything.
* Perform browser testing in our [supported browsers](wiki/Browser-Compatibility).
* Add a detailed commit message.

## Submitting Changes

* Push committed changes to your branch.
* [Submit a pull request](https://help.github.com/articles/using-pull-requests) in the F2 project repository.
* Add a message or additional detail for your changes in the pull request.
* Wait for your change to be reviewed.


## Coding Standards

Coding standards promote a common vocabulary and syntax so that our fellow developers can concentrate on _what_ you're saying rather than on _how_ you're saying it. It is ultimately up to you how you write your own code, but please become familiar with the standards and use them when contributing back to F2.

Coding standards help an individual project, and also make it easier for one project to reuse components from another project. This, of course, is a core component of F2.

Read our [coding standards](https://github.com/OpenF2/F2/wiki/Coding-Standards) on the wiki.

## Keep in Touch

If you have any questions while writing code to contribute back to F2, contact us on our [Google Group](https://groups.google.com/forum/#!forum/OpenF2), find us on Twitter [@OpenF2](https://twitter.com/OpenF2) or by email at [info@openf2.org](mailto:info@openf2.org). You can also follow [our blog](http://blog.openf2.org) for more in-depth F2 updates.

## Resources

* [F2 Google Group](https://groups.google.com/forum/#!forum/OpenF2)
* [F2 Coding Standards](https://github.com/OpenF2/F2/wiki/Coding-Standards)
* [GitHub Documentation: Using Pull Requests](https://help.github.com/articles/using-pull-requests)
* [GitHub Documentation](https://help.github.com/)
* [Markit On Demand](http://www.markitondemand.com/)