F2_jsonpCallback_com_openf2_examples_javascript_quote({
	"scripts":[
		"../apps/JavaScript/Quote/appclass.js"
	],
	"styles":[
		"../apps/JavaScript/Quote/app.css"
	],
	"apps":[
		{
			"html":[
				'<div>',
					'<div class="f2-app-view" data-f2-view="home">',
						'<table class="table table-condensed">',
							'<caption></caption>',
							'<tbody></tbody>',
							'<tfoot>',
								'<tr class="hide">',
									'<td colspan="2">',
										'<a href="javascript:;" class="pull-right" data-watchlist-add="">+Add <span></span> to Watchlist</a>',
									'</td>',
								'</tr>',
								'<tr>',
									'<td colspan="2">',
										'<div class="input-append">',
											'<input type="text" name="lookup" class="input-small">',
											'<button type="button" class="btn">Get New Quote</button>',
										'</div>',
									'</td>',
								'</tr>',
							'</tfoot>',
						'</table>',
					'</div>',
					'<form class="f2-app-view hide" data-f2-view="settings">',
						'<h3>Settings</h3>',
						'<span class="help-block">This App can listen for symbol changes from nearby Apps or the page as a whole and automatically request a quote for the symbol.</span>',
						'<span class="help-block">Symbol Change Mode</span>',
						'<label class="radio">',
							'<input type="radio" name="refreshMode" value="page"> Page',
						'</label>',
						'<label class="radio">',
							'<input type="radio" name="refreshMode" value="app"> App',
						'</label>',
						'<label class="radio">',
							'<input type="radio" name="refreshMode" value="manual"> Manual',
						'</label>',
						'<span class="help-block">This App can also refresh the quote every 30 seconds</span>',
						'<label class="checkbox">',
							'<input type="checkbox" name="autoRefresh"> Auto-Refresh Enabled',
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