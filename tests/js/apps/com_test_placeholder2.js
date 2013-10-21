define('com_test_placeholder2', [], function() {

	function AppClass(instanceId, appConfig, data, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.data = data;
		this.root = root;

		window.test.com_test_placeholder2 = {
			instanceId: instanceId,
			context: data,
			root: root
		};
	}

	AppClass.prototype.dispose = function() {
		delete window.test.com_test_placeholder2;
	};

	return AppClass;

});