define('F2.BaseAppClass', ['F2', 'F2.Events'], function(F2, Events) {

	function AppClass(instanceId, appConfig, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.root = root;
	}

	AppClass.prototype = {
		dispose: function() {
			this._dispose();
		},
		_dispose: function() {
			// Unsubscribe events
			for (var name in this.events) {
				Events.off(name, this.events[name]);
			}

			// Remove ourselves from the DOM
			if (this.root && this.root.parentNode) {
				this.root.parentNode.removeChild(this.root);
			}
		},
		init: function() {
			this._init();
		},
		_init: function() {
			this.events = {};
		},
		reload: function(context) {
			this._reload(context);
		},
		_reload: function(context) {
			var self = this;
			_.extend(this.appConfig.context);

			// Reload this app using the existing appConfig
			F2.load(this.appConfig).then(function(app) {
				app.root = self.root;
				self.dispose();
			});
		}
	};

	return AppClass;

});