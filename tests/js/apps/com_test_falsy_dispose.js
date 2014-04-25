define('com_test_falsy_dispose', ['F2'], function(F2) {

	function AppClass(instanceId, appConfig, data, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.data = data;
		this.root = root;
	}

	AppClass.prototype = {
		dispose: ""
	};

	return AppClass;

});
