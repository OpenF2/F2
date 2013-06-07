F2.Apps["com_openf2_tests_helloworld"] = (function() {
	
	F2.testAppInitialized = false;

	var App_Class = function (appConfig, appContent, root) {
		this.appConfig = appConfig;
		this.appContent = appContent;
		this.ui = appConfig.ui;		
	};

	App_Class.prototype.init = function () {		
		F2.destroyAppMethodCalled = false;
		F2.testAppInstanceID = this.appConfig.instanceId;
		F2.testAppInitialized = true;
	};

	App_Class.prototype.destroy = function () {
		F2.destroyAppMethodCalled = true;
	};

	return App_Class;
})();