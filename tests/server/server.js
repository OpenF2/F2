var args = process.argv.slice(2);
var port = args[1] || '1015';
var express = require('express');
var app = express();

// serve up static files
app.use('/static', express.static(__dirname + '/static'));


/**
 * Checks whether a GET or a POST was used when making the request. This method
 * will output an AppManifest with an AppClass that will log some data.
 * See container-spec.js and search for httpPostTest
 */
app.use('/httpPostTest', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	res.end('F2_jsonpCallback_com_openf2_tests_helloworld(' + JSON.stringify({
		inlineScripts: [
			[
				'F2.Apps["com_openf2_tests_helloworld"] = function(appConfig, appContent, root) {',
					'F2.log(appContent.data.method === "POST");',
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

app.use(function(req, res) {
	res.end('hello world!');
});

app.listen(port);