/**
 * Allows container developers more flexibility when it comes to handling app interaction.
 * @class F2.AppHandlers
 */
F2.extend('AppHandlers', (function() {
	
	// the hidden token that we will check against every time someone tries to add, remove, fire handler
	var _ct = F2.guid();
	var _f2t = F2.guid();
	
	var _handlerCollection = {		
		beforeApp:
		{
			render: [],
			remove: [],
			reload: [],
			destroy: []
		},
		afterApp:
		{
			render: [],
			remove: [],
			reload: [],
			destroy: []
		},
		app:
		{
			render: [],
			remove: [],
			reload: [],
			destroy: []
		}			
	};
	
	//Returns true if it is a DOM node
	function _isNode(o){
		return (
			typeof Node === "object" ? o instanceof Node : 
			o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
		);
	}

	//Returns true if it is a DOM element    
	function _isElement(o){
		return (
			typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
			o && typeof o === "object" && o.nodeType === 1 && typeof o.nodeName==="string"
		);
	}
	
	var _createHandler = function(arOriginalArgs, bDomNodeAppropriate)
	{
		if(!arOriginalArgs || !arOriginalArgs.length) { throw "Invalid or null argument(s) passed. Handler will not be added to collection. Please check your inputs and try again." }
		
		// will throw an exception and stop execution if the token is invalid
		_validateToken(arOriginalArgs[0]);
		
		var iArgCount = arOriginalArgs.length;
		
		// TODO: pop off first arg
		
		// create handler structure. Not all arguments properties will be populated/used.
		var handler = {
			func: null,
			namespace: null,
			app_id: null,
			domNode: null
		};
		
		// based on the argument count try to create a handler.
		switch(iArgCount)
		{
			case 1:
				// method signature(oDomNode)
				if(arOriginalArgs[0] && bDomNodeAppropriate && (_isNode(arOriginalArgs[0]) || _isElement(arOriginalArgs[0]))
				{
					handler.domNode = arOriginalArgs[0];
				}
				// method signature (function(){})
				else if(arOriginalArgs[0] && typeof(arOriginalArgs[0]) == "function")
				{
					handler.func = arOriginalArgs[0];
				}
				// error
				else
				{
					throw "Invalid or null argument passed. Argument must be of type function or a native dom node";
				}
				break;
			case 2:
				// method signature ("APP_ID" ,oDomNode)
				if(
					arOriginalArgs[0] &&
					arOriginalArgs[1] &&				
					typeof(arOriginalArgs[0]) == "string" &&
					bDomNodeAppropriate	&&
					(_isNode(arOriginalArgs[1]) || _isElement(arOriginalArgs[1]))
				{
					handler.app_id = arOriginalArgs[0];
					handler.domNode = arOriginalArgs[1];
				}
				// method signature ("APP_ID" ,function(){})
				else if(
					arOriginalArgs[0] &&
					arOriginalArgs[1] &&					
					typeof(arOriginalArgs[0]) == "string" &&
					typeof(arOriginalArgs[1]) == "function"
				)
				{
					handler.app_id = arOriginalArgs[0];
					handler.func = arOriginalArgs[1];
				}
				// method signature (function(){} ,"NAMESPACE")
				else if(
					arOriginalArgs[0] &&
					arOriginalArgs[1] &&					
					typeof(arOriginalArgs[0]) == "function" &&
					typeof(arOriginalArgs[1]) == "string"					
				)
				{
					handler.func = arOriginalArgs[0];
					handler.namespace = arOriginalArgs[1];					
				}
				// error
				else
				{
					throw "Invalid or null argument(s) passed. Argument[0] must be of type function or string (to represent app_id). Argument[1] must be native domnode, function, or string (to represent namespace)";
				}			
				break;			
			case 3:
				// method signature ("APP_ID", oDomNode, "NAMESPACE")
				if(
					arOriginalArgs[0] &&
					arOriginalArgs[1] &&					
					typeof(arOriginalArgs[0]) == "string" &&
					bDomNodeAppropriate	&&
					(_isNode(arOriginalArgs[1]) || _isElement(arOriginalArgs[1])) &&
					typeof(arOriginalArgs[2]) == "string"
				{
					handler.app_id = arOriginalArgs[0];
					handler.domNode = arOriginalArgs[1];
					handler.namespace = arOriginalArgs[2];
				}
				// method signature ("APP_ID", function(){}, "NAMESPACE")
				else if(
					arOriginalArgs[0] &&
					arOriginalArgs[1] &&					
					typeof(arOriginalArgs[0]) == "string" &&
					typeof(arOriginalArgs[1]) == "function" &&
					typeof(arOriginalArgs[2]) == "string"
				)
				{
					handler.app_id = arOriginalArgs[0];
					handler.func = arOriginalArgs[1];
					handler.namespace = arOriginalArgs[2];
				}
				else
				{
					throw "Invalid or null argument(s) passed. Argument[0] must be of type string that represents the app_id. Argument[1] must be native domnode or function. Argument[2] must be of type string to represent a namespace.";
				}
				break;
				// throw exception if there are 0 or 4+ arguments
			default:
				throw "Invalid or null argument(s) passed. Handler will not be added to collection. Please check your inputs and try again."
		}
		
		return handler;
	};
	
	var _validateToken = function(sToken)
	{
		// check token against F2 and Container
		if(_ct != sToken && _f2t != sToken) { throw "Invalid token passed. Please verify that you have correctly received and stored token from F2.AppHandlers.getToken()."; }
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
					if(currentHandler.app_id != sNamespaceOrApp_ID) && currentHandler.namespace != sNamespaceOrApp_ID)
					{
						newEvents.push(currentHandler);
					}
				}
			}
			
			arHandleCollection = newEvents;
		}
	};
	
	return {
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
		 */
		__f2GetToken: function()
		{
			// delete this method for security that way only the F2 internally has access to the token 1 time.
			// kind of James Bond-ish, this message will self destruct immediately.
			delete this.__f2GetToken;
			// return the token, which we validate against.
			return _f2t;
		},
		__f2Trigger:
		{
			beforeApp:
				{
					render: function(sToken) { _handlerCollection.beforeApp.render.push(_createHandler(arguments)); },
					remove: function(sToken) { _handlerCollection.beforeApp.remove.push(_createHandler(arguments)); },
					reload: function(sToken) { _handlerCollection.beforeApp.reload.push(_createHandler(arguments)); },
					destroy: function(sToken) { _handlerCollection.beforeApp.destroy.push(_createHandler(arguments)); }
				},
				afterApp:
				{
					render: function(sToken) { _handlerCollection.afterApp.render.push(_createHandler(arguments)); },
					remove: function(sToken) { _handlerCollection.afterApp.remove.push(_createHandler(arguments)); },
					reload: function(sToken) { _handlerCollection.afterApp.reload.push(_createHandler(arguments)); },
					destroy: function(sToken) { _handlerCollection.afterApp.destroy.push(_createHandler(arguments)); }
				},
				app:
				{
					render: function(sToken) { _handlerCollection.app.render.push(_createHandler(arguments), true); },
					remove: function(sToken) { _handlerCollection.app.remove.push(_createHandler(arguments)); },
					reload: function(sToken) { _handlerCollection.app.reload.push(_createHandler(arguments)); },
					destroy: function(sToken) { _handlerCollection.app.destroy.push(_createHandler(arguments)); }
				}
		},
		on: {
				beforeApp:
				{
					render: function() { _handlerCollection.beforeApp.render.push(_createHandler(arguments)); },
					remove: function(){ _handlerCollection.beforeApp.remove.push(_createHandler(arguments)); },
					reload: function(){ _handlerCollection.beforeApp.reload.push(_createHandler(arguments)); },
					destroy: function(){ _handlerCollection.beforeApp.destroy.push(_createHandler(arguments)); }
				},
				afterApp:
				{
					render: function() { _handlerCollection.afterApp.render.push(_createHandler(arguments)); },
					remove: function(){ _handlerCollection.afterApp.remove.push(_createHandler(arguments)); },
					reload: function(){ _handlerCollection.afterApp.reload.push(_createHandler(arguments)); },
					destroy: function(){ _handlerCollection.afterApp.destroy.push(_createHandler(arguments)); }
				},
				app:
				{
					render: function() { _handlerCollection.app.render.push(_createHandler(arguments), true); },
					remove: function(){ _handlerCollection.app.remove.push(_createHandler(arguments)); },
					reload: function(){ _handlerCollection.app.reload.push(_createHandler(arguments)); },
					destroy: function(){ _handlerCollection.app.destroy.push(_createHandler(arguments)); }
				}
		},
		off: {
				beforeApp:
				{
					render: function(sNamespaceOrApp_ID, sToken) { _removeHandler(_handlerCollection.beforeApp.render, sNamespaceOrApp_ID, sToken); },
					remove: function(sNamespaceOrApp_ID, sToken) { _removeHandler(_handlerCollection.beforeApp.remove, sNamespaceOrApp_ID, sToken); },
					reload: function(sNamespaceOrApp_ID, sToken) { _removeHandler(_handlerCollection.beforeApp.reload, sNamespaceOrApp_ID, sToken); },
					destroy: function(sNamespaceOrApp_ID, sToken){ _removeHandler(_handlerCollection.beforeApp.destroy, sNamespaceOrApp_ID, sToken); }
				},
				afterApp:
				{
					render: function(sNamespaceOrApp_ID, sToken) { _removeHandler(_handlerCollection.afterApp.render, sNamespaceOrApp_ID, sToken); },
					remove: function(sNamespaceOrApp_ID, sToken) { _removeHandler(_handlerCollection.afterApp.remove, sNamespaceOrApp_ID, sToken); },
					reload: function(sNamespaceOrApp_ID, sToken) { _removeHandler(_handlerCollection.afterApp.reload, sNamespaceOrApp_ID, sToken); },
					destroy: function(sNamespaceOrApp_ID, sToken){ _removeHandler(_handlerCollection.afterApp.destroy, sNamespaceOrApp_ID, sToken); }
				},
				app:
				{
					render: function(sNamespaceOrApp_ID, sToken) { _removeHandler(_handlerCollection.app.render, sNamespaceOrApp_ID, sToken); },
					remove: function(sNamespaceOrApp_ID, sToken) { _removeHandler(_handlerCollection.app.remove, sNamespaceOrApp_ID, sToken); },
					reload: function(sNamespaceOrApp_ID, sToken) { _removeHandler(_handlerCollection.app.reload, sNamespaceOrApp_ID, sToken); },
					destroy: function(sNamespaceOrApp_ID, sToken){ _removeHandler(_handlerCollection.app.destroy, sNamespaceOrApp_ID, sToken); }
				}
		}
	};
})());