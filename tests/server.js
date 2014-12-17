var express = require('express');
var app = express();
app.set('json spaces', 2);

//wrap up AppManifest response
var getResponse = function(req,id,manifest){
	var body = JSON.stringify(manifest);
	if (req.method == 'POST'){
		return body;
	} else {
		return 'F2_jsonpCallback_' + id + '(' + body + ');';
	}
};

/**
 * Checks whether a GET or a POST was used when making the request. This method
 * will output an AppManifest with an AppClass that will log some data.
 * See container-spec.js and search for httpPostTest
 */
app.use('/F2/apps/test/http-post', function(req, res) {
	res.setHeader('Content-Type', 'text/javascript');
	res.send(getResponse(req,'com_test_app',{
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
	}));
});

app.all('/F2/apps/test/hello-world', function(req,res){
	var manifest = {
		inlineScripts: [],
		scripts: [],
		styles: [],
		apps: [{
			html: '<div class="f2-app-view" data-f2-view="home">Hello world!</div>',
			status: 'success' 
		}]
	};
	res.setHeader('Content-Type', 'text/javascript');
	res.send(getResponse(req,'com_openf2_examples_javascript_helloworld',manifest));
});

app.all('/F2/apps/test/market-news', function(req,res){
	var manifest = {
		inlineScripts: [],
		scripts: [],
		styles: [],
		apps: [{
			html: '<div class="f2-app-view" data-f2-view="home">Hello market news!</div>',
			status: 'success' 
		}]
	};
	res.setHeader('Content-Type', 'text/javascript');
	res.send(getResponse(req,'com_openf2_examples_csharp_marketnews',manifest));
});

app.all('/F2/apps/test/com_openf2_tests_helloworld', function(req,res){
	var manifest = {
		inlineScripts: [],
		scripts: [],
		styles: [],
		apps: [{
			html: '<div class="f2-app-view" data-f2-view="home">Hello world test!</div>',
			status: 'success' 
		}]
	};
	res.setHeader('Content-Type', 'text/javascript');
	res.send(getResponse(req,'com_openf2_tests_helloworld',manifest));
});

app.all('/F2/apps/test/hello-world-node', function(req,res){
	var manifest = {
		inlineScripts: [],
		scripts: ['http://www.openf2.org/apps/com_openf2_examples_nodejs_helloworld/appclass.js'],
		styles: ['http://www.openf2.org/apps/com_openf2_examples_nodejs_helloworld/app.css'],
		apps: [{
			html: "<div><div data-f2-view=\"home\" class=\"f2-app-view\"><h1 class=\"page-header\">Hello, World!</h1><p class=\"lead\">This demonstrates a simple \"Hello World\" F2 App. </p><h4>Container Developers</h4><p>If you're a Container Provider and want to learn how to integrate F2 into your website, <a href=\"http://docs.openf2.org/container-development.html#developing-f2-containers\">browse to the Container docs</a>.</p><h4>App Developers</h4><p>If you're an App Provider and want to learn how to build F2 apps, <a href=\"http://docs.openf2.org/app-development.html#developing-f2-apps\">browse to the App docs</a>.</p><hr/><p>Get your hands on an example F2 Container and Apps! </p><button onclick=\"location.href=&quot;http://docs.openf2.org/F2-examples.zip&quot;\" class=\"btn btn-primary\">Download F2 Examples</button></div></div>",
			status: 'success' 
		}]
	};
	res.setHeader('Content-Type', 'text/javascript');
	res.send(getResponse(req,'com_openf2_examples_nodejs_helloworld',manifest));
});

// export the module for use with grunt
module.exports = app;