define('F2.AppClass', ['F2'], function(F2) {

	var AppClass = function(instanceId, appConfig, context, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.context = context;
		this.root = root;
	};

	AppClass.prototype = {
		dispose: function() {},
		events: {
			many: function(name, timesToListen, handler) {
				return F2.Events.many(name, timesToListen, handler, this);
			},
			off: function(name, handler) {
				return F2.off(name, handler, this);
			},
			on: function(name, handler) {
				return F2.on(name, handler, this);
			},
			once: function(name, handler) {
				return F2.once(name, handler, this);
			}
		},
		reload: function(context) {
			var self = this;
			_.extend(this.appConfig.context, context);

			// Reload this app using the existing appConfig
			F2.load(this.appConfig).then(function(app) {
				app.root = self.root;
				F2.unload(self.instanceId);
			});
		}
	};

	return AppClass;

});
