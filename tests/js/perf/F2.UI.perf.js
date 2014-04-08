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