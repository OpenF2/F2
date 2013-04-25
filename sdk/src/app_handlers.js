/**
 * Allows container developers more flexibility when it comes to handling app interaction. Starting with version 1.3 this is the preferred method
 * for choosing how app rendering/interaction happens. This replaces the config versions of beforeAppRender, appRender, and afterAppRender. It also
 * adds hooks into an app being removed/destroyed. As F2 evolves more hooks will be added to aid in container development.
 * @class F2.AppHandlers
 */
F2.extend('AppHandlers', (function() {

	// the hidden token that we will check against every time someone tries to add, remove, fire handler
	var _ct = F2.guid();
	var _f2t = F2.guid();
	
	var _handlerCollection = {
		appCreateRoot: [],
		appRenderBefore: [],			
		//appReloadBefore: [],
		appDestroyBefore: [],
		appRenderAfter: [],
		//appReloadAfter: [],
		appDestroyAfter: [],
		appRender: [],
		//appReload: [],
		appDestroy: []			
	};
	
	var _defaultMethods = {
		appCreateRoot: function()
		{
			// do nothing to create root. F2.Container will automatically create the root in the default appRender
		},
		appRenderBefore: function(appConfig)
		{
			// do nothing before an app is rendered
		},
		appRender: function(appConfig, html)
		{
			var $root = null;
			
			// if no app root is defined use the apps outter most node
			if(!F2.isNativeDOMNode(appConfig.root))
			{
				appConfig.root = jQuery(html).get(0);
				// get a handle on the root in jQuery
				$root = jQuery(appConfig.root);				
			}
			else
			{
				// get a handle on the root in jQuery
				$root = jQuery(appConfig.root);			
				
				// append the app html to the root
				$root.append(html);
			}			
			
			// append the root to the body by default.
			jQuery('body').append($root);
		},
		appRenderAfter: function()
		{
			// do nothing after an app is rendered
		},
		
		appReloadBefore: function()
		{
			// do nothing before an app reloads
		},
		appReload: function()
		{
			// re-request the app?
			// re-add files?
			// re init js ?
		},
		appReloadAfter: function()
		{
			// do nothing after an app reloads
		},
		
		appDestroyBefore: function()
		{
			// do nothing before destroying app
		},
		appDestroy: function(appInstance)
		{
			// call the apps destroy method, if it has one
			if(appInstance && appInstance.app && appInstance.app.destroy && typeof(appInstance.app.destroy) == 'function')
			{
				appInstance.app.destroy();
			}
			// warn the container developer/app developer that even though they have a destroy method it hasn't been 
			else if(appInstance && appInstance.app && appInstance.app.destroy)
			{
				F2.log(appInstance.config.appId + ' has a destroy property, but destroy is not of type function and as such will not be executed.');
			}
			
			// fade out and remove the root
			jQuery(appInstance.config.root).fadeOut(500, function() {
				jQuery(this).remove();
			});
		},
		appDestroyAfter: function()
		{
			// do nothing after an app is destroyed
		}
	};
	
	var _createHandler = function(token, sNamespace, func_or_element, bDomNodeAppropriate)
	{	
		// will throw an exception and stop execution if the token is invalid
		_validateToken(token);			
		
		// create handler structure. Not all arguments properties will be populated/used.
		var handler = {
			func: (typeof(func_or_element)) ? func_or_element : null,
			namespace: sNamespace,			
			domNode: (F2.isNativeDOMNode(func_or_element)) ? func_or_element : null
		};
		
		if(!handler.func && !handler.domNode)
		{
			throw ('Invalid or null argument passed. Handler will not be added to collection. A valid dom element or callback function is required.');
		}

		if(handler.domNode && !bDomNodeAppropriate)
		{
			throw ('Invalid argument passed. Handler will not be added to collection. A callback function is required for this event type.');
		}
		
		return handler;
	};
	
	var _validateToken = function(sToken)
	{
		// check token against F2 and Container
		if(_ct != sToken && _f2t != sToken) { throw ('Invalid token passed. Please verify that you have correctly received and stored token from F2.AppHandlers.getToken().'); }
	};
	
	var _removeHandler = function(sToken, eventKey, sNamespace)
	{
		// will throw an exception and stop execution if the token is invalid
		_validateToken(sToken);
		
		if(!sNamespace && !eventKey)
		{			
			return;
		}
		// remove by event key
		else if(!sNamespace && eventKey)
		{
			_handlerCollection[eventKey] = [];
		}
		// remove by namespace only
		else if(sNamespace && !eventKey)
		{
			sNamespace = sNamespace.toLowerCase();		
		
			for(var eventKey in _handlerCollection)
			{
				var eventCollection = _handlerCollection[eventKey];
				var newEvents = [];

				for(var i = 0, j = eventCollection.length; i < j; i++)
				{
					var currentHandler = eventCollection[i];
					if(currentHandler)
					{
						if(!currentHandler.namespace || currentHandler.namespace.toLowerCase() != sNamespace)
						{
							newEvents.push(currentHandler);
						}
					}
				}

				eventCollection = newEvents;				
			}			
		}
		else if(sNamespace && _handlerCollection[eventKey])
		{
			sNamespace = sNamespace.toLowerCase();		
		
			var newEvents = [];
			
			for(var i = 0, j = _handlerCollection[eventKey].length; i < j; i++)
			{
				var currentHandler = _handlerCollection[eventKey][i];
				if(currentHandler)
				{
					if(!currentHandler.namespace || currentHandler.namespace.toLowerCase() != sNamespace)
					{
						newEvents.push(currentHandler);
					}
				}
			}
			
			_handlerCollection[eventKey] = newEvents;
		}
	};
	
	return {
		/**
		* Allows container developer to retrieve a special token which must be passed to
		* all On and Off methods. This function will self destruct so be sure to keep the response
		* inside of a closure somewhere.
		* @method getToken		 
		**/
		getToken: function()
		{
			// delete this method for security that way only the container has access to the token 1 time.
			// kind of James Bond-ish, this message will self destruct immediately.
			delete this.getToken;
			// return the token, which we validate against.
			return _ct;
		},
		/**
		* Allows F2 to get a token internally. Token is required to call {{#crossLink "F2.AppHandlers/\_\_trigger:method"}}{{/crossLink}}.
		* This function will self destruct to eliminate other sources from using the {{#crossLink "F2.AppHandlers/\_\_trigger:method"}}{{/crossLink}}
		* and other internal methods.
		* @method __f2GetToken
		* @private
		**/
		__f2GetToken: function()
		{
			// delete this method for security that way only the F2 internally has access to the token 1 time.
			// kind of James Bond-ish, this message will self destruct immediately.
			delete this.__f2GetToken;
			// return the token, which we validate against.
			return _f2t;
		},
		/**
		* Allows F2 to trigger specific app events internally.
		* @method __trigger
		* @private
		* @chainable
		* @param {String} token The token received from {{#crossLink "F2.AppHandlers/\_\_f2GetToken:method"}}{{/crossLink}}.
		* @param {String} eventKey The event you want to fire. Complete list of event keys available in {{#crossLink "F2.Constants/AppHandlers:property"}}{{/crossLink}}.
		**/
		__trigger: function(token, eventKey) // additional arguments will likely be passed
		{			
			// will throw an exception and stop execution if the token is invalid
			if(token != _f2t)
			{
				throw ('Token passed is invalid. Only F2 is allowed to call F2.AppHandlers.__trigger().');
			}
			
			if(_handlerCollection && _handlerCollection[eventKey])
			{				
				// create a collection of arguments that are safe to pass to the callback.
				var passableArgs = [];
				
				// populate that collection with all arguments except token and eventKey
				for(var i = 2, j = arguments.length; i < j; i++)
				{
					passableArgs.push(arguments[i]);
				}
				
				if(_handlerCollection[eventKey].length === 0 && _defaultMethods[eventKey])
				{
					_defaultMethods[eventKey].apply(F2, passableArgs);
					return this;
				}
				else if(_handlerCollection[eventKey].length === 0 && !_handlerCollection[eventKey])
				{
					return this;
				}
				
				// fire all event listeners in the order that they were added.
				for(var i = 0, j = _handlerCollection[eventKey].length; i < j; i++)
				{
					var handler = _handlerCollection[eventKey][i];
					
					if (handler.domNode && arguments[2] && arguments[2].root && arguments[3])
					{
						var $appRoot = jQuery(arguments[2].root).append(arguments[3]);
						jQuery(handler.domNode).append($appRoot);
					}
					else
					{
						handler.func.apply(F2, passableArgs);
					}
				}
			}
			else
			{
				throw ('Invalid EventKey passed. Check your inputs and try again.');
			}
			
			return this;
		},
		/**
		* Allows you to easily tell all apps to render in a specific location. Only valid for eventType 'appRender'.
		* @method on
		* @chainable
		* @param {String} token The token received from {{#crossLink "F2.AppHandlers/getToken:methods"}}{{/crossLink}} or {{#crossLink "F2.AppHandlers/\_\_trigger:method"}}{{/crossLink}}.
		* @param {String} eventKey{.namespace} The event key to determine what event you want to bind to. The namespace is useful for removal 
		* purposes. At this time it does not affect when an event is fired. Complete list of event keys available in 
		* {{#crossLink "F2.Constants/AppHandlers:property"}}{{/crossLink}}.
		* @params {HTMLElement|Node} element Specific element to append your app to.
		* @example
		*     F2.AppHandlers.on('3123-asd12-asd123dwase-123d-123d', 'appRender', document.getElementById('my_container'));
		*     F2.AppHandlers.on('3123-asd12-asd123dwase-123d-123d', 'appRender.myNamespace', document.getElementById('my_container'));
		**/
		/**
		* Allows you to add listener method that will be triggered when a specific event happens.
		* @method on
		* @chainable
		* @param {String} token The token received from {{#crossLink "F2.AppHandlers/getToken:method"}}{{/crossLink}} or {{#crossLink "F2.AppHandlers/\_\_trigger:method"}}{{/crossLink}}.
		* @param {String} eventKey{.namespace} The event key to determine what event you want to bind to. The namespace is useful for removal 
		* purposes. At this time it does not affect when an event is fired. Complete list of event keys available in 
		* {{#crossLink "F2.Constants/AppHandlers:property"}}{{/crossLink}}.
		* @params {Function} listener A function that will be triggered when a specific event happens.
		* @example
		*     F2.AppHandlers.on('3123-asd12-asd123dwase-123d-123d', 'appRenderBefore', function() { F2.log('before app rendered!'); });
		*     F2.AppHandlers.on('3123-asd12-asd123dwase-123d-123d', 'appRenderBefore.myNamespace', function() { F2.log('before app rendered!'); });
		**/
		on: function(token, eventKey, func_or_element)
		{
			var sNamespace = null;
			
			if(!eventKey)
			{
				throw ('eventKey must be of type string and not null. For available appHandlers check F2.Constants.AppHandlers.');
			}
			
			// we need to check the key for a namespace
			if(eventKey.indexOf('.') > -1)
			{
				var arData = eventKey.split('.');
				eventKey = arData[0];
				sNamespace = arData[1];
			}
			
			if(_handlerCollection && _handlerCollection[eventKey])
			{
				_handlerCollection[eventKey].push(
					_createHandler(
						token,
						sNamespace,
						func_or_element,
						(eventKey == 'appRender')
					)
				);
			}
			else
			{
				throw ('Invalid EventKey passed. Check your inputs and try again.');
			}
			
			return this;
		},
		/**
		* Allows you to remove listener methods for specific events
		* @method off
		* @chainable
		* @param {String} token The token received from {{#crossLink "F2.AppHandlers/getToken:method"}}{{/crossLink}}.
		* @param {String} eventKey{.namespace} The event key to determine what listeners need to be removed. If no namespace is provided all
		*  listeners for the specified event type will be removed.
		*  Complete list available in {{#crossLink "F2.Constants/AppHandlers:property"}}{{/crossLink}}.
		* @example
		*     F2.AppHandlers.off('3123-asd12-asd123dwase-123d-123d', 'appRenderBefore');
		**/
		off: function(token, eventKey)
		{
			var sNamespace = null;
			
			if(!eventKey)
			{
				throw ('eventKey must be of type string and not null. For available appHandlers check F2.Constants.AppHandlers.');
			}
			
			// we need to check the key for a namespace
			if(eventKey.indexOf('.') > -1)
			{
				var arData = eventKey.split('.');
				eventKey = arData[0];
				sNamespace = arData[1];
			}
			
			if(_handlerCollection && _handlerCollection[eventKey])
			{				
				_removeHandler(
					token,
					eventKey,
					sNamespace
				);
			}
			else
			{
				throw ('Invalid EventKey passed. Check your inputs and try again.');
			}
			
			return this;
		}
	};
})());

/**
 * A convenient collection of all available appHandler events.
 * @class F2.Constants.AppHandlers
 */
F2.extend('Constants', {
	/**
	* A collection of constants for the on/off method names in F2.AppHandlers.
	* @property {Object} AppHandlers
	**/
	AppHandlers:
	{
		/**
		 * Equivalent to 'appCreateRoot'. Identifies the create root method for use in AppHandlers.on/off/__trigger().
		 * @property APP_CREATE_ROOT
		 * @type string
		 * @static
		 * @final
		 */
		APP_CREATE_ROOT: 'appCreateRoot',
		/**
		 * Equivalent to 'appRenderBefore'. Identifies the before app render method for use in AppHandlers.on/off/__trigger().
		 * @property APP_RENDER_BEFORE
		 * @type string
		 * @static
		 * @final
		 */
		APP_RENDER_BEFORE: 'appRenderBefore',
		/**
		 * Equivalent to 'appRender'. Identifies the app render method for use in AppHandlers.on/off/__trigger().
		 * @property APP_RENDER
		 * @type string
		 * @static
		 * @final
		 */		
		APP_RENDER: 'appRender',
		/**
		 * Equivalent to 'appRenderAfter'. Identifies the after app render method for use in AppHandlers.on/off/__trigger().
		 * @property APP_RENDER_AFTER
		 * @type string
		 * @static
		 * @final
		 */	
		APP_RENDER_AFTER: 'appRenderAfter',
		/**
		 * Equivalent to 'appDestroyBefore'. Identifies the before app destroy method for use in AppHandlers.on/off/__trigger().
		 * @property APP_DESTROY_BEFORE
		 * @type string
		 * @static
		 * @final
		 */
		APP_DESTROY_BEFORE: 'appDestroyBefore',
		/**
		 * Equivalent to 'appDestroy'. Identifies the app destroy method for use in AppHandlers.on/off/__trigger().
		 * @property APP_DESTROY
		 * @type string
		 * @static
		 * @final
		 */		
		APP_DESTROY: 'appDestroy',
		/**
		 * Equivalent to 'appDestroyAfter'. Identifies the after app destroy method for use in AppHandlers.on/off/__trigger().
		 * @property APP_DESTROY_AFTER
		 * @type string
		 * @static
		 * @final
		 */
		APP_DESTROY_AFTER: 'appDestroyAfter'
	}
});