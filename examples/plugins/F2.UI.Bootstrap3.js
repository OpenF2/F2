define('F2.UI.Bootstrap3', [], function() {
	return {
		/*
			// Container usage
			F2.config({
				ui: {
					modal: Bootstrap3.modal
				}
			});

			// App usage
			F2.UI.modal({
				title: "I'm flying!",
				content: "<p>Wheeeee</p>",
				buttons: [
					{
						label: "Go down",
						handler: function(e, close, body) {
							close();
						}
					}
				]
			});
		*/
		modal: function(params) {
			var $header = $('<div class="modal-header" />');
			var $body = $('<div class="modal-body" />');
			var $footer = $('<div class="modal-footer" />');

			var $modal = $('<div class="modal fade" />').append(
				$('<div class="modal-dialog" />').append(
					$('<div class="modal-content" />').append($header, $body, $footer)
				)
			);

			// Add close button
			if (params.useClose) {
				$header.append(
					$('<button type="button" class="close" data-dismiss="modal" aria-hidden="true" />').addHtml('&times;')
				);
			}

			// Add the title
			if (params.title) {
				$header.append(
					$('<h4 class="modal-title" />').addHtml(params.title)
				);
			}

			// Add the content
			if (params.content) {
				$body.append(content);
			}

			// Function that will remove the modal
			function close() {
				$modal.modal('hide');
				$modal.remove();
			}

			// Add the buttons
			if (params.buttons) {
				for (var i = 0, len = params.buttons.length; i < len; i++) {
					if (params.buttons[i]) {
						var $button = $('<button />').addText(params.buttons[i].label);

						// Add click handler
						$button.on('click', function(e) {
							if (params.buttons[i].handler) {
								params.buttons[i].handler(e, close, $body[0]);
							}
							else {
								close();
							}
						});

						$footer.append($button);
					}
				}
			}

			// Show the modal
			$modal.modal({
				backdrop: true,
				keyboard: true,
				show: true,
				remote: false
			});
		}
	};
});