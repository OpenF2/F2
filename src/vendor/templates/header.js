// Create a local exports object to attach all CommonJS modules to
var _exports = {};
var _module = { exports: { } };

// Create a fake window object
var _window = {
	document: window.document,
	// Reqwest looks at XMLHttpRequest
	XMLHttpRequest: window.XMLHttpRequest,
	ActiveXObject: window.ActiveXObject,
	XDomainRequest: window.XDomainRequest
};

!(function(exports, window, f2Window, module) {
