F2_jsonpCallback_com_openf2_examples_javascript_cds({
	"scripts":[
		"../apps/JavaScript/CDS/appclass.js"
	],
	"styles":[
		"../apps/JavaScript/CDS/app.css"
	],
	"apps":[
		{
			"html":[
				'<div>',
					'<div class="f2-app-view" data-f2-view="home">',
						'<p class="cdsDate">',
							'<span></span>',
						'</p>',						
						'<div class="cdsMovers"></div>',
						'<p>',
							'<small>Falling (or narrowing) spreads indicate the perceived risk of default is falling. Rising (or widening) spreads indicate the perceived risk of default is rising.</small>',
						'</p>',
						'<p>',
							'<small>All CDS are denominated in U.S. Dollars except U.S. sovereigns, which are in Euros.</small>',
						'</p>',
					'</div>',					
					'<div class="f2-app-view hide" data-f2-view="about">',
						'<h3>About</h3>',
						'<p>CDS Sovereign Big Movers v 1.0</p>',
						'<p><a href="#" class="f2-app-view-trigger" data-f2-view="home">&laquo; Back</a>',
					'</div>',
				'</div>'
			].join("")
		}
	]
})