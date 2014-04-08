define('PerfHelpers', ['F2'], function(F2) {
	var _oneTimeToken = F2.onetimeToken();
	var _runXTimes = function()
	{
		var NumberOfTimes, ActionToTest, Context, Params, _i, StartDate, _p, _params, _context;
		if( arguments.length < 3 ) {
			throw "Insufficient number of arguments. Expected 3+ got " + arguments.length;
		}
		NumberOfTimes = arguments[0],
		ActionToTest = arguments[1],
		Context = arguments[2],
		Params = 4 <= arguments.length ? [].slice.call(arguments, 3) : [],
		paramsThatAreFactories = [];

		if(typeof NumberOfTimes === "function") {
			NumberOfTimes = NumberOfTimes();
		}
		if(typeof NumberOfTimes !== "number") {
			throw "First Argument expected to be a number";
		}

		if(typeof ActionToTest !== "function") {
			throw "Second Argument expected to be a function"
		}

		StartDate = new Date();
		for(_i = 0; _i < NumberOfTimes; ++_i) {
			_params = [];
			_context = null;

			if(Context instanceof _factory) {
				_context = Context.create();
			}
			else {
				_context = Context;
			}

			for(_p = 0; _p < Params.length; ++_p) {
				if(Params[_p] && Params[_p].hasOwnProperty("ImAFactory")) {
					var value = Params[_p].create();
					if(value.hasOwnProperty("length")) {
						_params = _params.concat(value);
					}
					else {
						_params.push(value);
					}
				}
				else {
					_params.push(Params[_p]);
				}
			}
			ActionToTest.apply(_context, _params);
		}
		return ((new Date()) - StartDate)/NumberOfTimes;
	};

	var _factory = function() {
		var Action, Context, Params;
		this.ImAFactory = true;
		this.Action = arguments[0];
		this.Context = arguments[1];
		this.Params = 2 <= arguments.length ? [].slice.call(arguments, 1) : [];
	}

	_factory.prototype.create = function() {
		return this.Action.apply(this.Context, this.Params);
	}

	var _test = function(config)
	{
		this.section = config.section || document.getElementsByTagName("body")[0];
		this.testname = config.testname;
		this.deferUntilTrue = config.deferUntilTrue || function() { return true; }
		this.testfxn = config.fxn;
		this.numTimes = config.numTimes || 1e4;
		this.context = config.context || this;
		this.params = config.params || [];
		this.params = [this.numTimes, this.testfxn, this.context].concat(this.params);
		this.result = 0;
		this.ran = false;
		this.root = document.createElement("DIV");
		this.Title = document.createElement("SPAN");
		this.Title.innerHTML = this.testname + ": ";
		this.resultNode = document.createElement("SPAN");
		this.resultNode.className = "loading";
		this.resultNode.innerHTML = " ҉";
		this.timeout = null;
		this.root.appendChild(this.Title);
		this.root.appendChild(this.resultNode);
		this.section.appendChild(this.root);
		ProgressBar.newTest();
	}

	_test.prototype.run = function() {
		self = this;
		var callback = arguments[0] || function() {};
		var params = 2 <= arguments.length ? [].slice.call(arguments, 1) : [];

		if(self.timeout) {
			clearTimeout(self.timeout);
		}
		if( !self.deferUntilTrue() ) {
			self.timeout = setTimeout(self.run.bind(self), 2000, callback, params);
		}
		else {
			self.timeout = setTimeout(self._run.bind(self), 0, callback, params);
		}
	}

	_test.prototype._run = function() {

		var callback = arguments[0] || function() {};
		var params = arguments[1] || [];

		this.resultTime = _runXTimes.apply(this, this.params);
		this.ran = true;
		this.resultNode.innerHTML = this.resultTime + "ms";
		this.resultNode.className = "";
		ProgressBar.finishedTest();

		callback.apply(window, params);
	}

	var _tree = function(NumChildren, Depth, ChildrenApplier) {
		var _i, _Depth, Root;
		Root = document.createElement("DIV");
		if( _Depth = --Depth ) {
			for(_i = 0; _i < NumChildren; ++_i) {
				Root.appendChild(_tree(NumChildren, _Depth, ChildrenApplier));
			}
		}
		else {
			ChildrenApplier(Root, NumChildren);
		}
		return Root;
	}

	var _feeder = {
		requests: 0,
		instanceIDs: [],
		queue: function(manifests) {
			var _i, _length;
			_length = manifests.length;
			for(_i = 0; _i < _length; ++_i){
				_feeder.instanceIDs.push(manifests[_i].instanceId);
			}
			_feeder.requests -= _length;
		},
		add: function(numberofApps, numberofTimes) {
			_feeder.requests += (numberofApps * numberofTimes);
		},
		pop: function() {
			var instance = _feeder.instanceIDs.pop();
			return instance;
		},
		length: function() {
			if (!_feeder.instanceIDs) return 0;
			var length = _feeder.instanceIDs.length;
			return length;
		}
	}

	var _PanelGenerator = function(Title) {
		this.panel = document.createElement("DIV");
		this.panel.className = "panel panel-default";
		this.panel.innerHTML = "<div class='panel-heading'><h1 class='panel-title'>" +
							Title + "</h1></div>";
	}

	_PanelGenerator.prototype.GeneratePanel = function() {
		return this.panel;
	}

	_PanelGenerator.prototype.GenerateSection = function() {
		section = document.createElement("DIV");
		section.className = "panel-body";
		this.panel.appendChild(section);
		return section;
	}

	var _progressBar = function() {
		this.numTests = 0;
		this.finishedTests = 0;
		this.bar = document.getElementsByClassName("progress-bar")[0];
		this.text = this.bar.getElementsByTagName("span")[0];
	}

	_progressBar.prototype.newTest = function() {
		++this.numTests;
	}

 	_progressBar.prototype.finishedTest = function() {
 		++this.finishedTests;
 		var percent = parseInt(this.finishedTests / this.numTests * 100);
 		this.bar.style.width = percent + "%";
 		this.text.innerHTML = percent + "% Complete";
 		if( percent === 100) {
 			this.bar.parentNode.style.display = "none";
 		}
 	}

 	var ProgressBar = new _progressBar();

	return {
		runXTimes: _runXTimes,
		Factory: _factory,
		Test: _test,
		Tree: _tree,
		Feeder: _feeder,
		ContainerToken: _oneTimeToken,
		PanelGenerator: _PanelGenerator
	};
})
