var express = require('express');
var sleep = require('sleep');
var app = express();

// For post data
app.use(express.bodyParser());

// Slow response so we can test aborting requests
app.all('/apps/slow', function(req, res) {
	var configs = JSON.parse(req.body.params);

	if (!configs) {
		configs = JSON.parse(req.params.params);
	}

	var context = configs[0].context || {};

	// Sleep for a couple seconds to simulate slow responses
	sleep.sleep(2);

	res.json({
		apps: [{ data: context, html: '<div></div>', success: true }],
		inlineScripts: [],
		scripts: ['js/apps/' + configs[0].appId + '.js'],
		styles: []
	});
});

// Single AppManifest in response
app.all('/apps/single', function(req, res) {
	var configs = JSON.parse(req.body.params);

	if (!configs) {
		configs = JSON.parse(req.params.params);
	}

	var context = configs[0].context || {};

	res.json({
		apps: [{ data: context, html: '<div></div>', success: true }],
		inlineScripts: [],
		scripts: ['js/apps/' + configs[0].appId + '.js'],
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

// Simulate a slow jsonp call
app.all('/apps/single_jsonp_slow', function(req, res) {
	sleep.sleep(2);

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