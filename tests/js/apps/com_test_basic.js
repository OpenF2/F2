define('com_test_basic', ['F2.Events'], function(Events) {

	function AppClass(instanceId, appConfig, data, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.data = data;
		this.root = root;

		// Store some properties on the window
		window.test.com_test_basic = {
			instanceId: instanceId,
			root: root
		};

		// Listen to an event
		Events.on('com_test_basic', function() {
			window.test.com_test_basic.event = true;
		}, this);
	}

	AppClass.prototype.dispose = function() {
		delete window.test.com_test_basic;
	};

	return AppClass;

});