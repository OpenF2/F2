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
				F2.remove(self);
			});

			// Broadcast an event
			$(this.root).on('click', '[data-action=event]', function() {
				F2.emit('PING', { sender: 'A', timestamp: new Date() }, ['com_example_a']);
			});

			// Listen for a PING event
			F2.on(this, 'PING', function(args) {
				$(this.root).find('.output').append(
					$('<li />').html(
						'<strong>Pinged by ' + args.sender + ':</strong> ' + moment(args.timestamp).format('YYYY-M-D h:mm:ss a')
					)
				);
			});
		}
	};

	return AppA;

});
