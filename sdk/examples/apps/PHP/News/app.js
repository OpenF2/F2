F2.Apps["fa50d9b1e3535cc66fcd353c95b2cf28"] = (function() {

	var App_Class = function (appConfig, appContent, root) {
		this.appConfig = appConfig;
		this.appContent = appContent;
		this.ui = appConfig.ui;		
		this.$root = $(root);
		this._config = this.appContent.data;
	};

	App_Class.prototype.init = function () {

		this.ui.updateHeight();
		
		// bind symbol change event
		F2.Events.on(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, $.proxy(this._handleSymbolChange, this));
	};

	App_Class.prototype._handleSymbolChange = function (data) {
		
		this.appConfig.context = this.appConfig.context || {};
		this.appConfig.context.symbol = data.symbol;

		this.ui.showMask(this.$root, true);

		$.ajax({
			url: this._config.baseUrl,
			data: {
				params: JSON.stringify([this.appConfig], F2.appConfigReplacer)
			},
			type: "post",
			dataType: "jsonp",
			jsonp:false,
			jsonpCallback:F2.Constants.JSONP_CALLBACK + this.appConfig.appId,
			context:this,
			success:function (data) {
				$("div.f2-app-view ul:first", this.$root).replaceWith($(data.apps[0].html).find("ul:first"));
				this.ui.updateHeight();
			},
			complete:function() {
				this.ui.hideMask(this.$root);
			}
		})
	};

	return App_Class;
})();