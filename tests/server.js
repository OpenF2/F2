var express = require('express');
var app = express();

/**
 * Standard endpoint that serves one app
 */
app.use('/singleAppTest', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.end('F2_jsonpCallback_com_test_single(' + JSON.stringify({
		apps: [
			{ html: '<div></div>' }
		]
	}) + ')');
});

/**
 * Second standard endpoint that serves one app
 */
app.use('/singleAppTest2', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.end('F2_jsonpCallback_com_test_single2(' + JSON.stringify({
		apps: [
			{ html: '<div></div>' }
		]
	}) + ')');
});

/**
 * Checks whether a GET or a POST was used when making the request. This method
 * will output an AppManifest with an AppClass that will log some data.
 * See container-spec.js and search for httpPostTest
 */
app.use('/httpPostTest', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.end('F2_jsonpCallback_com_test_app(' + JSON.stringify({
		inlineScripts: [
			[
				'F2.Apps["com_test_app"] = function(appConfig, appContent, root) {',
					'F2.log(appContent.data.method == "POST");',
				'};'
			].join('')
		],
		apps: [
			{
				data: {
					method: req.method
				},
				html: '<div></div>'
			}
		]
	}) + ')');
});

/**
	* Provide an endpoint for making batch requests
	*/
app.use('/batchRequestTest', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.end('F2_jsonpCallback_com_test_batchable(' + JSON.stringify({
		apps: [
			{ html: '<div></div>' },
			{ html: '<div></div>' }
		]
	}) + ')');
});

// export the module for use with grunt
module.exports = app;