/**
 * Because of how tests have to refresh F2 on the page repeatedly, we need a
 * way to replace the preloaded app after F2 has been refreshed.
 */
window.F2_PRELOADED = window.F2_PRELOADED || [];
window.F2_PRELOADED.push(function () {
	F2.Apps[TEST_PRELOADED_APP_ID] = (function () {
		var App_Class = function (appConfig, appContent, root) {
			this.appConfig = appConfig;
			this.appContent = appContent;
			this.ui = appConfig.ui;
			this.$root = $(root);
		};

		App_Class.prototype.init = function () {
			var appConfig = this.appConfig;

			F2.Events.on('PreloadAppTestOne', function (testValue) {
				F2.Events.emit('PreloadAppResponseOne', testValue);
			});

			F2.Events.emit('PreloadAppResponseTwo', true);
		};

		return App_Class;
	})();
});
