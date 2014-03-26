define('com_test_duplicate', [], function() {

	function AppClass(instanceId, appConfig, data, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.data = data;
		this.root = root;

		// Store some properties on the window
		if (!window.test.com_test_duplicate) {
			window.test.com_test_duplicate = [];
		}

		window.test.com_test_duplicate.push({
			instanceId: instanceId,
			root: root
		});
	}

	AppClass.prototype = {
		dispose: function() {
			window.test.com_test_duplicate.pop();
		}
	};

	return AppClass;

});
