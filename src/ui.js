/**
 *
 * @class F2.UI
 */
(function(_) {

	function getContainerConfig() {
		return Library.config();
	}

	Library.UI = {
		modal: function(params) {
			var config = getContainerConfig();

			if (config.ui && _.isFunction(config.ui.modal)) {
				if (_.isObject(params) && Library.validate(params, 'uiModalParams')) {
					config.ui.modal(params);
				}
				else {
					console.error('F2.UI: The parameters to ui.modal are incorrect.');
				}
			}
			else {
				console.error('F2.UI: The container has not defined ui.modal.');
			}
		},
		toggleLoading: function(root) {
			var config = getContainerConfig();

			if (config.ui && _.isFunction(config.ui.toggleLoading)) {
				if (!root || (root && root.nodeType === 1)) {
					config.ui.toggleLoading(root);
				}
				else {
					console.error('F2.UI: the root passed was not a native DOM node.');
				}
			}
			else {
				console.error('F2.UI: The container has not defined ui.toggleLoading.');
			}
		}
	};

})(Helpers._);
