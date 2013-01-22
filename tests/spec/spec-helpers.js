beforeEach(function() {

	console.log('beforeEach:', this.description);

	this.addMatchers({

		toLog: function(expectedMessage) {

			// copy F2.log before overriding
			var log = F2.log;
			var result = false;
			var suite = this;
			var passedMessage;
			
			F2.log = function(message) {
				passedMessage = message;
			};

			// fire the test function which should call the F2.log override above
			suite.actual();

			result = passedMessage == expectedMessage;

			if (!result) {
				suite.message = function() {
					if (!passedMessage) {
						return 'Expected function ' + (suite.isNot ? 'not' : '') + 'to pass \'' + expectedMessage + '\' to F2.log, but nothing was passed.';
					} else {
						return 'Expected function ' + (suite.isNot ? 'not' : '') + 'to pass \'' + expectedMessage + '\' to F2.log, but \'' + passedMessage + '\' was passed.';
					}
				};
			}

			// return F2.log to its original state
			F2.log = log;

			return result;
		}

	});
});