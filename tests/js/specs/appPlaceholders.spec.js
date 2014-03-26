define(['F2'], function(F2) {

	describe('App Placeholders', function() {

		window.test = {};

		it('should treat placeholders with child elements as preloaded', function(done) {
			var container = document.getElementById('placeholder-test-preload');

			F2.loadPlaceholders(container, function(manifests) {
				expect(manifests.length).toBe(1);
				expect(manifests[0].root.parentNode).toBe(container);
				F2.remove(manifests[0]);
				done();
			});
		});

		it('should load a placeholder with valid attributes and context', function(done) {
			var container = document.getElementById('placeholder-test-valid');

			F2.loadPlaceholders(container, function(manifests) {
				expect(manifests.length).toBe(1);
				expect(manifests[0].appContent.data.didWork).toBe(true);
				expect(manifests[0].root.parentNode).toBe(container);
				F2.remove(manifests[0]);
				done();
			});
		});

		it('should load multiple instances of the same appId', function(done) {
			var container = document.getElementById('placeholder-test-dupes');

			F2.loadPlaceholders(container, function(manifests) {
				expect(manifests.length).toBe(2);
				F2.remove(manifests);
				done();
			});
		});

		it('should load apps on different domains', function(done) {
			var container = document.getElementById('placeholder-test-domains');

			F2.loadPlaceholders(container, function(manifests) {
				expect(manifests.length).toBe(2);
				F2.remove(manifests);
				done();
			});
		});

		it('should ignore placeholders with invalid attributes', function(done) {
			var container = document.getElementById('placeholder-test-dupes');

			F2.loadPlaceholders(container, function(manifests) {
				expect(manifests.length).toBe(0);
				done();
			});
		});

	});

});
