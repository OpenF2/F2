F2.Apps["c63380f4340ea1be65d10d38a69bb343"] = (function() {

	var App_Class = function (app, appContent) {
		this._app = app;
		this._appContent = appContent;
	};

	App_Class.prototype.init = function () {

		this._container = $("#" + this._app.instanceId);

		$('a.testAlert', this._container).on('click', $.proxy(function() {
			F2.UI.Modals.alert(this._app.instanceId, "Hello World!", function() {
				F2.log('callback fired!');	
			});
		}, this));

		$('a.testConfirm', this._container).on('click', $.proxy(function() {
			F2.UI.Modals.confirm(
				this._app.instanceId,
				"Hello World!",
				function() {
					F2.log('ok callback fired!');	
				},
				function() {
					F2.log('cancel callback fired!');
				}
			); 
		}, this));

		this._app.setTitle('PHP ' + (this._app.isSecure ? 'Secure' : '') + ' Hello World');
		this._app.updateHeight();
		
		// bind symbol change event
		F2.Events.on(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, $.proxy(this._handleSymbolChange, this));
	};

	App_Class.prototype._handleSymbolChange = function (data) {
		
		var symbolAlert = $("div.symbolAlert", this._container);
		symbolAlert = (symbolAlert.length)
			? symbolAlert
			: this._renderSymbolAlert();

		$("span:first", symbolAlert).text("The symbol has been changed to " + data.symbol);

		this._app.updateHeight();
	};

	App_Class.prototype._renderSymbolAlert = function() {

		return $([
				'<div class="alert alert-success symbolAlert">',
					'<button type="button" class="close" data-dismiss="alert">&#215;</button>',
					'<span></span>',
				'</div>'
			].join(''))
			.prependTo($("." + F2.Constants.Css.APP_CONTAINER,this._container));
	};

	return App_Class;
})();