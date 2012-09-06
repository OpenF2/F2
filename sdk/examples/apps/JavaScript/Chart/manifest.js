F2_jsonpCallback_com_markh_highchartsChart({
    "scripts":[
    	"http://code.highcharts.com/highcharts.js",
        "../../apps/JavaScript/Chart/chart.js"
    ],   
    "styles":[
        "../../apps/JavaScript/Chart/chart.css"
    ],   
    "apps":[{
      "html":[
      			'<div class="f2-app-view well" data-f2-view="home">',
					'<div class="btn-group">',
						'<a class="btn btn-small dropdown-toggle" data-toggle="dropdown" href="#">',
				    		'Change timeframe <span class="caret"></span>',
				  		'</a>',
				  		'<ul class="dropdown-menu">',
				    		'<li><a href="#" data-timeframe="30">1 month</a></li>',
				    		'<li class="active"><a href="#" data-timeframe="90">3 months</a></li>',
				    		'<li><a href="#" data-timeframe="180">6 months</a></li>',
				    		'<li><a href="#" data-timeframe="365">1 year</a></li>',
				  		'</ul>',
					'</div>',
					'<div id="chartDemoContainer"></div>',
				'</div>'
			].join("")
    }]
})

