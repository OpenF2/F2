define('F2.AppClassAdapters.AngularJS', [], function() {

	function AppClass(instanceId, appConfig, context, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.context = context;
		this.root = root;
	}

	return function(moduleName) {
		// Return a constructor func that F2 will use instead of the AppClass
		return function(instanceId, appConfig, context, root) {
			// Instantiate the app with all the normal params
			var app = new AppClass(instanceId, appConfig, context, root);
			// Bootstrap angular on the app's root
			angular.bootstrap(app.root, [moduleName]);

			return app;
		};
	};

});