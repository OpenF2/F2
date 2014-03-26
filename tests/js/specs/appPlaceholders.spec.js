define(['F2'], function(F2) {

	describe('App Placeholders', function() {

		window.test = {};

		it('should treat placeholders with child elements as preloaded', function(done) {
			var container = document.getElementById('placeholder-test-preload');

			F2.loadPlaceholders(container, function() {
				expect(window.test.com_test_placeholder.root.parentNode).toBe(container);
				F2.remove(window.test.com_test_placeholder.root);
				done();
			});
		});

		it('should load a placeholder with valid attributes and context', function(done) {
			var container = document.getElementById('placeholder-test-valid');

			F2.loadPlaceholders(container, function() {
				expect(window.test.com_test_placeholder.data.didWork).toBe(true);
				expect(window.test.com_test_placeholder.root.parentNode).toBe(container);
				F2.remove(window.test.com_test_placeholder.root);
				done();
			});
		});

		it('should load multiple instances of the same appId', function(done) {
			var container = document.getElementById('placeholder-test-dupes');

			F2.loadPlaceholders(container, function() {
				expect(window.test.com_test_duplicate.length).toBe(2);
				F2.remove([
					window.test.com_test_duplicate[0].root,
					window.test.com_test_duplicate[1].root
				]);
				done();
			});
		});

		it('should ignore placeholders with invalid attributes', function(done) {
			var container = document.getElementById('placeholder-test-dupes');

			F2.loadPlaceholders(container, function() {
				expect(window.test.com_test_placeholder).not.toBeDefined();
				done();
			});
		});

	});

});
