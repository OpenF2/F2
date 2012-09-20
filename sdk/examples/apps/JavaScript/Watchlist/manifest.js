F2_jsonpCallback_com_f2_examples_javascript_watchlist({
	"scripts":[
		"../apps/JavaScript/Watchlist/jquery.cookie.js",
		"../apps/JavaScript/Watchlist/moment.1.7.0.min.js",
		"../apps/JavaScript/Watchlist/app.js"
	],
	"styles":[
		"../apps/JavaScript/Watchlist/watchlist.css"
	],
	"apps":[
		{
			"html":[
				'<div class="well">',
					'<div class="f2-app-view" data-f2-view="home">',
						'<div class="input-append">',
							'<input type="text" name="lookup" class="spanx input-small">',
							'<button type="button" class="btn add">Add Symbol to Watchlist</button>',
						'</div>',
						'<div class="watchlist"></div>',
					'</div>',
					'<form class="f2-app-view hide" data-f2-view="settings">',
						'<h3>Settings</h3>',
						'<span class="help-block">This App can listen for symbols from nearby Apps which allows <em>other apps</em> to add symbols to this watchlist.</span>',
						'<span class="help-block">Allow Symbols from Nearby Apps</span>',
						'<label class="radio">',
							'<input type="checkbox" name="allowExternalAdd" checked="checked"> Yes',
						'</label>',
						'<div class="form-actions">',
							'<button type="button" class="btn btn-primary save">Save</button> ',
							'<button type="button" class="btn cancel f2-app-view-trigger" data-f2-view="home">Cancel</button>',
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