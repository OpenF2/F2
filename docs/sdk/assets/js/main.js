var SDK_Manager = function() {

};

SDK_Manager.prototype.init = function() {

	this.highlightNav();

	// optionally apply .affix() if the window height is big enough
	var winHeight = $(window).height();
	var tocHeight = $('#toc').outerHeight() + $('#toc').position().top;
	if (winHeight > tocHeight + 200) {
		$('#toc ul.nav').affix();
	}

	// bind hashchange and go to tab
	$(window).on('hashchange', $.proxy(this._handleHashChange, this));
	this._handleHashChange();

	// class members
	//$('table.table-members').on('click', 'a[data-tab]', $.proxy(function(event) {
	//	this._scrollToClassMember($(event.currentTarget).data('tab'), $(event.currentTarget).data('tab-member'));
	//}, this));

	// view options
	$('#viewOptions input')
		.each(function(i, e) {
			$('#main').toggleClass('hide-' + $(e).val(), !$(e).is(':checked'));
		})
		.on('click', function() {
			$('#main').toggleClass('hide-' + $(this).val(), !$(this).is(':checked'));
		});

	// back to top
	$('#doc').on('click', '.backToTop a', function() {
		$('html, body').animate({scrollTop:0});
	});
};

/**
 * Highlights left nav based on current page
 */
SDK_Manager.prototype.highlightNav = function(){

	var file = location.pathname.split('/').pop(),
		pageName = file.replace('.html','')
	;

	$('#toc a').each($.proxy(function(idx,item){
		var $this = $(item);
		if ($this.text() == pageName){
			$this.parent().addClass('active');
			return false;
		}
	},this));
};

SDK_Manager.prototype._handleHashChange = function() {

	if (!!location.hash) {
		window.setTimeout($.proxy(function(){

			var hashParts = String(location.hash).split('-');

			// handle class member
			if ($('#classTabs a[href="' + hashParts[0] + '"]').length) {
				this._scrollToClassMember(hashParts[0], hashParts[1]);

			// handle line number
			} else if (/^#l\d+$/.test(hashParts[0])) {
				var line = parseInt(hashParts[0].substring(2));	
				var offset = $('ol.linenums li').eq(line).offset();
				$('html, body').animate({scrollTop:offset.top - 75});

			// everything else
			} else {
				var offset = $(hashParts[0]).offset();
				$('html, body').animate({scrollTop:offset.top - 75});
			}

		},this),250);
		
	}
};

SDK_Manager.prototype._scrollToClassMember = function(tab, member) {

	$('#classTabs [href="' + tab + '"]').tab('show');

	if (member) {
		var offset = $(tab + '-' + member).offset();
		$('html, body').animate({scrollTop:offset.top - 75});
	}
};

$(function() {
	var sdk = new SDK_Manager();
	sdk.init();
});