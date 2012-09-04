/**
 * Helper methods for creating and using Modals
 * @class F2.UI.Modals
 */
F2.extend("UI.Modals", (function(){

	var _renderAlert = function(message) {
		return [
			'<div class="modal">',
				'<header class="modal-header">',
					'<h3>Alert!</h3>',
				'</header>',
				'<div class="modal-body">',
					'<p>',
						message,
					'</p>',
				'</div>',
				'<div class="modal-footer">',
					'<button class="btn btn-primary btn-ok">OK</button>',
				'</div>',
			'</div>'
		].join('');
	};

	var _renderConfirm = function(message) {
		return [
			'<div class="modal">',
				'<header class="modal-header">',
					'<h3>Confirm</h3>',
				'</header>',
				'<div class="modal-body">',
					'<p>',
						message,
					'</p>',
				'</div>',
				'<div class="modal-footer">',
					'<button type="button" class="btn btn-primary btn-ok">OK</button>',
					'<button type="button" class="btn btn-cancel">Cancel</button">',
				'</div>',
			'</div>'
		].join('');
	};

	return {
		/**
		 * Display an alert message on the page
		 * @method alert
		 * @param {string} instanceId The Instance ID of the App
		 * @param {string} message The message to be displayed
		 * @param {function} [callback] The callback to be fired when the user
		 * closes the dialog
		 */
		alert: function(instanceId, message, callback) {

			if (!F2.isInit()) {
				F2.log('F2.init() must be called before F2.UI.Modals.alert()');
				return;
			}

			if (F2.Rpc.isRemote(instanceId)) {
				F2.Rpc.call(
					instanceId,
					F2.Constants.Sockets.RPC,
					'F2.UI.Modals.alert',
					[].slice.call(arguments)
				);
			} else {
				// display the alert
				$(_renderAlert(message))
					.on('show', function() {
						var modal = this;
						$(modal).find('.btn-primary').on('click', function() {
							$(modal).modal('hide').remove();
							(callback || $.noop)();
						});
					})
					.modal({backdrop:true});
			}
		},
		/**
		 * Display a confirm message on the page
		 * @method confirm
		 * @param {string} instanceId The Instance ID of the App
		 * @param {string} message The message to be displayed
		 * @param {function} okCallback The function that will be called when the OK
		 * button is pressed
		 * @param {function} cancelCallback The function that will be called when
		 * the Cancel button is pressed
		 */
		confirm:function(instanceId, message, okCallback, cancelCallback) {

			if (!F2.isInit()) {
				F2.log('F2.init() must be called before F2.UI.Modals.confirm()');
				return;
			}

			if (F2.Rpc.isRemote(instanceId)) {
				F2.Rpc.call(
					instanceId,
					F2.Constants.Sockets.RPC,
					'F2.UI.Modals.confirm',
					[].slice.call(arguments)
				);
			} else {
				// display the alert
				$(_renderConfirm(message))
					.on('show', function() {
						var modal = this;

						$(modal).find('.btn-ok').on('click', function() {
							$(modal).modal('hide').remove();
							(okCallback || $.noop)();
						});

						$(modal).find('.btn-cancel').on('click', function() {
							$(modal).modal('hide').remove();
							(cancelCallback || $.noop)();
						});
					})
					.modal({backdrop:true});
			}
		}
	};
})());