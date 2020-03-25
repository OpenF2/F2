F2.Apps["com_openf2_tests_preloaded_argtester"] = (function() {

	var App_Class = function (appConfig, appContent, root) {
		this.argumentCount = arguments.length;
		this.appConfig = appConfig;
		this.appContent = appContent;
		this.ui = appConfig.ui;
	};

	App_Class.prototype.init = function () {
		F2.Events.emit('PreloadAppArgumentCount', this.argumentCount);
	};

	App_Class.prototype.destroy = function () {

	};

	return App_Class;
})();
