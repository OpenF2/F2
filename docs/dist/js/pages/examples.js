define(['jquery', 'F2', 'mousetrap', 'highlightjs'], function($, F2, Mousetrap, hljs) {
	var examples = function(){

	};

	examples.prototype.initialize = function() {
		//this.initExampleF2Apps();
		this.initContainerEvents();
		this.highlightCode();

		//highlight all Apps
		Mousetrap.bind('a', function() {
			$('div.f2-app-container').toggleClass('f2-mode-highlighted');
		});

		//highlight Container
		Mousetrap.bind('c', function() {
			$('div.examples-container').toggleClass('f2-mode-highlighted');
		});
	};

	examples.prototype.initContainerEvents = function() {
		//listen for app symbol change events and re-broadcast
		F2.Events.on(F2.Constants.Events.APP_SYMBOL_CHANGE,function(data) {
			F2.Events.emit(F2.Constants.Events.CONTAINER_SYMBOL_CHANGE, { symbol: data.symbol, name: data.name || '' });
		});
	};

	examples.prototype.highlightCode = function() {

		$('pre code','#registry').each(function(i, el) {
			try {
				hljs.highlightBlock(el);
			}catch(e){}
		});
	};

	return new examples();
});