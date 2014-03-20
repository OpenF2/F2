	// Init the lib
	var Ajax = Helpers.Ajax();
	var AppPlaceholders = Helpers.AppPlaceholders();
	var Guid = Helpers.Guid();
	var Constants = Lib.Constants();
	var Events = Lib.Events();
	var Schemas = Lib.Schemas(tv4);
	Lib.SchemaModels(Schemas);
	var LoadApps = Helpers.LoadApps(Ajax, _, Schemas, Guid);
	var Core = Lib.Core(LoadApps, _, Schemas, Events, Guid);
	var UI = Lib.UI(Core, _, Schemas);

	// Put the API together
	var F2 = function() {
		return {
			// Core
			config: Core.config,
			load: Core.load,
			removeApp: Core.removeApp,
			guid: Core.guid,
			// Events
			Events: {
				emit: Events.emit,
				on: Events.on,
				off: Events.off,
				once: Events.once,
				many: Events.many
			},
			// Constants
			Constants: Constants,
			// Schemas
			addSchema: Schemas.add,
			hasSchema: Schemas.isDefined,
			validate: Schemas.validate,
			// UI
			UI: {
				modal: UI.modal,
				showLoading: UI.showLoading,
				hideLoading: UI.hideLoading
			}
		}
	};

	// Make the F2 singleton module
	define('F2', [], function() {
		return new F2();
	});

	// Make a factory module that can spawn new instances
	define('F2Factory', [], function() {
		return F2;
	});

	// Load placeholders
	require(['F2'], function(F2) {
		// Find the placeholders on the DOM
		var placeholders = AppPlaceholders.getInNode(document.body);

		if (placeholders.length) {
			var appConfigs = _.map(placeholders, function(placeholder) {
				if (placeholder.isPreload) {
					placeholder.appConfig.root = placeholder.node;
				}

				return placeholder.appConfig;
			});

			F2.load({
				appConfigs: appConfigs,
				success: function() {
					var args = Array.prototype.slice.call(arguments);

					// Add to the DOM
					for (var i = 0, len = args.length; i < len; i++) {
						if (!placeholders[i].isPreload) {
							placeholders[i].node.parentNode.replaceChild(args[i].root, placeholders[i].node);
						}
					}
				}
			});
		}
	});

})();
