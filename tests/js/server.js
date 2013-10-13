var express = require('express');
var app = express();

// Single AppManifest in response
app.all('/apps/single', function(req, res) {
	res.json({
		apps: [{ data: {}, html: '<div></div>', success: true }],
		inlineScripts: [],
		scripts: ['js/apps/com_test_basic.js'],
		styles: []
	});
});

// Multiple AppManifests in response
app.all('/apps/multiple', function(req, res) {
	res.json({
		apps: [
			{ data: {}, html: '<div></div>', success: true },
			{ data: {}, html: '<div></div>', success: true }
		],
		inlineScripts: [],
		scripts: [
			'js/apps/com_test_basic.js',
			'js/apps/com_test_inherited.js'
		],
		styles: []
	});
});

// Duplicate AppManifests in response
app.all('/apps/duplicate', function(req, res) {
	res.json({
		apps: [
			{ data: {}, html: '<div></div>', success: true },
			{ data: {}, html: '<div></div>', success: true }
		],
		inlineScripts: [],
		scripts: ['js/apps/com_test_basic.js'],
		styles: []
	});
});

// Single AppManifests over jsonp
app.all('/apps/single_jsonp', function(req, res) {
	res.jsonp({
		apps: [
			{ data: {}, html: '<div></div>', success: true }
		],
		inlineScripts: [],
		scripts: ['js/apps/com_test_basic.js'],
		styles: []
	});
});

// export the module for use with grunt
module.exports = app;