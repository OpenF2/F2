F2.Apps['com_openf2_examples_javascript_helloworld'] = (function () {
	var App_Class = function (appConfig, appContent, root) {
		this.appConfig = appConfig;
		this.appContent = appContent;
		this.$root = $(root);
	};

	App_Class.prototype.init = function () {
		this.$root
			.on(
				'click',
				'a.testAlert',
				$.proxy(function () {
					alert('Hello World!');
					F2.log('callback fired!');
				}, this)
			)
			.on(
				'click',
				'a.testConfirm',
				$.proxy(function () {
					let r = confirm('Hello World!');
					if (r == true) {
						F2.log('ok callback fired!');
					} else {
						F2.log('cancel callback fired!');
					}
				}, this)
			);

		// bind symbol change event
		F2.Events.on(
			F2.Constants.Events.CONTAINER_SYMBOL_CHANGE,
			$.proxy(this._handleSymbolChange, this)
		);
	};

	App_Class.prototype._handleSymbolChange = function (data) {
		var symbolAlert = $('div.symbolAlert', this.$root);
		symbolAlert = symbolAlert.length ? symbolAlert : this._renderSymbolAlert();

		$('span:first', symbolAlert).text(
			'The symbol has been changed to ' + data.symbol
		);
	};

	App_Class.prototype._renderSymbolAlert = function () {
		return $(
			[
				'<div class="alert alert-success symbolAlert">',
				'<button type="button" class="close" data-dismiss="alert">&#215;</button>',
				'<span></span>',
				'</div>'
			].join('')
		).prependTo($('.' + F2.Constants.Css.APP_CONTAINER, this.$root));
	};

	return App_Class;
})();
