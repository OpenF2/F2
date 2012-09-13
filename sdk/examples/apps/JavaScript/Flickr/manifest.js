/* 
 * Callback function name must include "appId" as configured by Container 
 * 
 * Couple things 
 *    - Would be great if InlineScripts were legible
 *    - Same with Apps.HTML
 *
 */
F2_jsonpCallback_com_openf2_examples_javascript_helloworld({
	"scripts":[
		"../../apps/JavaScript/Flickr/flickrApp.js"
	],
	"styles":[

	],
	"apps":[
		{
			"html":[
				"<div class=well>",
					"<div class='f2-app-view' data-f2-view='home'>",
					"<p>Hello Container. I'm talking to Flickr's <a href='http://www.flickr.com/services/api/flickr.interestingness.getList.html'>Interestingness API</a>.</p>",
					"<div class='imgPlaceholder'></div>",
				"</div>",
				"<div class='f2-app-view hide' data-f2-view='about'>",
					"<h3>About</h3>",
					"<p>This is a pretty basic app that talks to Flickr's interestingness API and shows the most recent photograph.</p>",
					"<p><a href='#' class='f2-app-view-trigger' data-f2-view='home'>&laquo; Back</a>",
				"</div>",
			"</div>"].join("")
		}
	]
})