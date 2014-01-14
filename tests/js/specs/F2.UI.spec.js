define(['jasmine', 'F2'], function() {

	describe('F2.UI', function() {

		var F2 = require('F2');

		window.test = {};

		beforeEach(function() {
			window.test.ui = {};
		});

		F2.config({
			ui: {
				modal: function(params) {
					window.test.ui.modal = params;
				},
				showLoading: function(root) {
					window.test.ui.showLoading = root;
				},
				hideLoading: function(root) {
					window.test.ui.hideLoading = root;
				}
			}
		});

		describe('modal', function() {

			it('should delegate params to the container "modal" handler', function() {
				var params = {
					title: "I'm flying!",
					content: "<p>Wheeeee</p>"
				};
				F2.UI.modal(params);

				expect(window.test.ui.modal).toBe(params);
			});

		});

		describe('showLoading', function() {

			it('should delegate the app root to the container "showLoading" handler', function() {
				var fakeRoot = document.createElement('div');
				F2.UI.showLoading(fakeRoot);

				expect(window.test.ui.showLoading).toBe(fakeRoot);
			});

		});

		describe('hideLoading', function() {

			it('should delegate the app root to the container "hideLoading" handler', function() {
				var fakeRoot = document.createElement('div');
				F2.UI.hideLoading(fakeRoot);

				expect(window.test.ui.hideLoading).toBe(fakeRoot);
			});

		});

	});

});