/**
 * Allows container developers more flexibility when it comes to handling app interaction.
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
			// if no app root is defined use the apps outter most node
			if(!F2.isNativeDOMNode(appConfig.root))
			{
				appConfig.root = jQuery(html).get(0);
			}
			
			// append the root to the body by default.
			jQuery("body").append(appConfig.root);
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
			if(appInstance.app.Destroy && typeof(appInstance.app.Destroy) == "function")
			{
				appInstance.app.Destroy();
			}
			// warn the container developer/app developer that even though they have a destroy method it hasn't been 
			else if(appInstance.app.Destroy)
			{
				F2.log(app.config.appId + " has a Destroy property, but Destroy is not of type function and as such will not be executed.");
			}
			
			// fade out and remove the root
			jQuery(appInstance.config.root).fadeOut(function() {
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
			throw ("Invalid or null argument passed. Handler will not be added to collection. A valid dom element or callback function is required.");
		}

		if(handler.domNode && !bDomNodeAppropriate)
		{
			throw ("Invalid argument passed. Handler will not be added to collection. A callback function is required for this event type.");
		}
		
		return handler;
	};
	
	var _validateToken = function(sToken)
	{
		// check token against F2 and Container
		if(_ct != sToken && _f2t != sToken) { throw ("Invalid token passed. Please verify that you have correctly received and stored token from F2.AppHandlers.getToken()."); }
	};
	
	var _removeHandler = function(arHandleCollection, sNamespaceOrApp_ID, sToken)
	{
		// will throw an exception and stop execution if the token is invalid
		_validateToken(sToken);
		
		if(!sNamespaceOrApp_ID && !arHandleCollection)
		{			
			return;
		}
		else if(!sNamespaceOrApp_ID && arHandleCollection)
		{
			arHandleCollection = [];
		}
		else if(sNamespaceOrApp_ID && arHandleCollection)
		{
			sNamespaceOrApp_ID = sNamespaceOrApp_ID.toLowerCase();		
		
			var newEvents = [];
			
			for(var i = 0, j = arHandleCollection.length; i < j; i++)
			{
				var currentHandler = arHandleCollection[i];
				if(currentHandler)
				{
					if(currentHandler.app_id != sNamespaceOrApp_ID && currentHandler.namespace != sNamespaceOrApp_ID)
					{
						newEvents.push(currentHandler);
					}
				}
			}
			
			arHandleCollection = newEvents;
		}
	};
	
	var _triggerEvent = function(arHandleCollection, arOriginalArgs)
	{	
		// no errors here, basically there are no handlers to call
		if(!arHandleCollection || !arHandleCollection.length) { return; }
		
		// there is always 1 argument required, the first arg should always be the token.
		if(!arOriginalArgs || !arOriginalArgs.length) { throw ("Invalid or null argument(s) passed. Token is required for all triggers. Please check your inputs and try again."); }
		
		// will throw an exception and stop execution if the token is invalid
		_validateToken(arOriginalArgs[0]);
		
		// remove the token from the arguments since we have validated it and no longer need it
		arOriginalArgs.shift();
		
		for(var i = 0, j = arHandleCollection.length; i < j; i++)
		{
			arHandleCollection[i].apply(F2, arguments);
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
		* Allows F2 to get a token internally
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
		**/
		__trigger: function(token, eventKey) // additional arguments will likely be passed
		{			
			// will throw an exception and stop execution if the token is invalid
			_validateToken(token);
			
			if(_handlerCollection && _handlerCollection[eventKey])
			{				
				// create a collection of arguments that are safe to pass to the callback.
				var passableArgs = [];
				
				// populate that collection with all arguments except token and eventKey
				for(var i = 2, j = arguments.length; i < j; i++)
				{
					passableArgs.push(arguments[i]);
				}
				
				if(_handlerCollection[eventKey].length == 0 && _defaultMethods[eventKey])
				{
					_defaultMethods[eventKey].apply(F2, passableArgs);
					return this;
				}
				else if(_handlerCollection[eventKey].length == 0 && !_handlerCollection[eventKey])
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
				throw ("Invalid EventKey passed. Check your inputs and try again.")
			}
			
			return this;
		},
		/**
		* Allows you to easily tell all apps to render in a specific location. Only valid for eventType 'appRender'.
		* @method on
		* @chainable
		* @param {String} token The token received from {{#crossLink "F2.AppHandlers/getToken:methods"}}{{/crossLink}}.
		* @param {String} eventKey The event key to remove handler from {{#crossLink "F2.AppHandlers/CONSTANTS:property"}}{{/crossLink}}.
		* @params {HTMLElement|Node} element Specific element to append your app to.
		* @example
		* 		F2.AppHandlers.on('3123-asd12-asd123dwase-123d-123d', 'appRenderBefore', $("#my-container").get(0));
		*		F2.AppHandlers.on('3123-asd12-asd123dwase-123d-123d', 'appRenderBefore.my_app_id', $("#my-container").get(0));
		**/
		/**
		* Allows you to add listener method that will be triggered when a specific event happens.
		* @method on
		* @chainable
		* @param {String} token The token received from {{#crossLink "F2.AppHandlers/getToken:methods"}}{{/crossLink}}.
		* @param {String} eventKey{.namespace} The event key to determine what listeners need to be removed. If no namespace is provided all
		*  listeners for the specified event type will be removed.
		*  Complete list available in {{#crossLink "F2.Constants/AppHandlers:property"}}{{/crossLink}}.
		* @params {Function} listener A function that will be triggered when a specific event happens.
		* @example
		* 		F2.AppHandlers.on('3123-asd12-asd123dwase-123d-123d', 'appRenderBefore', function() { F2.log("before app rendered!"); });		
		**/
		on: function(token, eventKey, func_or_element)
		{
			var sNamespace = null;
			
			if(!eventKey)
			{
				throw ("eventKey must be of type string and not null. For available appHandlers check F2.Constants.AppHandlers.");
			}
			
			// we need to check the key for a namespace
			if(eventKey.indexOf(".") > -1)
			{
				var arData = eventKey.split(".");
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
						(eventKey == "appRender")
					)
				);
			}
			else
			{
				throw ("Invalid EventKey passed. Check your inputs and try again.")
			}
			
			return this;
		},
		/**
		* Allows you to remove listener methods for specific events
		* @method off
		* @chainable
		* @param {String} token The token received from {{#crossLink "F2.AppHandlers/getToken:methods"}}{{/crossLink}}.
		* @param {String} eventKey{.namespace} The event key to determine what listeners need to be removed. If no namespace is provided all
		*  listeners for the specified event type will be removed.
		*  Complete list available in {{#crossLink "F2.Constants/AppHandlers:property"}}{{/crossLink}}.
		* @example
		* 		F2.AppHandlers.off('3123-asd12-asd123dwase-123d-123d', 'appRenderBefore');
		**/
		off: function(token, eventKey)
		{
			var sNamespace = null;
			
			if(!eventKey)
			{
				throw ("eventKey must be of type string and not null. For available appHandlers check F2.Constants.AppHandlers.");
			}
			
			// we need to check the key for a namespace
			if(eventKey.indexOf(".") > -1)
			{
				var arData = eventKey.split(".");
				eventKey = arData[0];
				sNamespace = arData[1];
			}
			
			if(_handlerCollection && _handlerCollection[eventKey])
			{				
				_removeHandler(
					_handlerCollection[eventKey],
					sNamespace,
					token
				);
			}
			else
			{
				throw ("Invalid EventKey passed. Check your inputs and try again.")
			}
			
			return this;
		}
	};
})());

F2.extend('Constants', {
	/**
	* A collection of constants for the on/off method names in F2.AppHandlers.
	* @property {Object} AppHandlers
	**/
	AppHandlers:
	{
		/**
		 * Identifies the create root method for use in AppHandlers.on/off/__trigger().
		 * @property APP_CREATE_ROOT
		 * @type string
		 * @static
		 * @final
		 */
		APP_CREATE_ROOT: "appCreateRoot",
		/**
		 * Identifies the before app render method for use in AppHandlers.on/off/__trigger().
		 * @property APP_RENDER_BEFORE
		 * @type string
		 * @static
		 * @final
		 */
		APP_RENDER_BEFORE: "appRenderBefore",
		/**
		 * Identifies the app render method for use in AppHandlers.on/off/__trigger().
		 * @property APP_RENDER
		 * @type string
		 * @static
		 * @final
		 */		
		APP_RENDER: "appRender",
		/**
		 * Identifies the after app render method for use in AppHandlers.on/off/__trigger().
		 * @property APP_RENDER_AFTER
		 * @type string
		 * @static
		 * @final
		 */	
		APP_RENDER_AFTER: "appRenderAfter",
		/**
		 * Identifies the before app destroy method for use in AppHandlers.on/off/__trigger().
		 * @property APP_DESTROY_BEFORE
		 * @type string
		 * @static
		 * @final
		 */
		APP_DESTROY_BEFORE: "appDestroyBefore",
		/**
		 * Identifies the app destroy method for use in AppHandlers.on/off/__trigger().
		 * @property APP_DESTROY
		 * @type string
		 * @static
		 * @final
		 */		
		APP_DESTROY: "appDestroy",
		/**
		 * Identifies the after app destroy method for use in AppHandlers.on/off/__trigger().
		 * @property APP_DESTROY_AFTER
		 * @type string
		 * @static
		 * @final
		 */
		APP_DESTROY_AFTER: "appDestroyAfter"
	}
});