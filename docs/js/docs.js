/**
 * This code is only for the documentation site. Don't use it anywhere else.
 *
 */

var F2Docs = function(){

}

F2Docs.fn = F2Docs.prototype;

F2Docs.fn.init = function() {
	
	this.mobile_hideAddressBar();
	this.watchScroll();
	this.navbarDocsHelper();
	this.buildLeftRailToc();
	
	this.formatSourceCodeElements();

	//affix left nav
	$("#toc > ul.nav").affix();

	//not sure this is needed long-term
	$("a[rel=tooltip]","#docs").tooltip();

	//this.setupTablets();
}

/**
 * Hide address bar on page load
 * http://remysharp.com/2010/08/05/doing-it-right-skipping-the-iphone-url-bar/
 */
F2Docs.fn.mobile_hideAddressBar = function(){
	/mobi/i.test(navigator.userAgent) && !location.hash && setTimeout(function () {
	  if (!pageYOffset) window.scrollTo(0, 1);
	}, 0);
};

F2Docs.fn.bindEvents = function(){

	//don't let hash links jump docs
	/*
	$('section [href^=#]').click(function (e) {
		e.preventDefault()
	})*/


}

F2Docs.fn.watchScroll = function(){

	//if (!Modernizr.isTablet){

		$(window).on("scroll",function(){
			var $win = $(this),
				scrollPos = $win.scrollTop(),
				$body = $(this),
				winWidth = $win.width();

			//only add this class to desktop browsers
			if (winWidth > 979 && scrollPos > 0) {
				$("body")[(scrollPos > 0) ? "addClass" : "removeClass"]("navbarmini");
			} else {
				$("body").removeClass("navbarmini");
			}
		});

		//desktop browser resizing
		$(window).on("resize",function(){
			if ($(this).width() < 980){
				$("body").removeClass("navbarmini");
			}
		});
	//} else {
		//$("body").addClass("navbarmini");
	//}

}

/**
 * Helper for oft-used stuff

F2Docs.fn.winData = function(){

	var agent = navigator.userAgent.toLowerCase();

	return {
		$body: $("body"),
		scrWidth: screen.width,
		scrHeight: screen.height,
		elemWidth: document.documentElement.clientWidth,
		elemHeight: document.documentElement.clientHeight,
		otherBrowser: (agent.indexOf("series60") != -1) || (agent.indexOf("symbian") != -1) || (agent.indexOf("windows ce") != -1) || (agent.indexOf("blackberry") != -1),
		mobileOS: typeof orientation != 'undefined' ? true : false,
		touchOS: ('ontouchstart' in document.documentElement) ? true : false,
		iOS: (navigator.platform.indexOf("iPhone") != -1) || (navigator.platform.indexOf("iPad") != -1) ? true : false,
		android: (agent.indexOf("android") != -1) || (!this.iOS && !this.otherBrowser && this.touchOS && this.mobileOS) ? true : false
	}
}

F2Docs.fn.setupTablets = function(){
	alert(Modernizr.isTablet + ", "+ this.winData().scrWidth)
	if (Modernizr.isTablet && this.winData().scrWidth < 768){
		this.winData().$body.addClass("navbarmini");
	}
}
 */


/** 
 * Highlight Basics or Development nav item, based on filename
 */
F2Docs.fn.navbarDocsHelper = function(){
	var $toc 	= $('ul','div.navbar-docs'),
		file 	= location.pathname.split('/').pop(),
		urlMap 	= {
			"basics": 		"index.html",
			"development": 	"developing-f2-apps.html",
			"developmentC": "developing-f2-containers.html",
			"developmentE": "extending-f2.html"
		};

	//remove all 
	$toc.find("a").removeClass("active");

	if (file == urlMap.basics || !file || file == "index-temp.html"){
		$toc.find("li").first().find("a").addClass("active");
		this.currentPage = "basics";
	} else if (file == urlMap.development || file == urlMap.developmentC || file == urlMap.developmentE){
		$toc.find("li").eq(1).find("a").addClass("active");
		this.currentPage = "development";
	}
}

//Don't reorder these without consequences in this._getCurrentDevSubSection()
F2Docs.fn.devSubSections = {
	"Developing F2 Apps": 		"developing-f2-apps.html",
	"Developing F2 Containers": "developing-f2-containers.html",
	"Extending F2": 			"extending-f2.html"
};

F2Docs.fn._getCurrentDevSubSection = function(){
	var file = location.pathname.split('/').pop(),
		currSection,
		counter = 0;

	$.each(this.devSubSections,$.proxy(function(idx,item){
		if (item == file) {
			currSection = counter;
		}
		counter++;
	},this));

	return currSection;
}

F2Docs.fn._buildDevSubSectionsHtml = function(){
	var html = [];

	$.each(this.devSubSections,$.proxy(function(idx,item){
		html.push("<li><a href='{url}' data-parent='true'>{label}</a></li>".supplant({url:item, label: idx}));
	},this));

	return html;
}

F2Docs.fn.buildLeftRailToc = function(){

	var $toc 			= $('div.span12','div.navbar-docs'),
		$docsContainer 	= $('#docs'),
		file 			= location.pathname.split('/').pop(),
		$sections 		= $('> section', $docsContainer),
		$sectionsL2		= $sections.filter("section.level2"),//find <section> elements in main content area
		$sectionsL3		= $sections.filter("section.level3")
		$navWrap 		= $('<ul class="nav nav-list"></ul>')
		$listContainer	= $('<ul class="nav nav-list"></ul>'),
		$pageHeading	= $("h1",$docsContainer);

	//build table of contents based on sections within generated markdown file
	if (!$sections.length) return;

	//quickly touch <h1> and add an ID attr. this regex removes all spaces and changes to dashes.
	$pageHeading.prop("id", $pageHeading.text().toLowerCase().replace(/\s+/g, '-'));

	//OK, we are on the development section, add the sub-sections
	if ("development" == this.currentPage){
		$navWrap.append(this._buildDevSubSectionsHtml());
	}

	//need to add very first section (page title/<h1>)
	if ("development" != this.currentPage){
		$listContainer.append("<li class='active'><a href='#{id}'>{label}</a></li>".supplant({id: "top", label: $pageHeading.text()}));
	}

	//loop over all sections, build nav based on <h2>'s inside the <section.level2>
	$sections.each($.proxy(function(idx,item){

		var $item = $(item),
			sectionTitle = $item.children().first().text(),
			sectionId = $item.prop("id"),
			$li;

		$li = $("<li><a href='#{id}' data-id='{id}'>{label}</a></li>".supplant({id: sectionId, label: sectionTitle}));

		$listContainer.append($li);
	},this));

	//now, determine *where* to insert links. 
	// if they are Level2 
	if ($listContainer.find("li").length){
		if ("development" == this.currentPage){
			$navWrap
				.find("li")
				.eq(this._getCurrentDevSubSection())
				.addClass("active")
				.append($listContainer)
			;
		} else {
			//we are on Basics, and have no subnav. 
			//navWrap *is* the list.
			$navWrap = $listContainer;
		}
	}

	//append links
	$("#toc").html($navWrap);

	//add click event
	$("a",$navWrap).on("click",function(e){
		var $this = $(this);

		$("li.active",$navWrap).removeClass("active");
		$this.parent().addClass("active");

		//handle shift in padding as navbarmini gets added to body
		if (!$this.data("parent") && $this.data("id") != "top" && !$("body").hasClass("navbarmini")){
			$("body").addClass("navbarmini");
		}
	});

}

/**
 * Takes <pre><code>something();</code></pre> and converts to <pre>something();</pre>
 * Removes unneeded CSS classnames, adds correct ones for prettify.js
 * Calls prettyPrint()
 *
 */
F2Docs.fn.formatSourceCodeElements = function(){
	$("pre")
		.removeClass("sourceCode")
		.addClass("prettyprint")
		.find("code").replaceWith(function() {
			return $(this).contents();
		})
		.end()
		.filter(".javascript")
		.removeClass("javascript")
		.addClass("lang-js")
		.end()
		.filter(".html")
		.removeClass("html")
		.addClass("lang-html")
	;
	window.prettyPrint && prettyPrint();
}



/**
 * Finds and sets active navigation element based on hash, if one exists
 *
 */
function setActiveNav(){
	var hash = location.hash;
	if (!hash) { 
		return; 
	}
	var $lis = $("li ul li", "#toc");//get all <li> elements that are visible children of current page's nav
	$lis.each(function(idx,item){
		var $item = $(item);
		if (hash == $item.find("a").attr("href") && !$item.hasClass("active")){//if hash value is found in links but not yet set to active, highlight it and remove active class from parent element.
			$item.addClass("active");
			$item.parents("li.active").removeClass("active");//removes from parent LI
			return false;
		}
	});


}



/*
 * Completely TEMPORARY addition for editors' notes only.
 */
function makeEditorsNotesBold(){
	$("span.label-warning").parent().addClass("editors-note well well-large");
}


/**
 * Let's do this.
 *
 */
(function(){
	try{ 
		Modernizr.addTest("isTablet",function(){

			var agent = navigator.userAgent.toLowerCase();
			var scrWidth = screen.width;
			var scrHeight = screen.height;
			// The document.documentElement dimensions seem to be identical to
			// the screen dimensions on all the mobile browsers I've tested so far
			var elemWidth = document.documentElement.clientWidth;
			var elemHeight = document.documentElement.clientHeight;
			// We need to eliminate Symbian, Series 60, Windows Mobile and Blackberry
			// browsers for this quick and dirty check. This can be done with the user agent.
			var otherBrowser = (agent.indexOf("series60") != -1) || (agent.indexOf("symbian") != -1) || (agent.indexOf("windows ce") != -1) || (agent.indexOf("blackberry") != -1);
			// If the screen orientation is defined we are in a modern mobile OS
			var mobileOS = typeof orientation != 'undefined' ? true : false;
			// If touch events are defined we are in a modern touch screen OS
			var touchOS = ('ontouchstart' in document.documentElement) ? true : false;
			// iPhone and iPad can be reliably identified with the navigator.platform
			// string, which is currently only available on these devices.
			var iOS = (navigator.platform.indexOf("iPhone") != -1) ||
			        (navigator.platform.indexOf("iPad") != -1) ? true : false;
			// If the user agent string contains "android" then it's Android. If it
			// doesn't but it's not another browser, not an iOS device and we're in
			// a mobile and touch OS then we can be 99% certain that it's Android.
			var android = (agent.indexOf("android") != -1) || (!iOS && !otherBrowser && touchOS && mobileOS) ? true : false;

			if ((android || iOS) && scrWidth > 320 && scrWidth < 769){
				return true;
			} else {
				return false;
			}


		});
	}catch(e){}
})();


$(function() {

	F2Docs = new F2Docs();
	F2Docs.init();
	

	setActiveNav();
	makeEditorsNotesBold();

	

	//scrollspy
	//$("body").attr("data-spy","scroll").attr("data-target","#toc").attr("data-offset",0);

	//Keep nav aligned -- TEMP
	$('section [href^=#]').click(function (e) {
		window.setTimeout(function(){
			$("li ul li", "#toc").removeClass('active');
			setActiveNav()
		},100)
	});

	//$(window).bind('hashchange', function() {
	//	setActiveNav();
	//});


});

if (!String.prototype.supplant) {
    String.prototype.supplant = function (o) {
        return this.replace(/{([^{}]*)}/g,
            function (a, b) {
                var r = o[b];
                return typeof r === 'string' || typeof r === 'number' ? r : a;
            }
        );
    };
}

