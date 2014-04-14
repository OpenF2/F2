define(['F2'], function(F2) {

	describe('F2.UI', function() {

		beforeEach(function() {
			F2 = F2.new();
			window.test = {
				ui: {}
			};
		});

		F2.config({
			ui: {
				modal: function(params) {
					window.test.ui.modal = params;
				},
				toggleLoading: function(root) {
					window.test.ui.toggleLoading = root;
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

		describe('toggleLoading', function() {

			it('should delegate the app root to the container "toggleLoading" handler', function() {
				var fakeRoot = document.createElement('div');
				F2.UI.toggleLoading(fakeRoot);

				expect(window.test.ui.toggleLoading).toBe(fakeRoot);
			});

		});

	});

});
