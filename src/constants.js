(function() {

	var EVENTS = {},
		VIEWS = {};

	/*
	* writable and configurable are false by default.
	*/

	Object.defineProperty(EVENTS, 'APP_SYMBOL_CHANGE',
		{ value: '__appSymbolChange__'});
	Object.defineProperty(EVENTS, 'APP_WIDTH_CHANGE', 
		{ value: '__appWidthChange__'});
	Object.defineProperty(EVENTS, 'CONTAINER_SYMBOL_CHANGE', 
		{ value: '__containerSymbolChange__'});
	Object.defineProperty(EVENTS, 'APP_SYMBOL_CHANGE', 
		{ value: '__appSymbolChange__'});

	Object.defineProperty(VIEWS, 'ABOUT', 
		{ value: 'about'});
	Object.defineProperty(VIEWS, 'DATA_ATTRIBUTE', 
		{ value: 'data-f2-view'});
	Object.defineProperty(VIEWS, 'HELP', 
		{ value: 'help'});
	Object.defineProperty(VIEWS, 'HOME', 
		{ value: 'home'});
	Object.defineProperty(VIEWS, 'REMOVE', 
		{ value: 'remove'});
	Object.defineProperty(VIEWS, 'SETTINGS', 
		{ value: 'settings'});


	// Leave the constants open for development,
	// but keep the default immutable.
	Object.defineProperty(F2.prototype, 'Constants', {
		value : {
			EVENTS: EVENTS,
			VIEWS: VIEWS
		},
		writable : true,
		configurable : true
	});

})();
