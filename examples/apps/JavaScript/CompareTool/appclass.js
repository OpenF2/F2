F2.Apps["com_openf2_examples_javascript_compareTool"] = (function() {

	var App_Class = function(appConfig, appContent, root) {
		this.appConfig = appConfig;
		this.appContent = appContent;
		this.$root = $(root);
	};

	App_Class.prototype.init = function() {
		// Manually bootstrap angular
		angular.bootstrap(this.$root, ["compareTool"]);
	};

	return App_Class;

})();