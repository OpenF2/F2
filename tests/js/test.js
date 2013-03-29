F2.Apps["com_openf2_tests_helloworld"] = (function() {

	var App_Class = function (appConfig, appContent, root) {
		this.appConfig = appConfig;
		this.appContent = appContent;
		this.ui = appConfig.ui;		
	};

	App_Class.prototype.init = function () {		
	};

	return App_Class;
})();