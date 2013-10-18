define('com_test_placeholder', [], function() {

	function AppClass(instanceId, appConfig, data, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.data = data;
		this.root = root;

		window.com_test_placeholder = {
			context: data,
			root: root
		};
	}

	AppClass.prototype.dispose = function() {
		delete window.com_test_placeholder;
	};

	return AppClass;

});