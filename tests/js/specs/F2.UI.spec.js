define(['F2'], function(F2) {

	describe('F2.UI', function() {

		beforeEach(function() {
			spyOn(console, 'error');
			F2.config({
				ui: {
					modal: null,
					toggleLoading: null
				}
			});
			window.test = {
				ui: {}
			};
		});

		describe('modal', function() {
			it('should error if the container has not defined ui.modal', function(){
				F2.UI.modal({});
				expect(console.error).toHaveBeenCalled();
			});

			it('should error if the params does not pass uiModalParams validation', function(){
				F2.config({ui:{modal: function() { }}});
				F2.UI.modal({buttons: [{label: ""}]});
				expect(console.error).toHaveBeenCalled();
			});

			it('should delegate params to the container "modal" handler', function() {
				var params = {
					title: "I'm flying!",
					content: "<p>Wheeeee</p>"
				};
				F2.config({ui:{modal: function(params) { window.test.ui.modal = params; }}});
				F2.UI.modal(params);
				expect(window.test.ui.modal).toBe(params);
			});

		});

		describe('toggleLoading', function() {

			it('should error if the container has not defined ui.toggleLoading', function(){
				F2.UI.modal({});
				expect(console.error).toHaveBeenCalled();
			});

			it('should error if the root is not a native DOM node', function(){
				F2.config({ui:{toggleLoading: function() { }}});
				F2.UI.toggleLoading("");
				expect(console.error).toHaveBeenCalled();
			});

			it('should delegate the app root to the container "toggleLoading" handler', function() {
				var fakeRoot = document.createElement('div');
				F2.config({ui:{toggleLoading: function(root) { window.test.ui.toggleLoading = root; }}});
				F2.UI.toggleLoading(fakeRoot);

				expect(window.test.ui.toggleLoading).toBe(fakeRoot);
			});

		});

	});

});
