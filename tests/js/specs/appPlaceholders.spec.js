define(['F2'], function(F2) {

	describe('App Placeholders', function() {

		window.test = {};

		it('should treat placeholders with child elements as preloaded', function(done) {
			function hasEmptyContext() {
				var hasProps = false;

				for (var prop in window.test.com_test_placeholder.context) {
					hasProps = true;
					break;
				}

				return !hasProps;
			}

			F2.loadPlaceholders(document.body, function() {
				expect(hasEmptyContext()).toBe(true);
				expect(window.test.com_test_placeholder.root.id).toBe('placeholder1');

				// Clean up
				F2.remove(window.test.com_test_placeholder.instanceId);

				done();
			});
		});

		it('should load a placeholder with valid attributes and context', function(done) {
			F2.loadPlaceholders(document.body, function() {
				var windowObj = window.test.com_test_placeholder2[0];

				expect(windowObj.context.didWork).toBe(true);
				expect(windowObj.root.parentNode).toBe(document.getElementById('placeholder-container'));

				// Clean up
				F2.remove(window.test.com_test_placeholder2[0].root);

				done();
			});
		});

		it('should load multiple instances of the same appId', function(done) {
			F2.loadPlaceholders(document.body, function() {
				var windowObj = window.test.com_test_placeholder2[0];

				expect(windowObj.context.isDuplicate).toBe(true);
				expect(windowObj.root.parentNode).toBe(document.getElementById('placeholder-container'));

				// Clean up
				F2.remove(window.test.com_test_placeholder2[0].root);

				done();
			});
		});

		it('should ignore placeholders with invalid attributes', function(done) {
			F2.loadPlaceholders(document.body, function() {
				expect(window.test.com_test_basic).not.toBeDefined();

				done();
			});
		});

	});

});
