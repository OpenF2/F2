define('F2.UI', ['F2', 'F2.Schemas'], function(F2, Schemas) {

	return {
		modal: function(params) {
			var _containerConfig = F2.config();

			if (_containerConfig.ui && _.isFunction(_containerConfig.ui.modal)) {
				if (_.isObject(params) && Schemas.validate(params, 'uiModalParams')) {
					_containerConfig.ui.modal(params);
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
			var _containerConfig = F2.config();

			if (_containerConfig.ui && _.isFunction(_containerConfig.ui.showLoading)) {
				if (!root || (root && root.nodeType === 1)) {
					_containerConfig.ui.showLoading(root);
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
			var _containerConfig = F2.config();

			if (_containerConfig.ui && _.isFunction(_containerConfig.ui.hideLoading)) {
				if (!root || (root && root.nodeType === 1)) {
					_containerConfig.ui.hideLoading(root);
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

});