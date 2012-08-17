<%@ Language = JScript %>
<!-- #include file="json.asp" -->
<%

var callback = Request.QueryString("callback");
var appRaw = decodeURIComponent(Request.QueryString("app"));
var app = JSON.parse(appRaw);

if (callback && app) {
	Response.ContentType = "application/json";
	Response.Write(callback + "(" + JSON.stringify({
		Scripts:["http://dev2.dev.local/Playground/BrianBaker/OFF/app.js"],
		Styles:[],
		InlineScripts:[
			[
				"F2.Events.once(F2.Constants.Events.APPLICATION_LOAD + \"" + app.instanceId + "\", function (app, appAssets) {",
					"var a = new App_Class(app, appAssets);",
					"a.init();",
				"});"
			].join('')
		],
		Widgets:[
			{
				Html:[
					'<div class="well">',
						'<div class="f2-app-view" data-f2-view="home">',
							'Non-Framework ' + (app.isSecure ? 'Secure' : '') + ' Hello World!',
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