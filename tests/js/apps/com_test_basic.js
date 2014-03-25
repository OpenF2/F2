define('com_test_basic', ['F2'], function(F2) {

	function AppClass(instanceId, appConfig, data, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.data = data;
		this.root = root;

		// Store some properties on the window
		window.test.com_test_basic = {
			instance: this,
			instanceId: instanceId,
			root: root,
			count: 0
		};

		// Listen to an event
		F2.Events.on(this, 'com_test_basic', function() {
			var args = Array.prototype.slice.call(arguments);
			window.test.com_test_basic.eventArgs = args;
		});

		F2.Events.many(this, 'com_test_basic-many', 3, function() {
			window.test.com_test_basic.count += 1;
		});
	}

	AppClass.prototype = {
		dispose: function() {
			window.test.com_test_basic = undefined;
		}
	};

	return AppClass;

});
