define('com_test_placeholder', [], function() {

	function AppClass(instanceId, appConfig, data, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.data = data;
		this.root = root;

		window.test.com_test_placeholder = {
			instanceId: instanceId,
			context: this,
			root: root
		};
	}

	AppClass.prototype = {
		dispose: function() {
			window.test.com_test_placeholder = undefined;
		}
	};

	return AppClass;

});
