var express = require('express');
var path = require('path');
var app = express();

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

	setTimeout(function() {
		res.json({
			apps: [{
				data: context,
				html: '<div></div>'
			}],
			inlineScripts: [],
			scripts: ['js/apps/' + configs[0].appId + '.js'],
			styles: []
		});
	}, 500);
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
			html: '<div></div>'
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
			html: '<div></div>'
		}, {
			data: {},
			html: '<div></div>'
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
			html: '<div></div>'
		}, {
			data: {},
			html: '<div></div>'
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
			html: '<div></div>'
		}],
		inlineScripts: [],
		scripts: ['js/apps/com_test_basic.js'],
		styles: []
	});
});

// Simulate a slow jsonp call
app.all('/apps/single_jsonp_slow', function(req, res) {
	setTimeout(function() {
		res.jsonp({
			apps: [{
				data: {},
				html: '<div></div>'
			}],
			inlineScripts: [],
			scripts: ['js/apps/com_test_basic.js'],
			styles: []
		});
	}, 500);
});

// Simulate a data app
app.all('/apps/data_app', function(req, res) {
	res.json({
		apps: [{
			data: {}
		}],
		inlineScripts: [],
		scripts: ['js/apps/com_test_basic.js'],
		styles: []
	});
});

// Force an error
app.all('/apps/error', function(req, res) {
	res.send(500, 'Uh oh!');
});

// export the module for use with grunt
module.exports = app;
