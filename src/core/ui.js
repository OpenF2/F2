;(function(F2, _) {

	function _modal(params) {
		var config = F2.config();

		if (config.ui && _.isFunction(config.ui.modal)) {
			if (_.isObject(params) && F2.Schemas.validate(params, 'uiModalParams')) {
				config.ui.modal(params);
			}
			else {
				console.error('F2.UI: The parameters to ui.modal are incorrect.');
			}
		}
		else {
			console.error('F2.UI: The container has not defined ui.modal.');
		}
	}

	function _showLoading(root) {
		var config = F2.config();

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
	}

	function _hideLoading(root) {
		var config = F2.config();

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

	// --------------------------------------------------------------------------
	// API
	// --------------------------------------------------------------------------

	F2.UI = {
		modal: function(params) {
			return _modal(params);
		},
		showLoading: function(root) {
			return _showLoading(root);
		},
		hideLoading: function(root) {
			return _hideLoading(root);
		}
	};

})(F2, _);
