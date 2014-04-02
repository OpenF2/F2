define('com_example_c', ['F2', 'jquery-2.1'], function(F2, $) {

	var AppC = function(instanceId, appConfig, context, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.context = context;
		this.root = root;

		this.attachEvents();
	};

	AppC.prototype = {
		attachEvents: function() {
			var self = this;

			// Remove ourselves from the page
			$(this.root).on('click', 'button', function() {
				F2.remove(self);
			});
		}
	};

	return AppC;

});
