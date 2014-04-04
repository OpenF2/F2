define('PerfHelpers', [], function() {
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
				if(Params[_p] instanceof _factory) {
					_params.push(Params[_p].create())
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
		this.Action = arguments[0];
		this.Context = arguments[1];
		this.Params = 2 <= arguments.length ? [].slice.call(arguments, 1) : [];
	}

	_factory.prototype.create = function() {
		return this.Action.apply(this.Context, this.Params);
	}

	var _test = function(config)
	{
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
		this.timeout = null;
		this.root.appendChild(this.Title);
		this.root.appendChild(this.resultNode);
		document.getElementsByTagName("body")[0].appendChild(this.root);
	}

	_test.prototype.run = function() {
		self = this;
		if(self.timeout) {
			clearTimeout(self.timeout);
		}
		if( !self.deferUntilTrue() ) {
			//console.info("Deferring ", this.testname);
			self.timeout = setTimeout(function() {self.run.apply(self); }, 2000);
		}
		else {
			//console.info("Applying ", this.testname);
			self.timeout = setTimeout(this._run.apply(this));
		}
	}

	_test.prototype._run = function() {
		this.resultTime = _runXTimes.apply(this, this.params);
		this.ran = true;
		this.resultNode.innerHTML = this.resultTime + "ms";
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
			return _feeder.instanceIDs.pop();
		},
		length: function() {
			if (!_feeder.instanceIDs) return 0;
			return _feeder.instanceIDs.length;
		}
	}

	return {
		runXTimes: _runXTimes,
		Factory: _factory,
		Test: _test,
		Tree: _tree,
		Feeder: _feeder
	};
})