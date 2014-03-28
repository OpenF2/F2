(function(_) {

	function loadInlineScripts(inlines, callback) {
		if (inlines.length) {
			try {
				eval(inlines.join(';'));
			}
			catch (e) {
				console.error('Error loading inline scripts: ' + e);
			}
		}

		callback();
	}

	function loadScripts(config, paths, callback) {
		// Check for user defined loader
		if (_.isFunction(config.loadScripts)) {
			config.loadScripts(paths, callback);
		}
		else {
			require(paths, function() {
				callback();
			});
		}
	}

	function loadStyles(config, paths, callback) {
		// Check for user defined loader
		if (_.isFunction(config.loadStyles)) {
			config.loadStyles(paths, callback);
		}
		else {
			var head = document.getElementsByTagName('head')[0];

			for (var i = 0, len = paths.length; i < len; i++) {
				var node = document.createNode('link');
				node.rel = 'stylesheet';
				node.href = paths[i];
				node.async = false;
				head.appendChild(node);
			}

			callback();
		}
	}

	// ---------------------------------------------------------------------------
	// API
	// ---------------------------------------------------------------------------

	Helpers.LoadStaticFiles = {
		load: function(containerConfig, styles, scripts, inlineScripts, callback) {
			var stylesDone = false;
			var scriptsDone = false;

			// See if both scripts and styles have completed
			function checkComplete() {
				if (stylesDone && scriptsDone) {
					callback();
				}
			}

			// Kick off styles
			loadStyles(containerConfig, styles, function() {
				stylesDone = true;
				checkComplete();
			});

			// Kick off scripts
			loadScripts(containerConfig, scripts, function() {
				loadInlineScripts(inlineScripts, function() {
					scriptsDone = true;
					checkComplete();
				});
			});
		}
	};

})(Helpers._);
