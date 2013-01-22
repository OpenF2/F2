F2.Apps["com_openf2_examples_php_news"] = (function() {

	var App_Class = function (appConfig, appContent, root) {

		this.appConfig = appConfig;
		this.appContent = appContent;
		this.ui = appConfig.ui;		
		this.$root = $(root);

		this.appConfig.context = this.appConfig.context || {};
	};

	App_Class.prototype.init = function () {

		// update height to match all news articles displayed
		this.ui.updateHeight();
		
		// bind symbol change event
		F2.Events.on(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, $.proxy(this._refresh, this));

		// populate settings
		this.ui.Views.change($.proxy(this._populateSettings, this));

		// save settings
		$(this.$root).on("click", "button.save", $.proxy(this._handleSaveSettings, this));

		// cancel settings
		$(this.$root).on("click", "button.cancel", $.proxy(function () {
			this.ui.Views.change(F2.Constants.Views.HOME);
		}, this));
	};

	App_Class.prototype._handleSaveSettings = function() {

		this.appConfig.context.autoRefresh = $('form.f2-app-view input[name="autoRefresh"]', this.$root).prop('checked');
		this.appConfig.context.provider = $('form.f2-app-view input[name="provider"]:checked', this.$root).val();

		clearInterval(this._refreshInterval);
		if (this.appConfig.context.autoRefresh) {
			this._refreshInterval = setInterval($.proxy(this._refresh, this), 30000);
		}

		this.ui.Views.change(F2.Constants.Views.HOME);
		this._refresh();
	};

	App_Class.prototype._refresh = function (data) {
		
		data = data || {};
		this.appConfig.context.symbol = data.symbol || this.appConfig.context.symbol;

		this.ui.showMask(this.$root, true);

		$.ajax({
			url: this.appConfig.manifestUrl,
			data: {
				params: JSON.stringify([this.appConfig], F2.appConfigReplacer)
			},
			type: "post",
			dataType: "jsonp",
			jsonp:false,
			jsonpCallback:F2.Constants.JSONP_CALLBACK + this.appConfig.appId,
			context:this,
			success:function (data) {
				$("div.f2-app-view", this.$root).replaceWith($(data.apps[0].html).find("div.f2-app-view"));
				this.ui.updateHeight();
			},
			complete:function() {
				this.ui.hideMask(this.$root);
			}
		})
	};

	App_Class.prototype._populateSettings = function() {

		$.each(this.appConfig.context, $.proxy(function(key, value) {

			$('form.f2-app-view input[name="' + key + '"]', this.$root).val(value);

		}, this));
	};

	return App_Class;
})();