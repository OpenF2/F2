define('F2.BaseAppClass', ['F2', 'F2.Events'], function(F2, Events) {

	function AppClass(instanceId, appConfig, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.root = root;
	}

	AppClass.prototype = {
		dispose: function() {},
		events: {
			many: function(name, timesToListen, handler) {
				return Events.many(name, timesToListen, handler, this);
			},
			off: function(name, handler) {
				return Events.off(name, handler, this);
			},
			on: function(name, handler) {
				return Events.on(name, handler, this);
			},
			once: function(name, handler) {
				return Events.once(name, handler, this);
			}
		},
		reload: function(context) {
			var self = this;
			_.extend(this.appConfig.context, context);

			// Reload this app using the existing appConfig
			F2.load(this.appConfig).then(function(app) {
				app.root = self.root;
				F2.removeApp(self.instanceId, false);
			});
		}
	};

	return AppClass;

});