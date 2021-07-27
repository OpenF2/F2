define(['jquery', 'moment'], function ($, moment) {
	/**
	 * This code is only for the F2 documentation site. Don't use it anywhere else, you really shouldn't.
	 * (c) IHS Markit Digital 2021
	 */

	//F2 docs
	var F2Docs = function () {};

	/**
	 * Init
	 */
	F2Docs.prototype.initialize = function () {
		this.generateToc();

		//scroll spy
		$('body').scrollspy({
			// offset: 100,
			target: '#toc .spy-container'
		});

		//affix left nav
		$('div.navs', '#toc').affix({
			offset: {
				top: 189,
				bottom: function () {
					return (this.bottom = $('footer').outerHeight(true) + 80);
				}
			}
		});

		//ensure rwd images
		$('img', '#docs').addClass('img-responsive');

		//remove active state when going back to the top
		$(window).on('scroll', function (e) {
			var $activeNav = $('li', 'ul.sidebar-toc').eq(1); //get 1st nav item (not 1st <li>, that's the nav header)
			if (document.body.scrollTop < 1 && $activeNav.hasClass('active')) {
				$activeNav.removeClass('active');
			}
		});
	};

	/**
	 * Build table of contents navigation
	 */
	F2Docs.prototype.generateToc = function () {
		var $docsContainer = $('#docs'),
			file = location.pathname.split('/').pop(),
			$sections = $('h2', $docsContainer),
			$listContainer = $('ul.nav-stacked', '#toc').eq(0);

		//build table of contents based on sections within generated markdown file
		if (!$sections.length) return;

		//loop over all sections, build nav based on <h2>'s inside the <section.level2>
		$sections.each(
			$.proxy(function (idx, item) {
				var $item = $(item),
					sectionTitle = $item.text(),
					//trim "#" from title
					sectionTitle = sectionTitle.replace('#', ''),
					sectionId = $item.prop('id'),
					isActive =
						sectionId == String(location.hash.replace('#', ''))
							? " class='active'"
							: '',
					$li,
					$level3Sections = $item.nextUntil('h2', 'h3'); //find all <h3> els until next section (<h2>)

				//only headings with ID attrs should get corresponding left nav
				if ($item.prop('id').length < 1) {
					return true;
				}

				//nav (level2)
				$li = $(
					"<li><a class='nav-toggle' href='#" +
						sectionId +
						"'" +
						isActive +
						'>' +
						sectionTitle +
						'</a></li>'
				);

				//sub nav (level3)
				if ($level3Sections.length) {
					var $childUl = $(
						'<ul class="nav nav-stacked" style="display:none;"/>'
					);
					$level3Sections.each(function (jdx, ele) {
						var $ele = $(ele);
						sectionId = $ele.prop('id');
						sectionTitle = $ele.text();
						//trim "#" from title
						sectionTitle = sectionTitle.replace('#', '');
						isActive =
							sectionId == String(location.hash.replace('#', ''))
								? " class='active'"
								: '';
						$childUl.append(
							$(
								"<li><a href='#" +
									sectionId +
									"'" +
									isActive +
									'>' +
									sectionTitle +
									'</a></li>'
							)
						);
					});
					$li.append($childUl);
				}

				$listContainer.append($li);
			}, this)
		);

		//watch to activate "active" nav item
		$('li', '#toc ul.sidebar-toc').on('activate.bs.scrollspy', function () {
			var $li = $(this),
				$toggle = $li.find('a.nav-toggle');
			if ($li.hasClass('active') && $toggle.length) {
				//close others
				$li
					.parents('ul.nav-stacked')
					.find('li')
					.not($li)
					.find('a.nav-toggle')
					.next('ul')
					.hide();
				//open current
				$toggle.next('ul').show();
			}
		});
	};

	return new F2Docs();
});
