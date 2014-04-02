define('com_example_a', ['F2', 'jquery-2.1'], function(F2, $) {

	var AppA = function(instanceId, appConfig, context, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.context = context;
		this.root = root;

		this.attachEvents();
	};

	AppA.prototype = {
		attachEvents: function() {
			var self = this;

			// Remove ourselves from the page
			$(this.root).on('click', 'button', function() {
				F2.remove(self);
			});
		}
	};

	return AppA;

});
