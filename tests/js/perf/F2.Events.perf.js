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
				Handler = function() {};
			EventRegister.Events.push({
				Name: Name,
				Handler: Handler
			});
			return [Perf.ContainerToken, Name, Handler];
		},
		pop: function() {
			var myPop = EventRegister.Events.pop();
			return [Perf.ContainerToken, myPop.Name];
		},
	}

	testSuite.push(new Perf.Test({
		section: section,
		testname: "emit",
		fxn: F2.emit,
		context: F2.Events,
		params: ["generic_test_event"]
	}));

	testSuite.push(new Perf.Test({
		section: section,
		testname: "emit (filtered)",
		fxn: F2.emit,
		context: F2.Events,
		params: ["performance_test_event", null, ["com_test_*"]]
	}));

	testSuite.push(new Perf.Test({
		section: section,
		testname: "on",
		fxn: F2.on,
		context: F2.Events,
		params: new Perf.Factory(EventRegister.on, EventRegister)
	}));

	testSuite.push(new Perf.Test({
		section: section,
		testname: "off",
		fxn: F2.off,
		numTimes: EventRegister.length,
		context: F2.Events,
		params: new Perf.Factory(EventRegister.pop, EventRegister)
	}));

	

	var _run = function() {
		var index = arguments[0] || 0;
		var nextIndex = index + 1;
		if(index >= testSuite.length) { return; }
		setTimeout(testSuite[index].run.bind(testSuite[index]), 0, _run, nextIndex);
	}

	var run = function() {
		document.getElementsByClassName("container-fluid")[0].appendChild(panel);
		_run(0);
	}

	return {
		run: run
	};
})
