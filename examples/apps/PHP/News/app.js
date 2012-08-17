App_Class = function (app, appAssets, config) {
	this._app = app;
	this._appAssets = appAssets;
	this._config = config;
};

App_Class.prototype.init = function () {

	this._container = $("#" + this._app.instanceId);
	this._updateHeight();
	
	// bind symbol change event
	F2.Events.on(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, $.proxy(this._handleSymbolChange, this));
};

App_Class.prototype._handleSymbolChange = function (data) {
	
	this._app.context = this._app.context || {};
	this._app.context.symbol = data.symbol;

	$.ajax({
		url: this._config.baseUrl,
		data: {
			app: JSON.stringify(this._app)
		},
		type: "post",
		dataType: "jsonp",
		success: $.proxy(function (data) {
			$("div.f2-app-view ul:first", this._container).replaceWith($(data.Widgets[0].Html).find("ul:first"));
			this._updateHeight();
		}, this)
	})
};

App_Class.prototype._updateHeight = function() {
	this._app.height = $(this._container).outerHeight();
	F2.Events.emit(F2.Constants.Events.APP_HEIGHT_CHANGE, this._app);
};