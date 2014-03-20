Helpers.Guid = function() {

	// Track all the guids we've made on this page
	var _guids = {};

	/**
	 * Generates an RFC4122 v4 compliant id
	 * @method guid
	 * @return {string} A random id
	 * @for F2
	 * Derived from: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript#answer-2117523
	 */
	return function _guid() {
		var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0;
			var v = c === 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});

		// Check if we've seen this one before
		if (_guids[guid]) {
			// Get a new guid
			guid = _guid();
		}

		_guids[guid] = true;

		return guid;
	};

};
