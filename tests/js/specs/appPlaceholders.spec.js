define(['jasmine', 'F2'], function() {

	describe('App Placeholders', function() {

		var F2 = require('F2');
		window.test = {};

		F2.loadPlaceholders();

		it('should treat placeholders with child elements as preloaded', function() {
			waitsFor(function() {
				// Our test classes will throw some properties on the window
				return window.test.com_test_placeholder;
			}, DEFAULT_TIMEOUT);

			runs(function() {
				var conditions = [

					function hasEmptyContext() {
						var hasProps = false;

						for (var prop in window.test.com_test_placeholder.context) {
							hasProps = true;
							break;
						}

						return !hasProps;
					},
					function hasCorrectParentNode() {
						return window.test.com_test_placeholder.root.id === 'placeholder1';
					}
				];

				// Check all the conditions
				for (var i = 0; i < conditions.length; i++) {
					expect(conditions[i]()).toBe(true);
				}

				// Clean up
				F2.remove(window.test.com_test_placeholder.instanceId);
			});
		});

		it('should load a placeholder with valid attributes and context', function() {
			waitsFor(function() {
				// Our test classes will throw some properties on the window
				return window.test.com_test_placeholder2 && window.test.com_test_placeholder2.length;
			}, DEFAULT_TIMEOUT);

			runs(function() {
				var conditions = [
					function hasCorrectContext() {
						return window.test.com_test_placeholder2[0].context.didWork === true;
					},
					function hasCorrectParentNode() {
						return window.test.com_test_placeholder2[0].root.parentNode === document.getElementById('placeholder-container');
					}
				];

				// Check all the conditions
				for (var i = 0; i < conditions.length; i++) {
					expect(conditions[i]()).toBe(true);
				}

				// Clean up
				F2.remove(window.test.com_test_placeholder2[0].root);
			});
		});

		it('should load multiple isntances of the same appId', function() {
			waitsFor(function() {
				// Our test classes will throw some properties on the window
				return window.test.com_test_placeholder2 && window.test.com_test_placeholder2.length;
			}, DEFAULT_TIMEOUT);

			runs(function() {
				var conditions = [
					function hasCorrectContext() {
						return window.test.com_test_placeholder2[0].context.isDuplicate === true;
					},
					function hasCorrectParentNode() {
						return window.test.com_test_placeholder2[0].root.parentNode === document.getElementById('placeholder-container');
					}
				];

				// Check all the conditions
				for (var i = 0; i < conditions.length; i++) {
					expect(conditions[i]()).toBe(true);
				}

				// Clean up
				F2.remove(window.test.com_test_placeholder2[0].root);
			});
		});

		it('should ignore placeholders with invalid attributes', function() {
			expect(window.test.com_test_basic).not.toBeDefined();
		});

	});

});
