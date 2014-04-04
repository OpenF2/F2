define(['F2', 'PerfHelpers'], function(F2, Perf) {
	var testSuite = [];

	console.info(F2);

	testSuite.push(new Perf.Test({
		testname: "hasSchema (default Schemas)",
		numTimes: 1e4,
		fxn: F2.hasSchema,
		context: F2,
		params: [new Perf.Factory(F2.guid, F2)]
	}));

	testSuite.push(new Perf.Test({
		testname: "addSchema (1e3)", 
		numTimes: 100,
		fxn: F2.addSchema,
		context: F2,
		params: [new Perf.Factory(F2.guid, F2), {}]
	}));

	testSuite.push(new Perf.Test({
		testname: "hasSchema (default + 100 schemas)",
		numTimes: 1e4,
		fxn: F2.hasSchema,
		context: F2,
		params: [new Perf.Factory(F2.guid, F2)]
	}));

	testSuite.push(new Perf.Test({
		testname: "addSchema (1e4)", 
		numTimes: 1e4,
		fxn: F2.addSchema,
		context: F2,
		params: [new Perf.Factory(F2.guid, F2), {}]
	}));

	testSuite.push(new Perf.Test({
		testname: "hasSchema (default + 1100 schemas)",
		numTimes: 1e4,
		fxn: F2.hasSchema,
		context: F2.new(),
		params: [new Perf.Factory(F2.guid, F2)]
	}));
	testSuite.push(new Perf.Test({
		testname: "config", 
		fxn: F2.config,
		context: F2.new(),
		params: [{}]
	}));

	testSuite.push(new Perf.Test({
		testname: "guid", 
		fxn: F2.config,
		context: F2.new(),
		params: []
	}));
	
	testSuite.push(new Perf.Test({
		testname: "hasSchema",
		numTimes: 1e4,
		fxn: F2.hasSchema,
		context: F2.new(),
		params: [new Perf.Factory(F2.guid, F2)]
	}));

	var RemoveDuplicates = function() {
		var _i, _length;
		if( !window.test || !window.test.com_test_duplicate ) { return; }
		for(_i = 0, _length = window.test.com_test_duplicate.length; _i < _length; ++_i ) {
			if(!window.test.com_test_duplicate) { continue; }
			LoadContext.remove(window.test.com_test_duplicate[_i].instanceId);
		}
	}

	var LoadContext = F2.new();
	testSuite.push(new Perf.Test({
		testname: "load (1 app)", 
		fxn: F2.load,
		context: LoadContext,
		numTimes: 10,
		params: [{
			appConfigs: [{
				appId: "com_test_duplicate",
				manifestUrl: '/apps/single'
			}],
			complete: RemoveDuplicates
		}]
	}));	
	var simpleApplier = function(Node, NumSiblings) { 
		if(Math.random() * NumSiblings < .5) {
			Node.className = "app";
			Node.setAttribute("data-f2-appid", "com_test_duplicate");
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
	
	var smallContext = F2.new();
	testSuite.push(new Perf.Test({
		testname: "loadPlaceholders ("+smallNodes+" nodes: "+smallApps+" apps)",
		fxn: F2.loadPlaceholders,
		context: smallContext,
		numTimes: 10,
		params: [smallTree, RemoveDuplicates],
	}));

	var mediumContext = F2.new();
	testSuite.push(new Perf.Test({
		testname: "loadPlaceholders ("+mediumNodes+" nodes: "+mediumApps+" apps)",
		fxn: F2.loadPlaceholders,
		context: mediumContext,
		numTimes: 10,
		params: [mediumTree, RemoveDuplicates],
	}));

	var largeContext = F2.new();
	testSuite.push(new Perf.Test({
		testname: "loadPlaceholders ("+largeNodes+" nodes: "+largeApps+" apps)",
		fxn: F2.loadPlaceholders,
		context: largeContext,
		numTimes: 10,
		params: [largeTree, RemoveDuplicates],
	}));

	var run = function( ) {
		var _i, _length;
		for(_i = 0, _length = testSuite.length; _i < _length; ++_i) {
			testSuite[_i].run();
		}
	}

	return {
		run: run
	};
})