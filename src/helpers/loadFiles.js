(function(_) {

	function loadDependencies(config, deps, callback) {
		// Check for user defined loader
		if (_.isFunction(config.loadDependencies)) {
			config.loadDependencies(deps, callback);
		}
		else {
			// Add the paths to the global config
			deps.forEach(function(map) {
				require.config({
					paths: map
				});
			});

			callback();
		}
	}

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

			for (var i = 0; i < paths.length; i++) {
				var node = document.createElement('link');
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
		load: function(containerConfig, styles, scripts, inlineScripts, deps, callback) {
			// Waterfall of doom
			loadStyles(containerConfig, styles, function() {
				loadScripts(containerConfig, scripts, function() {
					loadDependencies(containerConfig, deps, function() {
						loadInlineScripts(inlineScripts, function() {
							callback();
						});
					});
				});
			});
		}
	};

})(Helpers._);
