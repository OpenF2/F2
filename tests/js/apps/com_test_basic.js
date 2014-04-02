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

		// Listen to some events for testing purposes
		F2.Events.on(this, 'com_test_basic-args', this.handleArgs);
		F2.Events.on(this, 'com_test_basic-context', this.handleContext);
		F2.Events.many(this, 'com_test_basic-many', 3, this.handleMany);
		F2.Events.once(this, 'com_test_basic-once', this.handleOnce);

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
			window.test.com_test_basic = undefined;
		},
		handleArgs: function() {
			var args = Array.prototype.slice.call(arguments);
			window.test.com_test_basic.eventArgs = args;
		},
		handleContext: function() {
			window.test.com_test_basic.handlerContext = this;
		},
		handleMany: function() {
			window.test.com_test_basic.count += 1;
		},
		handleOnce: function() {
			window.test.com_test_basic.count += 1;
		}
	};

	return AppClass;

});
