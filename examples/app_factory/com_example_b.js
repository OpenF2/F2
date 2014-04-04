define('com_example_b', ['F2', 'jquery-2.1', 'moment'], function(F2, $, moment) {

	var AppB = function(instanceId, appConfig, context, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.context = context;
		this.root = root;

		this.attachEvents();
	};

	AppB.prototype = {
		attachEvents: function() {
			var self = this;

			// Remove ourselves from the page
			$(this.root).on('click', '[data-action=remove]', function() {
				F2.remove(self);
			});

			// Broadcast an event
			$(this.root).on('click', '[data-action=event]', function() {
				F2.Events.emitTo(self.instanceId, 'PING', 'B', new Date());
			});

			// Listen for a PING event
			F2.Events.on(this, 'PING', function(sender, timestamp) {
				$(this.root).find('.output').append(
					$('<li />').html(
						'<strong>Pinged by ' + sender + ':</strong> ' + moment(timestamp).format('YYYY-M-D h:mm:ss a')
					)
				);
			});
		}
	};

	return AppB;

});
