define('com_test_basic', ['F2.Events'], function(Events) {

	function AppClass(instanceId, appConfig, data, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.data = data;
		this.root = root;

		// Listen to an event
		Events.on('com_test_basic', function() {
			window.com_test_basic_event = true;
		}, this);

		window.com_test_basic = instanceId;
		window.com_test_basic_ids = window.com_test_basic_ids || [];
		window.com_test_basic_ids.push(this.instanceId);
	}

	AppClass.prototype.dispose = function() {
		delete window.com_test_basic;
		delete window.com_test_basic_ids;
		delete window.com_test_basic_event;
	};

	return AppClass;

});