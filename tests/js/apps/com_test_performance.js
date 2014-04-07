define('com_test_performance', ['F2'], function(F2) {

	function AppClass(instanceId, appConfig, data, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.data = data;
		this.root = root;

		// Store some properties on the window
		window.test = window.test || {};
		window.test.com_test_performance = {
			instance: this,
			instanceId: instanceId,
			root: root
		};

		self = this;
		F2.Events.on(this, 'get_performance_instance', function() { 
			F2.Events.emit('performance_instance', self);
		});
	}

	AppClass.prototype = {
		dispose: function() {
			window.test.com_test_performance = undefined;
		}
	};

	return AppClass;

});
