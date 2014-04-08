define(['F2', 'PerfHelpers'], function(F2, Perf) {
	var testSuite = [];
	var finishedLoading = false;
	var Generator = new Perf.PanelGenerator("F2.Events"),
		panel = Generator.GeneratePanel(),
		section = Generator.GenerateSection();

	var myAppConfig = {
				appId: "com_test_performance",
				manifestUrl: '/apps/single'
			};
	var EventRegister = { 
		Events: [],
		length: function() { 
			return EventRegister.Events.length; 
		},
		on: function() { 
			var Name = F2.guid(),	
				Handler = function() { };
				EventRegister.Events.push({Name: Name, Handler: Handler}); 
			return [Perf.ContainerToken, Name, Handler];
		},
		many: function() { 
			var Name = F2.guid(),
				Handler = function() {};
				EventRegister.Events.push({Name: Name, Handler: Handler}); 
			return [Perf.ContainerToken, Name, 1e4, Handler];
		},
		pop: function() {
			var myPop = EventRegister.Events.pop();
			return [Perf.ContainerToken, myPop.Name];
		},
	}

	testSuite.push(new Perf.Test({
		section: section,
		testname: "emit",
		fxn: F2.Events.emit,
		context: F2.Events,
		params: ["generic_test_event", {}]
	}));

	testSuite.push(new Perf.Test({
		section: section,
		testname: "emitTo",
		fxn: F2.Events.emitTo,
		context: F2.Events,
		params: ["com_test_*", "performance_test_event"]
	}));
	
	testSuite.push(new Perf.Test({
		section: section,
		testname: "many",
		fxn: F2.Events.many,
		context: F2.Events,
		params: new Perf.Factory(EventRegister.many, EventRegister)
	}));

	testSuite.push(new Perf.Test({
		section: section,
		testname: "on",
		fxn: F2.Events.on,
		context: F2.Events,
		params: new Perf.Factory(EventRegister.on, EventRegister)
	}));

	testSuite.push(new Perf.Test({
		section: section,
		testname: "once",
		fxn: F2.Events.once,
		context: F2.Events,
		params: new Perf.Factory(EventRegister.on, EventRegister)
	}));

	testSuite.push(new Perf.Test({
		section: section,
		testname: "off",
		fxn: F2.Events.off,
		numTimes: EventRegister.length,
		context: F2.Events,
		params: new Perf.Factory(EventRegister.pop, EventRegister)
	}));

	var run = function( ) {
		var _i, _length;
		document.getElementsByClassName("container-fluid")[0].appendChild(panel);

		for(_i = 0, _length = testSuite.length; _i < _length; ++_i) {
			setTimeout(testSuite[_i].run.bind(testSuite[_i]), 100);
		}
	}

	return {
		run: run
	};
})