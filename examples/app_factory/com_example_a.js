define('com_example_a', ['F2', 'jquery-2.1', 'moment'], function(F2, $, moment) {

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
			$(this.root).on('click', '[data-action=remove]', function() {
				F2.emit('unload', self.root);
			});

			// Broadcast an event
			$(this.root).on('click', '[data-action=event]', function() {
				F2.emit(['com_example_a'], 'PING', 'A', new Date());
			});

			// Listen for a PING event
			F2.on(this, 'PING', function(sender, timestamp) {
				$(this.root).find('.output').append(
					$('<li />').html(
						'<strong>Pinged by ' + sender + ':</strong> ' + moment(timestamp).format('YYYY-M-D h:mm:ss a')
					)
				);
			});
		}
	};

	return AppA;

});
