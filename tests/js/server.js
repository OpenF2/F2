var express = require('express');
var app = express();

// Single AppManifest in response
app.post('/get_single', function(req, res) {
	res.json({
		apps: [{ data: {}, html: '<div></div>', success: true }],
		inlineScripts: [],
		scripts: ['js/apps/com_test_basic.js'],
		styles: []
	});
});

// Multiple AppManifests in response
app.post('/get_multiple', function(req, res) {
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
app.post('/get_duplicate', function(req, res) {
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

// export the module for use with grunt
module.exports = app;