	(function(F2, Helpers) {
		setTimeout(function() {
			var placeholders = Helpers.AppPlaceholders.getInNode(document.body);

			if (placeholders && placeholders.length) {
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
		}, 0);

	})(F2, Helpers);

	!function(name, context, definition) {
		if (typeof module != 'undefined' && module.exports) {
			module.exports = definition();
		}
		else if (typeof define == 'function' && define.amd) {
			define(definition);
		}
		else {
			context[name] = definition();
		}
	}('F2', this, function() {
		return F2;
	})

})();