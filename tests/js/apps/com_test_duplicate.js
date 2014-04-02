define('com_test_duplicate', ['F2'], function(F2) {

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

		// Add an event that is listened to by multiple classes
		F2.Events.on(this, 'generic_test_event', function() {
			if (window.test.generic_test_event === undefined) {
				window.test.generic_test_event = 0;
			}

			window.test.generic_test_event++;
		});
	}

	AppClass.prototype = {
		dispose: function() {
			window.test.com_test_duplicate.pop();

			if (!window.test.com_test_duplicate.length) {
				window.test.com_test_duplicate = undefined;
			}

			window.test.generic_test_event = undefined;
		}
	};

	return AppClass;

});
