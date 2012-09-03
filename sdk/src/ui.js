/**
 * UI helper methods
 * @class F2.UI
 */
F2.extend('UI', (function(){

	return {
		/**
		 * Removes a loading icon/overlay from an Element on the page
		 * @method hideLoader
		 * @param {string} instanceId The Instance ID of the App
		 * @param {string|Element} selector The Element or selector to an Element
		 * that currently contains the loader
		 */
		hideLoader:function(instanceId, selector) {
			if (F2.Rpc.isRemote(instanceId) && !$(selector).is('.' + F2.Constants.Css.APP)) {
				F2.Rpc.call(
					instanceId,
					F2.Constants.Sockets.RPC,
					'F2.UI.hideLoader',
					[
						// must only pass the selector argument. if we pass an Element there
						// will be F2.stringify() errors
						$(selector).selector
					]
				);
			} else {
				F2.log('hideLoader called');
			}
		},
		/**
		 * Display a loading icon/ovarlay over an Element on the page
		 * @method showLoader
		 * @param {string} instanceId The Instance ID of the App
		 * @param {string|Element} selector The Element or selector to an Element
		 * over which to display the loader
		 */
		showLoader:function(instanceId, selector) {
			if (F2.Rpc.isRemote(instanceId) && !$(selector).is('.' + F2.Constants.Css.APP)) {
				F2.Rpc.call(
					instanceId,
					F2.Constants.Sockets.RPC,
					'F2.UI.showLoader',
					[
						// must only pass the selector argument. if we pass an Element there
						// will be F2.stringify() errors
						$(selector).selector
					]
				);
			} else {
				F2.log('showLoader called');
			}
		}
	};
})());