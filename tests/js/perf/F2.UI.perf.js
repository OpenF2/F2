define(['F2', 'PerfHelpers'], function(F2, Perf) {
	var testSuite = [];
	var finishedLoading = false;
	var Generator = new Perf.PanelGenerator("F2.UI"),
		panel = Generator.GeneratePanel(),
		section = Generator.GenerateSection();

	F2.config({
		ui: {
			modal: function(params) { },
			toggleLoading: function(root) { }
		}
	})

	var uiModal = {

	}

	testSuite.push(new Perf.Test({
		section: section,
		testname: "modal",
		fxn: F2.UI.modal,
		context: F2.UI,
		params: [uiModal]
	}));

	testSuite.push(new Perf.Test({
		section: section,
		testname: "toggleLoading",
		fxn: F2.UI.toggleLoading,
		context: F2.UI,
		params: [section]
	}));

	document.getElementsByClassName("container-fluid")[0].appendChild(panel);

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