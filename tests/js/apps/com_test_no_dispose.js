define('com_test_no_dispose', ['F2'], function(F2) {

	function AppClass(instanceId, appConfig, data, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.data = data;
		this.root = root;

		window.test.com_test_no_dispose = this.instanceId;
	}

	return AppClass;

});
