F2.Apps["9d1c357e7a9241532ab8977d440df4f3"] = (function() {

	var App_Class = function (app, appContent) {
		this._app = app;
		this._appContent = appContent;
	};

	App_Class.prototype.init = function () {

		this._container = $("#" + this._app.instanceId);
		this._app.setTitle((this._app.isSecure ? 'Secure' : '') + " Hello World");
		this._app.updateHeight();
		
		// bind symbol change event
		F2.Events.on(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, $.proxy(this._handleSymbolChange, this));

		// bind settings change event
		F2.Events.on(F2.Constants.Events.APP_VIEW_CHANGE + this._app.instanceId, $.proxy(this._handleViewChange, this));

		$("button.cancel").on("click", $.proxy(function() {
			$("div." + F2.Constants.Css.APP_VIEW, this._container).removeClass("hide");
			$("form." + F2.Constants.Css.APP_VIEW, this._container).addClass("hide");
			this._app.updateHeight();
		}, this));
	};

	App_Class.prototype._handleViewChange = function() {
		$("div." + F2.Constants.Css.APP_VIEW, this._container).addClass("hide");
		$("form." + F2.Constants.Css.APP_VIEW, this._container).removeClass("hide");
		this._app.updateHeight();
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