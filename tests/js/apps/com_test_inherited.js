define('com_test_inherited', ['F2'], function(F2) {

	function AppClass(instanceId, appConfig, data, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.data = data;
		this.root = root;

		window.test.com_test_inherited = {
			instanceId: instanceId,
			root: root
		};
	}

	// Extend the base class
	AppClass.prototype = new F2.AppClass;

	AppClass.prototype.dispose = function() {
		delete window.test.com_test_inherited;
	};

	return AppClass;

});