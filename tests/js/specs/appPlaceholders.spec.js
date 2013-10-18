describe('App Placeholders', function() {

	var F2;

	beforeEach(function() {
		F2 = null;

		require(['F2'], function(localF2) {
			F2 = localF2;
		});

		waitsFor(function() {
			return !!F2;
		});
	});

	it('should load a placeholder with valid attributes and no context', function() {
		waitsFor(function() {
			// Our test classes will throw some properties on the window
			return window.com_test_placeholder;
		}, DEFAULT_TIMEOUT);

		runs(function() {
			var conditions = [
				function hasEmptyContext() {
					var hasProps = false;

					for (var prop in window.com_test_placeholder.context) {
						hasProps = true;
						break;
					}

					return !hasProps;
				},
				function hasCorrectParentNode() {
					return window.com_test_placeholder.root.parentNode === document.getElementById('placeholder1');
				}
			];

			// Check all the conditions
			for (var i = 0; i < conditions.length; i++) {
				expect(conditions[i]()).toBe(true);
			}

			// Clean up
			F2.removeApp(window.com_test_placeholder);
		});
	});

	it('should load a placeholder with valid attributes and context', function() {
		waitsFor(function() {
			// Our test classes will throw some properties on the window
			return window.com_test_placeholder2;
		}, DEFAULT_TIMEOUT);

		runs(function() {
			var conditions = [
				function hasCorrectContext() {
					return window.com_test_placeholder2.context.didWork === true;
				},
				function hasCorrectParentNode() {
					return window.com_test_placeholder2.root.parentNode === document.getElementById('placeholder2');
				}
			];

			// Check all the conditions
			for (var i = 0; i < conditions.length; i++) {
				expect(conditions[i]()).toBe(true);
			}

			// Clean up
			F2.removeApp(window.com_test_placeholder2);
		});
	});

	it('should ignore placeholders with invalid attributes', function() {
		expect(window.com_test_basic).not.toBeDefined();
	});

});