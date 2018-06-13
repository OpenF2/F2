F2.Apps["com_openf2_tests_helloworld"] = (function() {
	
	F2.testAppInitialized = false;

	var App_Class = function (appConfig, appContent, root) {
		console.log('??????????', appConfig, appContent, root);
		F2.PreloadArguments = Array.prototype.slice.call(arguments);
		this.appConfig = appConfig;
		this.appContent = appContent;
		this.ui = appConfig.ui;	
	};

	App_Class.prototype.init = function () {		
		F2.destroyAppMethodCalled = false;
		F2.testAppInstanceID = this.appConfig.instanceId;
		F2.testAppInitialized = true;
		F2.testLocaleFromAppConfig = this.appConfig.containerLocale;
		F2.testLocaleSupportFromAppConfig = this.appConfig.localeSupport;
		F2.HightChartsIsDefined = window.Highcharts;
	};

	App_Class.prototype.destroy = function () {
		F2.destroyAppMethodCalled = true;
	};

	return App_Class;
})();
