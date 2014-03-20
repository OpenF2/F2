Lib.UI = function(Core, _, Schemas) {

	return {
		modal: function(params) {
			var config = Core.config();

			if (config.ui && _.isFunction(config.ui.modal)) {
				if (_.isObject(params) && Schemas.validate(params, 'uiModalParams')) {
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
		showLoading: function(root) {
			var config = Core.config();

			if (config.ui && _.isFunction(config.ui.showLoading)) {
				if (!root || (root && root.nodeType === 1)) {
					config.ui.showLoading(root);
				}
				else {
					console.error('F2.UI: the root passed was not a native DOM node.');
				}
			}
			else {
				console.error('F2.UI: The container has not defined ui.showLoading.');
			}
		},
		hideLoading: function(root) {
			var config = Core.config();

			if (config.ui && _.isFunction(config.ui.hideLoading)) {
				if (!root || (root && root.nodeType === 1)) {
					config.ui.hideLoading(root);
				}
				else {
					console.error('F2.UI: the root passed was not a native DOM node.');
				}
			}
			else {
				console.error('F2.UI: The container has not defined ui.hideLoading.');
			}
		}
	};

};
