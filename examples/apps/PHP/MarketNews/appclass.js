F2.Apps['com_openf2_examples_php_marketnews'] = (function () {
	var App_Class = function (appConfig, appContent, root) {
		this.appConfig = appConfig;
		this.appContent = appContent;
		this.$root = $(root);
	};

	App_Class.prototype.init = function () {
		$('button.save', this.$root).on(
			'click',
			$.proxy(function (e) {
				if (
					$('form.f2-app-view input[name="autoRefresh"]', this.$root).prop(
						'checked'
					)
				) {
					alert('Auto refresh in 30 seconds enabled');
				} else alert('Auto refresh in 30 seconds disabled');

				this._handleSaveSettings();
			}, this)
		);
	};

	App_Class.prototype._handleSaveSettings = function () {
		this.appConfig.context = this.appConfig.context || {};
		this.appConfig.context.autoRefresh = $(
			'form.f2-app-view input[name="autoRefresh"]',
			this.$root
		).prop('checked');
		this.appConfig.context.provider = $(
			'form.f2-app-view input[name="provider"]:checked',
			this.$root
		).val();

		clearInterval(this._refreshInterval);
		if (this.appConfig.context.autoRefresh) {
			this._refreshInterval = setInterval($.proxy(this._refresh, this), 30000);
		}

		this._refresh();
	};

	App_Class.prototype._refresh = function () {
		$.ajax({
			url: this.appConfig.manifestUrl,
			data: {
				params: JSON.stringify([this.appConfig], F2.appConfigReplacer)
			},
			type: 'post',
			dataType: 'jsonp',
			jsonp: false,
			jsonpCallback: F2.Constants.JSONP_CALLBACK + this.appConfig.appId,
			context: this,
			success: function (data) {
				$('div.f2-app-view', this.$root).replaceWith(
					$(data.apps[0].html).find('div.f2-app-view')
				);
			},
			complete: function () {}
		});
	};

	return App_Class;
})();
