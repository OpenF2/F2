define('F2.UI', ['F2', 'F2.Schemas'], function(F2, Schemas) {

	var _containerConfig = F2.config();

	return {
		modal: function(params) {
			if (_containerConfig.ui && _.isFunction(_containerConfig.ui.modal)) {
				if (Schemas.validate(params, 'uiModalParams')) {
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
		showMask: function(root) {
			if (_containerConfig.ui && _.isFunction(_containerConfig.ui.showMask)) {
				_containerConfig.ui.showMask(root);
			}
			else {
				console.error('F2.UI: The container has not defined ui.showMask.');
			}
		},
		hideMask: function(root) {
			if (_containerConfig.ui && _.isFunction(_containerConfig.ui.hideMask)) {
				_containerConfig.ui.hideMask(root);
			}
			else {
				console.error('F2.UI: The container has not defined ui.hideMask.');
			}
		}
	};

});