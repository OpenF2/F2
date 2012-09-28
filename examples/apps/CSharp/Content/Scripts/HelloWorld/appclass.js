F2.Apps["com_openf2_examples_csharp_helloworld"] = (function() {

	var App_Class = function (appConfig, appContent, root) {
		this.appConfig = appConfig;
		this.appContent = appContent;
		this.ui = appConfig.ui;
		this.$root = $(root);
	};

	App_Class.prototype.init = function () {

		$('a.testAlert', this.$root).on('click', $.proxy(function() {
			this.ui.Modals.alert("Hello World!", function() {
				F2.log('callback fired!');	
			});
		}, this));

		$('a.testConfirm', this.$root).on('click', $.proxy(function() {
			this.ui.Modals.confirm(
				"Hello World!",
				function() {
					F2.log('ok callback fired!');	
				},
				function() {
					F2.log('cancel callback fired!');
				}
			); 
		}, this));

		this.ui.setTitle((this.appConfig.isSecure ? 'Secure' : '') + ' Hello World (C#)');
		this.ui.updateHeight();
		
		// bind symbol change event
		F2.Events.on(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, $.proxy(this._handleSymbolChange, this));
	};

	App_Class.prototype._handleSymbolChange = function (data) {
		
		var symbolAlert = $("div.symbolAlert", this.$root);
		symbolAlert = (symbolAlert.length)
			? symbolAlert
			: this._renderSymbolAlert();

		$("span:first", symbolAlert).text("The symbol has been changed to " + data.symbol);

		this.ui.updateHeight();
	};

	App_Class.prototype._renderSymbolAlert = function() {

		return $([
				'<div class="alert alert-success symbolAlert">',
					'<button type="button" class="close" data-dismiss="alert">&#215;</button>',
					'<span></span>',
				'</div>'
			].join(''))
			.prependTo($("." + F2.Constants.Css.APP_CONTAINER,this.$root));
	};

	return App_Class;
})();