/**
 * This code is only for the documentation site. Don't use it anywhere else.
 *
 */

//don't let hash links jump docs
/*
$('section [href^=#]').click(function (e) {
	e.preventDefault()
})*/


// Quick address bar hide on devices like the iPhone
//---------------------------------------------------
//http://remysharp.com/2010/08/05/doing-it-right-skipping-the-iphone-url-bar/
function quickHideAddressBar() {
	/mobi/i.test(navigator.userAgent) && !location.hash && setTimeout(function () {
	  if (!pageYOffset) window.scrollTo(0, 1);
	}, 0);
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

/**
 * Takes <pre><code>something();</code></pre> and converts to <pre>something();</pre>
 * Removes unneeded CSS classnames, adds correct ones for prettify.js
 * Calls prettyPrint()
 *
 */
function formatSourceCodeElements(){
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

/*
 * Completely TEMPORARY addition for editors' notes only.
 */
function makeEditorsNotesBold(){
	$("span.label-warning").parent().addClass("editors-note well well-large");
}

/**
 * Build TOC based on markitdown-generated section elements in DOM
 *
 */
function buildTableOfContents(){
	var toc = $('#toc');
	var docs = $('#docs');
	var file = location.pathname.split('/').pop();

	var tocHeight = function(){
		return toc.outerHeight();
	}

	var pageHeight = function(){
		return docs.outerHeight();
	}

	if (pageHeight() < tocHeight()){
		//docs.parent().height(tocHeight() + 200);
	}

	//build individual nav items
	function tocItem(item, group) {
		var label = item.children().first().text();
		var el = $('<li><a href="#' + item.attr('id') + '">' + label + '</a></li>');

		el.appendTo(group);
		el.append(buildToc(item));

		$('a', el).click(function() {
			$('ul.nav-list li.active').removeClass('active');
			$(this).parent().addClass('active');
		});
	}

	//build table of contents based on sections within generated markdown file
	function buildToc(root) {
		var sections = $('> section', root).filter(".level2");//find <section> elements in main content area

		if (!sections.length) {
			return;
		}

		var group = $('<ul class="nav nav-list"></ul>');

		sections.each(function(idx, item) {
			tocItem($(item), group);
		});

		return group;
	}

	//build sub-menu nav list for each main/parent nav
	$('li a', toc).each(function(idx, item) {
		item = $(item);
		var url = $(item).attr('href'),
			subMenu,
			isTemp = file == "index-temp.html" && url == "index.html";

		if (file == url || (!file && url == 'index.html') || isTemp) {
			subMenu = buildToc(docs);

			item.parent()
				.addClass('active')
				.append(subMenu)
			;
			return false;
		}
	});
}

/**
 * Let's do this.
 *
 */
$(function() {

	buildTableOfContents();
	setActiveNav();
	formatSourceCodeElements();
	$("a[rel=tooltip]","#docs").tooltip();
	
	makeEditorsNotesBold();

	//affix nav
	$("#toc > ul.nav").affix();

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

	quickHideAddressBar();

});