define(['F2', 'PerfHelpers'], function(F2, Perf) {
	var testSuite = [];
	var section = document.createElement("DIV");
		section.innerHTML = "<H1>F2</H1>";
	
	document.getElementsByTagName("body")[0].appendChild(section);

	testSuite.push(new Perf.Test({
		section: section,
		testname: "hasSchema (default Schemas)",
		numTimes: 1e4,
		fxn: F2.hasSchema,
		context: F2,
		params: [new Perf.Factory(F2.guid, F2)]
	}));

	testSuite.push(new Perf.Test({
		section: section,
		testname: "addSchema (1e3)", 
		numTimes: 100,
		fxn: F2.addSchema,
		context: F2,
		params: [new Perf.Factory(F2.guid, F2), {}]
	}));

	testSuite.push(new Perf.Test({
		section: section,
		testname: "hasSchema (default + 100 schemas)",
		numTimes: 1e4,
		fxn: F2.hasSchema,
		context: F2,
		params: [new Perf.Factory(F2.guid, F2)]
	}));

	testSuite.push(new Perf.Test({
		section: section,
		testname: "addSchema (1e4)", 
		numTimes: 1e4,
		fxn: F2.addSchema,
		context: F2,
		params: [new Perf.Factory(F2.guid, F2), {}]
	}));

	testSuite.push(new Perf.Test({
		section: section,
		testname: "hasSchema (default + 1100 schemas)",
		numTimes: 1e4,
		fxn: F2.hasSchema,
		context: F2,
		params: [new Perf.Factory(F2.guid, F2)]
	}));
	testSuite.push(new Perf.Test({
		section: section,
		testname: "config", 
		fxn: F2.config,
		context: F2.new(),
		params: [{}]
	}));

	testSuite.push(new Perf.Test({
		section: section,
		testname: "guid", 
		fxn: F2.config,
		context: F2.new(),
		params: []
	}));

	var myAppConfig = {
				appId: "com_test_performance",
				manifestUrl: '/apps/single'
			};
	testSuite.push(new Perf.Test({
		section: section,
		testname: "load (1 app)", 
		fxn: F2.load,
		context: F2,
		numTimes: 10,
		params: [
			[myAppConfig],
			Perf.Feeder.queue
		]
	}));
	Perf.Feeder.add(1, 10);

	var simpleApplier = function(Node, NumSiblings) { 
		if(Math.random() * NumSiblings < .5) {
			Node.className = "app";
			Node.setAttribute("data-f2-appid", "com_test_performance");
			Node.setAttribute("data-f2-manifesturl", "/apps/single");
		}
		else {
			Node.setAttribute("bogusAttribute", "toFoolYou");
		}
	}
	// NumChildren, Depth
	var smallTree = Perf.Tree(3, 3, simpleApplier);
	var smallNodes = smallTree.getElementsByTagName("DIV").length;
	var smallApps = smallTree.getElementsByClassName("app").length;
	var mediumTree = Perf.Tree(4, 4, simpleApplier);
	var mediumNodes = mediumTree.getElementsByTagName("DIV").length;
	var mediumApps = mediumTree.getElementsByClassName("app").length;
	var largeTree = Perf.Tree(5, 5, simpleApplier);
	var largeNodes = largeTree.getElementsByTagName("DIV").length;
	var largeApps = largeTree.getElementsByClassName("app").length;

	testSuite.push(new Perf.Test({
		section: section,
		testname: "loadPlaceholders ("+smallNodes+" nodes: "+smallApps+" apps)",
		fxn: F2.loadPlaceholders,
		context: F2,
		numTimes: 10,
		params: [smallTree, Perf.Feeder.queue],
	}));
	Perf.Feeder.add(smallApps, 10);
	
	testSuite.push(new Perf.Test({
		section: section,
		testname: "loadPlaceholders ("+mediumNodes+" nodes: "+mediumApps+" apps)",
		fxn: F2.loadPlaceholders,
		context: F2,
		numTimes: 10,
		params: [mediumTree, Perf.Feeder.queue],
	}));
	Perf.Feeder.add(mediumApps, 10);

	testSuite.push(new Perf.Test({
		section: section,
		testname: "loadPlaceholders ("+largeNodes+" nodes: "+largeApps+" apps)",
		fxn: F2.loadPlaceholders,
		context: F2,
		numTimes: 10,
		params: [largeTree, Perf.Feeder.queue],
	}));
	Perf.Feeder.add(largeApps, 10);

	testSuite.push(new Perf.Test({
		section: section,
		testname: "new",
		fxn: F2.new,
		context: F2
	}));
/*
	testSuite.push(new Perf.Test({
		testname: "onetimeToken",
		fxn: F2.onetimeToken,
		context: new Perf.Factory(F2.new, F2)
	}));
*/	
	//var throwaway = function() {}
	testSuite.push(new Perf.Test({
		section: section,
		testname: "remove",
		fxn: F2.remove, //throwaway,
		deferUntilTrue: function() { 
			return (Perf.Feeder.requests <= 0); 
		},
		numTimes: Perf.Feeder.length,
		context: F2,
		params: new Perf.Factory( Perf.Feeder.pop, Perf.Feeder )
	}));

	testSuite.push(new Perf.Test({
		section: section,
		testname: "validate valid appConfig",
		fxn: F2.validate,
		context: F2,
		params: [myAppConfig, "appConfig"]
	}))
	
	var run = function( ) {
		var _i, _length;
		
		document.getElementsByTagName("body")[0].appendChild(section);

		for(_i = 0, _length = testSuite.length; _i < _length; ++_i) {
			setTimeout(testSuite[_i].run.bind(testSuite[_i]), 100);
		}
	}

	return {
		run: run
	};
})