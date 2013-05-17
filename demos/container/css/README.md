# Namespaced CSS #

F2 Containers can and should namespace their css so that the container and apps can run separately from any other CSS on the page.  The example container is built from Bootstrap's LESS files as described [http://twitter.github.com/bootstrap/extend.html](http://twitter.github.com/bootstrap/extend.html "here"). To build the CSS for yourself, follow the following instructions:

- [Install Nodejs](http://nodejs.org/ "Install Nodejs")

The following commands should be run from the command-line:

- `$> npm install -g less`
- `$> lessc -x namespaced-css.less > bootstrap.min.css`

The namespaced-css.less file simply namespaces all of the Bootstrap css with a `.f2-example-container` namespace.
