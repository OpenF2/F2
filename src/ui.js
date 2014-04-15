/**
 *
 * @class F2.UI
 */
(function(_) {

	F2.prototype.UI = {
		modal: function(params) {
			var config = F2.prototype.config.call(this);

			if (config.ui && _.isFunction(config.ui.modal)) {
				if (_.isObject(params) && F2.prototype.validate.call(this, params, 'uiModalParams')) {
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
			var config = F2.prototype.config.call(this);

			if (config.ui && _.isFunction(config.ui.toggleLoading)) {
				if (_.isNullOrUndefined(root) || _.isNode(root)) {
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
