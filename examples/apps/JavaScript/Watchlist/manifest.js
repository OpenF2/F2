F2_jsonpCallback_com_openf2_examples_javascript_watchlist({
	"scripts":[
		"../apps/JavaScript/Watchlist/jquery.cookie.js",
		"../apps/JavaScript/Watchlist/moment.1.7.0.min.js",
		"../apps/JavaScript/Watchlist/appclass.js"
	],
	"styles":[
		"../apps/JavaScript/Watchlist/watchlist.css"
	],
	"apps":[
		{
			"html":[
				'<div>',
					'<div class="f2-app-view" data-f2-view="home">',
						'<div class="watchlist"></div>',
						'<div class="input-group">',
							'<input type="text" name="lookup" class="form-control input-sm">',
							'<span class="input-group-btn"><button type="button" class="btn btn-primary btn-sm add">Add to List</button></span>',
						'</div>',
						'<p>',
							'<small>Market data delayed at least 15 minutes. <a href="http://developer.yahoo.com/yql/" target="_blank">By Yahoo!</a></small>',
						'</p>',
					'</div>',
					'<form class="f2-app-view hide" data-f2-view="settings">',
						'<h3>Settings</h3>',
						'<span class="help-block">This App can listen for symbols from nearby Apps which allows <em>other apps</em> to add symbols to this watchlist.</span>',
						'<span class="help-block">Allow Symbols from Nearby Apps</span>',
						'<div class="radio"><label>',
							'<input type="checkbox" name="allowExternalAdd" checked="checked"> Yes',
						'</label></div>',
						'<div class="form-actions">',
							'<button type="button" class="btn btn-primary btn-custom1 save">Save</button> ',
							'<button type="button" class="btn btn-default btn-custom2 cancel f2-app-view-trigger" data-f2-view="home">Cancel</button>',
						'</div>',
					'</form>',
					'<div class="f2-app-view hide" data-f2-view="about">',
						'<h3>About</h3>',
						'<p>Quick Quote App v0.12.3</p>',
						'<p><a href="#" class="f2-app-view-trigger" data-f2-view="home">&laquo; Back</a>',
					'</div>',
				'</div>'
			].join("")
		}
	]
})