F2.extend('UI', (function(){

	var _containerConfig;

	/**
	 * UI helper methods
	 * @class F2.UI
	 * @constructor
	 * @param {F2.AppConfig} appConfig The F2.AppConfig object
	 */
	var UI_Class = function(appConfig) {

		var _appConfig = appConfig;
		var $root = jQuery(appConfig.root);

		var _updateHeight = function(height) {
			height = height || jQuery(_appConfig.root).outerHeight();

			if (F2.Rpc.isRemote(_appConfig.instanceId)) {
				F2.Rpc.call(
					_appConfig.instanceId,
					F2.Constants.Sockets.UI_RPC,
					'updateHeight',
					[
						height
					]
				);
			} else {
				_appConfig.height = height;
				$root.find('iframe').height(_appConfig.height);
			}
		};


		return {
			/**
			 * Removes a overlay from an Element on the page
			 * @method hideMask
			 * @param {string|Element} selector The Element or selector to an Element
			 * that currently contains the loader
			 */
			hideMask: function(selector) {
				F2.UI.hideMask(_appConfig.instanceId, selector);
			},
			/**
			 * Helper methods for creating and using Modals
			 * @class F2.UI.Modals
			 * @for F2.UI
			 */
			Modals: (function() {
				return {
					/**
					 * Display an alert message on the page
					 * @method alert
					 * @param {string} message The message to be displayed
					 * @param {function} [callback] The callback to be fired when the user
					 * closes the dialog
					 * @for F2.UI.Modals
					 */
					alert: function(message, callback) {
						if (!F2.isInit()) {
							F2.log('F2.init() must be called before F2.UI.Modals.alert()');
							return;
						}

						callback = callback || function() {};

						alert(message);
						callback();
					},
					/**
					 * Display a confirm message on the page
					 * @method confirm
					 * @param {string} message The message to be displayed
					 * @param {function} okCallback The function that will be called when the OK
					 * button is pressed
					 * @param {function} cancelCallback The function that will be called when
					 * the Cancel button is pressed
					 * @for F2.UI.Modals
					 */
					confirm: function(message, okCallback, cancelCallback) {
						if (!F2.isInit()) {
							F2.log('F2.init() must be called before F2.UI.Modals.confirm()');
							return;
						}

						okCallback = okCallback || function() {};
						cancelCallback = cancelCallback || function() {};

						if (confirm(message)) {
							okCallback();
						} else {
							cancelCallback();
						}
					}
				};
			})(),
			/**
			 * Sets the title of the app as shown in the browser. Depending on the
			 * container HTML, this method may do nothing if the container has not been
			 * configured properly or else the container provider does not allow Title's
			 * to be set.
			 * @method setTitle
			 * @params {string} title The title of the app
			 * @for F2.UI
			 */
			setTitle: function(title) {

				if (F2.Rpc.isRemote(_appConfig.instanceId)) {
					F2.Rpc.call(
						_appConfig.instanceId,
						F2.Constants.Sockets.UI_RPC,
						'setTitle',
						[
							title
						]
					);
				} else {
					jQuery(_appConfig.root).find('.' + F2.Constants.Css.APP_TITLE).text(title);
				}
			},
			/**
			 * Display an ovarlay over an Element on the page
			 * @method showMask
			 * @param {string|Element} selector The Element or selector to an Element
			 * over which to display the loader
			 * @param {bool} showLoading Display a loading icon
			 */
			showMask: function(selector, showLoader) {
				F2.UI.showMask(_appConfig.instanceId, selector, showLoader);
			},
			/**
			 * For secure apps, this method updates the size of the iframe that
			 * contains the app. **Note: It is recommended that app developers call
			 * this method anytime Elements are added or removed from the DOM**
			 * @method updateHeight
			 * @params {int} height The height of the app
			 */
			updateHeight: _updateHeight,
			/**
			 * Helper methods for creating and using Views
			 * @class F2.UI.Views
			 * @for F2.UI
			 */
			Views: (function(){

				var _events = new EventEmitter2();
				var _rValidEvents = /change/i;

				// unlimited listeners, set to > 0 for debugging
				_events.setMaxListeners(0);

				var _isValid = function(eventName) {
					if (_rValidEvents.test(eventName)) {
						return true;
					} else {
						F2.log('"' + eventName + '" is not a valid F2.UI.Views event name');
						return false;
					}
				};

				return {
					/**
					 * Change the current view for the app or add an event listener
					 * @method change
					 * @param {string|function} [input] If a string is passed in, the view
					 * will be changed for the app. If a function is passed in, a change
					 * event listener will be added.
					 * @for F2.UI.Views
					 */
					change: function(input) {

						if (typeof input === 'function') {
							this.on('change', input);
						} else if (typeof input === 'string') {

							if (_appConfig.isSecure && !F2.Rpc.isRemote(_appConfig.instanceId)) {
								F2.Rpc.call(
									_appConfig.instanceId,
									F2.Constants.Sockets.UI_RPC,
									'Views.change',
									[].slice.call(arguments)
								);
							} else if (F2.inArray(input, _appConfig.views)) {
								jQuery('.' + F2.Constants.Css.APP_VIEW, $root)
									.addClass('hide')
									.filter('[data-f2-view="' + input + '"]', $root)
									.removeClass('hide');
								
								_updateHeight();
								_events.emit('change', input);
							}							
						}
					},
					/**
					 * Removes a view event listener
					 * @method off
					 * @param {string} event The event name
					 * @param {function} listener The function that will be removed
					 * @for F2.UI.Views
					 */
					off: function(event, listener) {
						if (_isValid(event)) {
							_events.off(event, listener);
						}
					},
					/**
					 * Adds a view event listener
					 * @method on
					 * @param {string} event The event name
					 * @param {function} listener The function to be fired when the event is
					 * emitted
					 * @for F2.UI.Views
					 */
					on: function(event, listener) {
						if (_isValid(event)) {
							_events.on(event, listener);
						}
					}
				};
			})()
		};
	};

	/**
	 * Removes a overlay from an Element on the page
	 * @method hideMask
	 * @static
	 * @param {string} instanceId The Instance ID of the app
	 * @param {string|Element} selector The Element or selector to an Element
	 * that currently contains the loader
	 * @for F2.UI
	 */
	UI_Class.hideMask = function(instanceId, selector) {

		if (!F2.isInit()) {
			F2.log('F2.init() must be called before F2.UI.hideMask()');
			return;
		}

		if (F2.Rpc.isRemote(instanceId) && !jQuery(selector).is('.' + F2.Constants.Css.APP)) {
			F2.Rpc.call(
				instanceId,
				F2.Constants.Sockets.RPC,
				'F2.UI.hideMask',
				[
					instanceId,
					// must only pass the selector argument. if we pass an Element there
					// will be F2.stringify() errors
					jQuery(selector).selector
				]
			);
		} else {
			
			var container = jQuery(selector);
			container.find('> .' + F2.Constants.Css.MASK).remove();
			container.removeClass(F2.Constants.Css.MASK_CONTAINER);

			// if the element contains this data property, we need to reset static
			// position
			if (container.data(F2.Constants.Css.MASK_CONTAINER)) {
				container.css({'position':'static'});
			}
		}
	};

	/**
	 *
	 * @method init
	 * @static
	 * @param {F2.ContainerConfig} containerConfig The F2.ContainerConfig object
	 */
	UI_Class.init = function(containerConfig) {
		_containerConfig = containerConfig;

		// set defaults
		_containerConfig.UI = jQuery.extend(true, {}, F2.ContainerConfig.UI, _containerConfig.UI || {});
	};

	/**
	 * Display an ovarlay over an Element on the page
	 * @method showMask
	 * @static
	 * @param {string} instanceId The Instance ID of the app
	 * @param {string|Element} selector The Element or selector to an Element
	 * over which to display the loader
	 * @param {bool} showLoading Display a loading icon
	 */
	UI_Class.showMask = function(instanceId, selector, showLoading) {

		if (!F2.isInit()) {
			F2.log('F2.init() must be called before F2.UI.showMask()');
			return;
		}

		if (F2.Rpc.isRemote(instanceId) && jQuery(selector).is('.' + F2.Constants.Css.APP)) {
			F2.Rpc.call(
				instanceId,
				F2.Constants.Sockets.RPC,
				'F2.UI.showMask',
				[
					instanceId,
					// must only pass the selector argument. if we pass an Element there
					// will be F2.stringify() errors
					jQuery(selector).selector,
					showLoading
				]
			);
		} else {

			if (showLoading && !_containerConfig.UI.Mask.loadingIcon) {
				F2.log('Unable to display loading icon. Please set F2.ContainerConfig.UI.Mask.loadingIcon	when calling F2.init();');
			}

			var container = jQuery(selector).addClass(F2.Constants.Css.MASK_CONTAINER);
			var mask = jQuery('<div>')
				.height('100%' /*container.outerHeight()*/)
				.width('100%' /*container.outerWidth()*/)
				.addClass(F2.Constants.Css.MASK);

			// set inline styles if useClasses is false
			if (!_containerConfig.UI.Mask.useClasses) {
				mask.css({
					'background-color':_containerConfig.UI.Mask.backgroundColor,
					'background-image': !!_containerConfig.UI.Mask.loadingIcon ? ('url(' + _containerConfig.UI.Mask.loadingIcon + ')') : '',
					'background-position':'50% 50%',
					'background-repeat':'no-repeat',
					'display':'block',
					'left':0,
					'min-height':30,
					'padding':0,
					'position':'absolute',
					'top':0,
					'z-index':_containerConfig.UI.Mask.zIndex,

					'filter':'alpha(opacity=' + (_containerConfig.UI.Mask.opacity * 100) + ')',
					'opacity':_containerConfig.UI.Mask.opacity
				});
			}

			// only set the position if the container is currently static
			if (container.css('position') === 'static') {
				container.css({'position':'relative'});
				// setting this data property tells hideMask to set the position
				// back to static
				container.data(F2.Constants.Css.MASK_CONTAINER, true);
			}

			// add the mask to the container
			container.append(mask);
		}
	};

	return UI_Class;
})());
