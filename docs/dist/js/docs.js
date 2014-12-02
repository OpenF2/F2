/**
 * This code is only for the F2 documentation site. Don't use it anywhere else, you really shouldn't.
 * (c) Markit On Demand 2014
 */

//F2 docs
var F2Docs = function(){ }

/**
 * Init
 */
F2Docs.prototype.initialize = function() {

	this.generateToc();

	//scroll spy
	$('body').scrollspy({
		target: '.navs'
	});
	
	//affix left nav
	$('div.navs','#toc').affix({
		offset: {
			top: 214,
			bottom: function () {
				return (this.bottom = $('footer').outerHeight(true) + 20)
			}
		}
	});
}

/**
 * Build table of contents navigation
 */
F2Docs.prototype.generateToc = function(){

	var $docsContainer 	= $('#docs'),
		file 			= location.pathname.split('/').pop(),
		$sections 		= $('h2', $docsContainer),
		$listContainer 	= $('ul.nav-stacked','#toc').eq(0);

	//build table of contents based on sections within generated markdown file
	if (!$sections.length) return;

	//loop over all sections, build nav based on <h2>'s inside the <section.level2>
	$sections.each($.proxy(function(idx,item){

		var $item = $(item),
			sectionTitle = $item.text(),
			sectionId = $item.prop("id"),
			isActive = (sectionId == String(location.hash.replace("#",""))) ? " class='active'" : "",
			$li,
			$level3Sections = $item.nextUntil('h2','h3');//find all <h3> els until next section (<h2>)

		//nav (level2)
		$li = $("<li><a class='nav-toggle' href='#"+sectionId+"'"+isActive+">"+sectionTitle+"</a></li>");

		// //sub nav (level3)
		if ($level3Sections.length){
			var $childUl = $('<ul class="nav nav-stacked" style="display:none;"/>');
			$level3Sections.each(function(jdx,ele){
				var $ele = $(ele);
				sectionId = $ele.prop("id");
				sectionTitle = $ele.text();
				isActive = (sectionId == String(location.hash.replace("#",""))) ? " class='active'" : "";
				$childUl.append( $("<li><a href='#"+sectionId+"'"+isActive+">"+sectionTitle+"</a></li>") );
			});
			$li.append($childUl);
		}

		$listContainer.append($li);
	},this));

	//add click event
	$("a.nav-toggle",$listContainer).on("click",$.proxy(function(e){
		//close all others
		$(e.currentTarget).parents('ul.nav-stacked').find('a.nav-toggle').next('ul').slideUp();
		//open current
		$(e.currentTarget).next('ul').slideToggle();

		//refresh
		$('[data-spy="scroll"]').each(function () {
			var $spy = $(this).scrollspy('refresh');
		});
	},this));

	//watch to activate "active" nav item
	$('li','#toc').on('activate.bs.scrollspy', function(){
		var $li = $(this);
		if ($li.hasClass('active') && $li.find('a.nav-toggle').length){
			$li.find('a.nav-toggle').click();
		}
	});

	window.setTimeout(function(){
		// var $activeEl = $('ul.nav-stacked','#toc').find('a.active');
		// if ($activeEl.parent().parents('li.active').length){
		// 	$activeEl = $activeEl.parent().parents('li.active').find('a');
		// }
		// $activeEl.click();
	},1000);
	
}
