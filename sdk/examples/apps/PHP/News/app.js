F2.Apps["fa50d9b1e3535cc66fcd353c95b2cf28"] = (function() {

	var App_Class = function (app, appContent) {
		this._app = app;
		this._appContent = appContent;
		this._config = this._appContent.data;
	};

	App_Class.prototype.init = function () {

		this._container = $("#" + this._app.instanceId);
		this._app.updateHeight();
		
		// bind symbol change event
		F2.Events.on(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, $.proxy(this._handleSymbolChange, this));
	};

	App_Class.prototype._handleSymbolChange = function (data) {
		
		this._app.context = this._app.context || {};
		this._app.context.symbol = data.symbol;

		F2.UI.showMask(this._app.instanceId, this._container, true);

		$.ajax({
			url: this._config.baseUrl,
			data: {
				params: JSON.stringify([this._app])
			},
			type: "post",
			dataType: "jsonp",
			jsonp:false,
			jsonpCallback:F2.Constants.JSONP_CALLBACK + this._app.appId,
			success: $.proxy(function (data) {
				$("div.f2-app-view ul:first", this._container).replaceWith($(data.apps[0].html).find("ul:first"));
				this._app.updateHeight();
			}, this),
			complete:$.proxy(function() {
				F2.UI.hideMask(this._app.instanceId, this._container);
			}, this)
		})
	};

	return App_Class;
})();