# Contributing to F2

F2 is currently maintained by [Markit On Demand](http://www.markit.com/Product/Markit-On-Demand) and governed by an [Advisory Board](http://www.openf2.org/#advisory-board) (shown below).

![image](http://www.openf2.org/img/advisory-board.png)

Join the team and help contribute to F2 on GitHub. The following are guidelines for contributing; please familiarize yourself before sending pull requests.

**Thank you to the [growing list of contributors](https://github.com/OpenF2/F2/graphs/contributors)!**

## Getting Started

First, a couple of ground rules.

1. Make sure you have a [GitHub account](https://github.com/signup/free).
2. [Submit a ticket for your issue](https://github.com/OpenF2/F2/issues), assuming one does not already exist. **(Search first!)**
   - Clearly describe the issue including steps to reproduce when it is a bug.
   - Include the F2 version number.
3. [Fork the F2 repository](https://github.com/OpenF2/F2/fork).

## New to GitHub?

GitHub has terrific [Guides](http://guides.github.com/) to help developers through various aspects of contributing to open source projects.

## Making Changes

### Understanding the "wip" branch

The latest F2 changes can be found in the `*-wip` branch. This branch's name uses the upcoming version number followed by `-wip` which stands for "work-in-progress", for example `1.3.1-wip` as shown below. There _should_ only be one `-wip` branch at any given time.

Do not work directly in `master`!

![Branches](http://docs.openf2.org/img/branches.png)

### Steps

Once you've forked the F2 repository:

1. Create a new branch in your fork from the next version `*-wip` branch. Do not work directly in `master`!
   - `$> git checkout -b 'your_branch_name' *-wip`
2. Read the F2 [coding standards](https://github.com/OpenF2/F2/wiki/Coding-Standards).
3. Add and document unit test(s) for your changes. **At least one unit test is required** for new or changed functionality.
4. Re-run all the Jasmine tests to confirm your changes didn't break anything. `$> npm test` and/or `$> npm run test-live`
5. Perform browser testing in [supported browsers](https://github.com/OpenF2/F2/wiki/Browser-Compatibility).

### Committing Changes

- You should only commit files you have changed. **Do not commit compiled or generated F2 files**
- After you've staged your changes, add a detailed commit message.
- Push committed changes to your fork's branch.
- [Submit a pull request](https://help.github.com/articles/using-pull-requests) for `F2\*-wip` **not** `F2\master`.
- Add a message or additional detail for your changes in the pull request comments.
- Wait for your change(s) to be reviewed.

## Coding Standards

Coding standards promote a common vocabulary and syntax so that our fellow developers can concentrate on _what_ you're saying rather than on _how_ you're saying it. It is ultimately up to you how you write your own code, but please become familiar with the standards and use them when contributing to F2.

Coding standards help an individual project, and also make it easier for one project to reuse components from another project.

Read our [coding standards](https://github.com/OpenF2/F2/wiki/Coding-Standards).

## Keep in Touch

If you have any questions while writing code to contribute to F2, post a message on the [Google Group](https://groups.google.com/forum/#!forum/OpenF2), find us on Twitter [@OpenF2](https://twitter.com/OpenF2) or by email at [info@openf2.org](mailto:info@openf2.org). You can also follow [our blog](http://blog.openf2.org) for more in-depth F2 updates.

## Resources

- [F2 Google Group](https://groups.google.com/forum/#!forum/OpenF2)
- [F2 Coding Standards](https://github.com/OpenF2/F2/wiki/Coding-Standards)
- [GitHub Documentation: Using Pull Requests](https://help.github.com/articles/using-pull-requests)
- [GitHub Documentation](https://help.github.com/)
