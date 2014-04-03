define('com_example_d.layer', [], function() {
	console.log('am I ever run?');

	define('com_example_d', ['F2', 'jquery-2.1'], function(F2, $) {

		var AppD = function(instanceId, appConfig, context, root) {
			this.instanceId = instanceId;
			this.appConfig = appConfig;
			this.context = context;
			this.root = root;

			this.attachEvents();
		};

		AppD.prototype = {
			attachEvents: function() {
				var self = this;

				// Remove ourselves from the page
				$(this.root).on('click', 'button', function() {
					F2.remove(self);
				});
			}
		};

		return AppD;
	});
});