F2_jsonpCallback_com_openf2_examples_javascript_helloworldlocale({
	"scripts":[
		"../apps/JavaScript/HelloWorldLocale/appclass.js"
	],
	"styles":[],
	"apps":[
		{
			"html":[
				'<div>',
					'<div class="f2-app-view" data-f2-view="home">',
						'<p>A simple app demonstrating internationalization (i18n) support in F2.</p>',
						'<div class="alert alert-warning" role="alert">Current locale: <b id="current_locale"></b></div>',
						'<p>Today\'s date&mdash;properly formatted for the current locale&mdash;is:</p>',
						'<div class="alert alert-success lead" role="alert" id="current_locale_date"></div>',
						'<p><i>Change region in the "locale" dropdown in the menubar.</i></p>',
					'</div>',
				'</div>'
			].join("")
		}
	]
})