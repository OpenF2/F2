/**
 * UI helper methods
 * @class F2.UI
 */
F2.extend('UI', (function(){

	// see classes.js for definition
	var _config = F2.UI.MaskConfiguration;

	return {
		/**
		 * Removes a overlay from an Element on the page
		 * @method hideMask
		 * @param {string} instanceId The Instance ID of the App
		 * @param {string|Element} selector The Element or selector to an Element
		 * that currently contains the loader
		 */
		hideMask:function(instanceId, selector) {

			if (!F2.isInit()) {
				F2.log('F2.init() must be called before F2.UI.hideMask()');
				return;
			}

			if (F2.Rpc.isRemote(instanceId) && !$(selector).is('.' + F2.Constants.Css.APP)) {
				F2.Rpc.call(
					instanceId,
					F2.Constants.Sockets.RPC,
					'F2.UI.hideMask',
					[
						instanceId,
						// must only pass the selector argument. if we pass an Element there
						// will be F2.stringify() errors
						$(selector).selector
					]
				);
			} else {
				
				var container = $(selector);
				var mask = container.find('> .' + F2.Constants.Css.MASK).remove();
				container.removeClass(F2.Constants.Css.MASK_CONTAINER);

				// if useClasses is false, we need to remove all inline styles
				if (!_config.useClasses) {
					container.attr('style', '');
				}

				// if the element contains this data property, we need to reset static
				// position
				if (container.data(F2.Constants.Css.MASK_CONTAINER)) {
					container.css({'position':'static'});
				}
			}
		},
		/**
		 * Set the configuration options for the
		 * {{#crossLink "F2.UI\showMask"}}{{/crossLink}} and
		 * {{#crossLink "F2.UI\hideMask"}}{{/crossLink}} methods
		 * @method setMaskConfiguration
		 * @param {object} config The F2.UI.MaskConfiguration object
		 */
		setMaskConfiguration:function(config) {
			if (!F2.isInit()) {
				if (config) {
					$.extend(_config, config);
				}
			} else {
				F2.log('F2.UI.setMaskConfiguration() must be called before F2.init()');
			}
		},
		/**
		 * Display an ovarlay over an Element on the page
		 * @method showMask
		 * @param {string} instanceId The Instance ID of the App
		 * @param {string|Element} selector The Element or selector to an Element
		 * over which to display the loader
		 * @param {bool} showLoading Display a loading icon
		 */
		showMask:function(instanceId, selector, showLoading) {

			if (!F2.isInit()) {
				F2.log('F2.init() must be called before F2.UI.showMask()');
				return;
			}

			if (F2.Rpc.isRemote(instanceId) && $(selector).is('.' + F2.Constants.Css.APP)) {
				F2.Rpc.call(
					instanceId,
					F2.Constants.Sockets.RPC,
					'F2.UI.showMask',
					[
						instanceId,
						// must only pass the selector argument. if we pass an Element there
						// will be F2.stringify() errors
						$(selector).selector,
						showLoading
					]
				);
			} else {

				if (showLoading && !_config.loadingIcon) {
					F2.log('Unable to display loading icon. Please use F2.UI.setMaskConfiguration to set the path to the loading icon');
				}

				var container = $(selector).addClass(F2.Constants.Css.MASK_CONTAINER);
				var mask = $('<div data->')
					.height('100%' /*container.outerHeight()*/)
					.width('100%' /*container.outerWidth()*/)
					.addClass(F2.Constants.Css.MASK);

				// set inline styles if useClasses is false
				if (!_config.useClasses) {
					mask.css({
						'background-color':_config.backgroundColor,
						'background-image': !!_config.loadingIcon ? ('url(' + _config.loadingIcon + ')') : '',
						'background-position':'50% 50%',
						'background-repeat':'no-repeat',
						'display':'block',
						'left':0,
						'padding':0,
						'position':'absolute',
						'top':0,
						'z-index':_config.zIndex,

						'filter':'alpha(opacity=' + (_config.opacity * 100) + ')',
						'opacity':_config.opacity
					});
				}

				// only set the position if the container is currently static
				if (container.css('position') == 'static') {
					container.css({'position':'relative'});
					// setting this data property tells hideMask to set the position
					// back to static
					container.data(F2.Constants.Css.MASK_CONTAINER, true);
				}

				// add the mask to the container
				container.append(mask);
			}
		}
	};
})());