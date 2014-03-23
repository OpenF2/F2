var express = require('express');
var path = require('path');
var app = express();

// Stop the current thread for X seconds
var sleep = function(seconds) {
	var now = new Date();

	while (true) {
		var timespan = (new Date().getTime() - now.getTime()) / 1000;

		if (timespan >= seconds) {
			break;
		}
	}
};

// For post data
app.use(express.bodyParser());

// Serve static files
app.use(express.static(path.resolve(__dirname + '../../../')));

app.set('jsonp callback', true);

// Slow response so we can test aborting requests
app.all('/apps/slow', function(req, res) {
	var configs = JSON.parse(req.body.params);

	if (!configs) {
		configs = JSON.parse(req.params.params);
	}

	var context = configs[0].context || {};

	// Sleep for a couple seconds to simulate slow responses
	sleep(0.5);

	res.json({
		apps: [{
			data: context,
			html: '<div></div>',
			success: true
		}],
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
		apps: [{
			data: context,
			html: '<div></div>',
			success: true
		}],
		inlineScripts: [],
		scripts: ['js/apps/' + configs[0].appId + '.js'],
		styles: []
	});
});

// Multiple AppManifests in response
app.all('/apps/multiple', function(req, res) {
	res.json({
		apps: [{
			data: {},
			html: '<div></div>',
			success: true
		}, {
			data: {},
			html: '<div></div>',
			success: true
		}],
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
	var configs = JSON.parse(req.body.params);

	if (!configs) {
		configs = JSON.parse(req.params.params);
	}

	res.json({
		apps: [{
			data: {},
			html: '<div></div>',
			success: true
		}, {
			data: {},
			html: '<div></div>',
			success: true
		}],
		inlineScripts: [],
		scripts: ['js/apps/' + configs[0].appId + '.js'],
		styles: []
	});
});

// Single AppManifests over jsonp
app.all('/apps/single_jsonp', function(req, res) {
	res.jsonp({
		apps: [{
			data: {},
			html: '<div></div>',
			success: true
		}],
		inlineScripts: [],
		scripts: ['js/apps/com_test_basic.js'],
		styles: []
	});
});

// Simulate a slow jsonp call
app.all('/apps/single_jsonp_slow', function(req, res) {
	sleep(0.5);

	res.jsonp({
		apps: [{
			data: {},
			html: '<div></div>',
			success: true
		}],
		inlineScripts: [],
		scripts: ['js/apps/com_test_basic.js'],
		styles: []
	});
});

// export the module for use with grunt
module.exports = app;
