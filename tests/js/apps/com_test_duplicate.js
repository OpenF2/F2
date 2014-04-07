define('com_test_duplicate', ['F2'], function(F2) {

	function AppClass(instanceId, appConfig, data, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.data = data;
		this.root = root;

		// Store some properties on the window
		if(!window.test) {
			window.test = {};
		}

		if (!window.test.com_test_duplicate) {
			window.test.com_test_duplicate = [];
		}

		window.test.com_test_duplicate.push({
			instanceId: instanceId,
			root: root
		});

		// Add an event that is listened to by multiple classes
		F2.on(this, 'generic_test_event', function() {
			if (window.test.generic_test_event === undefined) {
				window.test.generic_test_event = 0;
			}

			window.test.generic_test_event++;
		});
	}

	AppClass.prototype = {
		dispose: function() {
			var index =
			(function(instanceId) {
				var _i, _length;
				for(_i = 0, _length = window.test.com_test_duplicate.length; _i < _length; ++_i) {
					if( window.test.com_test_duplicate[_i].instanceId == instanceId) {
						return _i;
					}
				}
				return -1
			})(this.instanceId);

			if(index > -1) {
				window.test.com_test_duplicate =
				window.test.com_test_duplicate.splice(index, 1);
			}

			if (!window.test.com_test_duplicate.length) {
				window.test.com_test_duplicate = undefined;
			}

			window.test.generic_test_event = undefined;
		}
	};

	return AppClass;

});
