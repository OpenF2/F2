define(['jquery','F2','reqPath','staticPrefix','highlightjs'],function($,F2,reqPath,staticPrefix,hljs){

	/**
	 * This code is only for the F2 documentation site. Don't use it anywhere else, you really shouldn't.
	 * (c) Markit On Demand 2014
	 */

	//F2 docs
	var F2Docs = function(){ }

	//shortcut
	F2Docs.fn = F2Docs.prototype;

	/**
	 * Init
	 */
	F2Docs.fn.initialize = function() {

		this.buildLeftRailToc();
		// this.buildBookmarks();
		
		//affix left nav
		$('#toc > ul.nav').affix({
			offset: {
    			top: 214
    		}
		});

		//add source & feedback links
		$('#feedbackLink').attr('href', $('#feedbackLink').attr('href') + '+' + location.pathname.split('/').pop() );
  		$('#viewSourceLink').attr('href', $('#viewSourceLink').attr('href') + location.pathname.split('/').pop().replace('.html','.md') );
	}

	/**
	 * Add bookmark links to each <h1/2/3/4/5/6>
	 */
	F2Docs.fn.buildBookmarks = function(){
		var $docsContainer = $('#docs'),
			$headers = $('section', $docsContainer).not('.level1,.level2'),
			link = "<a href='#{id}' title='Permalink' name='{id}' class='docs-anchor'><span class='fa fa-bookmark-o'></span></a>";

		$headers.each($.proxy(function(idx,item){
			var $h = $(item).children().first(),
				//name = $h.text(),
				anchor = $(item).prop("id"),
				$link = $(link.supplant({id: anchor}));
				//animate click
				$link.on('click',$.proxy(function(e){
					this._animateAnchor(e,false);
				},this));
			$h.append('&nbsp;').append($link);
		},this));
	}

	/**
	 * Build left rail TOC
	 */
	F2Docs.fn.buildLeftRailToc = function(){

		var $docsContainer 	= $('#docs'),
			file 			= location.pathname.split('/').pop(),
			$sections 		= $('section.level2', $docsContainer),
			$listContainer 	= $('ul.nav-stacked','#toc');

		//build table of contents based on sections within generated markdown file
		if (!$sections.length) return;

		//loop over all sections, build nav based on <h2>'s inside the <section.level2>
		$sections.each($.proxy(function(idx,item){

			var $item = $(item),
				sectionTitle = $item.children().first().text(),
				sectionId = $item.prop("id"),
				isActive = (sectionId == String(location.hash.replace("#",""))) ? " class='active'" : "",
				$li,
				// $level3Sections = $item.children('section.level3');

			//nav (level2)
			$li = $("<li"+isActive+"><a href='#"+sectionId+"'>"+sectionTitle+"</a></li>");

			// //sub nav (level3)
			// if ($level3Sections.length){
			// 	var $childUl = $('<ul class="nav nav-stacked" style="display:none;"/>');
			// 	$level3Sections.each(function(jdx,ele){
			// 		var $ele = $(ele);
			// 		sectionId = $ele.prop("id");
			// 		sectionTitle = $ele.children().first().text();
			// 		$childUl.append( $("<li><a href='#"+sectionId+"'>{label}</a></li>") );
			// 	});
			// 	$li.append($childUl);
			// }

			$listContainer.append($li);
		},this));

		//append links
		$('#toc').html($listContainer);

		//add click event
		// $("a",$listContainer).on("click",$.proxy(function(e){
		// 	$(e.currentTarget).next('ul').slideToggle();
		// },this));
	}

	return new F2Docs();
});
