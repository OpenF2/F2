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
		toggleLoading: function(root) {
			var config = Core.config();

			if (config.ui && _.isFunction(config.ui.toggleLoading)) {
				if (!root || (root && root.nodeType === 1)) {
					config.ui.toggleLoading(root);
				}
				else {
					console.error('F2.UI: the root passed was not a native DOM node.');
				}
			}
			else {
				console.error('F2.UI: The container has not defined ui.showLoading.');
			}
		}
	};

};
