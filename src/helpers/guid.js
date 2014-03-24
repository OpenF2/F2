(function() {

	// Track all the guids we've made on this page
	var _guids = {};

	// Reserve this for our "once per page" container token
	var _onetimeGuid;

	Helpers.Guid = {
		guid: function() {
			var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0;
				var v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});

			// Check if we've seen this one before
			if (_guids[guid]) {
				// Get a new guid
				guid = this.guid();
			}

			_guids[guid] = true;

			return guid;
		},
		getOnetimeGuid: function() {
			return _onetimeGuid;
		},
		onetimeGuid: function() {
			// Kill this function
			this.onetimeGuid = function() {
				throw 'F2: onetime token has already been used.';
			};

			_onetimeGuid = this.guid();

			return _onetimeGuid;
		}
	};

})();
