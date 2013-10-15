define('com_example_search', ['F2.BaseAppClass', 'F2.UI'], function(BaseAppClass, UI) {

	function Search(instanceId, appConfig, context, root) {
		this.instanceId = instanceId;
		this.appConfig = appConfig;
		this.context = context;
		this.root = root;

		this.$root = $(root);
		this.$output = this.$root.find('div.search-output');
		this.$resultsList = this.$root.find('ul.search-results');
	}

	// Extend the base class
	Search.prototype = new BaseAppClass;

	Search.prototype.init = function() {
		var self = this;

		this.$root.on('keyup', 'input[type=text]', function(e) {
			self.search(this.value);
		});
	};

	Search.prototype.search = function(term) {
		var self = this;

		if (this.lastQuery) {
			this.lastQuery.abort();
		}

		this.lastQuery = $.getJSON(
			'http://dev.markitondemand.com/Api/Lookup/jsonp?callback=?&input=' + term,
			null,
			function(response) {
				self.outputResults(response);
			}
		);
	};

	Search.prototype.outputResults = function(results) {
		if (results && results.length) {
			var items = [];

			for (var i = 0, len = results.length; i < len; i++) {
				var $item = $('<li />').append(
					$('<span />').text(results[i].Name + '(' + results[i].Symbol + ')')
				);

				items.push($item);
			}

			// Add the list items
			this.$resultsList.empty().append(items);

			// Show the results
			this.$output.show();
		}
		else {
			this.$output.hide();
		}
	};

	return Search;

});