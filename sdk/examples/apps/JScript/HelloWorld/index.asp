<%@ Language = JScript %>
<!-- #include file="json.asp" -->
<%

var apps = decodeURIComponent(Request.QueryString("params"));
var app = JSON.parse(apps)[0];  // this App doesn't support batchedRequests

var serverPath = [
	String(Request.ServerVariables("HTTPS")).toLowerCase() == "on" ? "https://" : "http://",
	Request.ServerVariables("SERVER_NAME"),
	String(Request.ServerVariables("SCRIPT_NAME")).replace("index.asp", "")
].join('');

if (app) {
	Response.ContentType = "application/javascript";
	Response.Write("F2_jsonpCallback_com_openf2_examples_jscript_helloworld(" + JSON.stringify({
		scripts:[
			serverPath + "app.js"
		],
		styles:[],
		inlineScripts:[],
		apps:[
			{
				html:[
					'<div class="well">',
						'<div class="f2-app-view" data-f2-view="home">',
							'JScript ' + (app.isSecure ? 'Secure' : '') + ' Hello World!',
						'</div>',
						'<form class="f2-app-view hide" data-f2-view="settings">',
							'<span class="help-block">Some explanatory text of the options below.</span>',
							'<label class="checkbox">',
								'<input type="checkbox"> Option 1',
							'</label>',
							'<label class="checkbox">',
								'<input type="checkbox"> Option 2',
							'</label>',
							'<label class="checkbox">',
								'<input type="checkbox"> Option 3',
							'</label>',
							'<label class="checkbox">',
								'<input type="checkbox"> Option 4',
							'</label>',
							'<div class="form-actions">',
								'<button type="submit" class="btn btn-primary">Save</button> ',
								'<button type="button" class="btn cancel">Cancel</button>',
							'</div>',
						'</form>',
					'</div>'
				].join('')
			}
		]
	}) + ");");
}
%>