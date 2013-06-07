var express = require('express');
var app = express();

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

// export the module for use with grunt
module.exports = app;