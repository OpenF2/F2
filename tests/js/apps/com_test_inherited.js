define('com_test_inherited', ['F2.BaseAppClass'], function(BaseAppClass) {

	function AppClass(instanceId, appConfig, data, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.data = data;
		this.root = root;

		window.com_test_inherited = instanceId;
	}

	AppClass.prototype = new BaseAppClass;

	AppClass.prototype.dispose = function() {
		delete window.com_test_inherited;
	};

	return AppClass;

});