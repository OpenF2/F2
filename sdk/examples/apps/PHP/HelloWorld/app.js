App_Class = function (app, appAssets) {
	this._app = app;
	this._appAssets = appAssets;
};

App_Class.prototype.init = function () {

	this._container = $("#" + this._app.instanceId);
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