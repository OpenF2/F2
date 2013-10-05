define("F2.Interfaces", [], function() {

	// --------------------------------------------------------------------------
	// Helpers
	// --------------------------------------------------------------------------

	function passedRequiredCheck(spec, value) {
		return (!spec.required || value);
	}

	function passedTypeCheck(spec, value) {
		var passed = false;

		if (spec.type) {
			// Treat all type properties as arrays
			if (!_.isArray(spec.type)) {
				spec.type = [spec.type];
			}

			// Check the value against each type
			for (var i = 0, len = spec.type.length; i < len; i++) {
				if (spec.type[i].fn(value)) {
					passed = true;
					break;
				}
			}
		}
		else {
			passed = true;
		}

		return passed;
	}

	function passedChildCheck(spec, value, errors) {
		var childSpec = spec;

		// Go down the rabbit hole until we hit the bottom
		while (childSpec = childSpec.children) {
			var list = (_.isArray(value)) ? value : _.keys(value);

			// Make sure there are children if we need some
			if (childSpec.required && !list.length) {
				return false;
			}
			else {
				for (var i = 0, len = list.length; i < len; i++) {
					if (!initAllChecks(childSpec, list[i], errors)) {
						return false;
					}
				}
			}
		}

		return true;
	}

	function passesAllChecks(spec, value, errors) {
		var passed = true;

		// Check required
		if (!passedRequiredCheck(spec, value)) {
			passed = false;
			errors.push("required");
		}
		else {
			// Check types
			if (!passedTypeCheck(spec, value)) {
				passed = false;
				errors.push("types");
			}

			if (!passedChildCheck(spec, value, errors)) {
				passed = false;
				errors.push("children");
			}
		}

		return passed;
	}

	function initAllChecks(spec, value, errors) {
		var passed = true;

		if (spec.properties) {
			// Check all the value's properties
			for (var prop in spec.properties) {
				if (!passesAllChecks(spec.properties[prop], value[prop], errors)) {
					passed = false;
					break;
				}
			}
		}
		else {
			// Value has no properties
			passed = passesAllChecks(spec, value, errors);
		}

		return passed;
	}

	function conformsToSpec(name, spec, value, throwExceptions) {
		var errors = [];

		if (!initAllChecks(spec, value, errors)) {
			var errorString = errors.join("\n");

			if (throwExceptions) {
				throw errorString;
			}
			else {
				console.error(errorString);
			}
		}

		return !errors.length;
	}

	// --------------------------------------------------------------------------
	// Implementation
	// --------------------------------------------------------------------------

	var interfaces = {};

	interfaces.TYPES = {
		STRING: {
			name: "string",
			fn: _.isString
		},
		NUMBER: {
			name: "number",
			fn: _.isNumber
		},
		OBJECT: {
			name: "object",
			fn: _.isObject
		},
		FUNCTION: {
			name: "function",
			fn: _.isFunction
		},
		ARRAY: {
			name: "array",
			fn: _.isArray
		},
		DATE: {
			name: "date",
			fn: _.isDate
		}
	};

	interfaces.AppManifest = {
		properties: {
			scripts: {
				required: false,
				type: interfaces.TYPES.ARRAY,
				children: {
					required: false,
					type: interfaces.TYPES.STRING
				}
			},
			styles: {
				required: false,
				type: interfaces.TYPES.ARRAY,
				children: {
					required: false,
					type: interfaces.TYPES.STRING
				}
			},
			inlineScripts: {
				required: false,
				type: interfaces.TYPES.ARRAY,
				children: {
					required: false,
					type: interfaces.TYPES.STRING
				}
			},
			apps: {
				required: false,
				type: interfaces.TYPES.ARRAY,
				children: {
					required: false,
					type: interfaces.TYPES.OBJECT,
					properties: {
						html: {
							required: false,
							type: interfaces.TYPES.STRING
						},
						data: {
							required: false,
							type: interfaces.TYPES.OBJECT
						}
					}
				}
			}
		},
		isValid: function(obj, throwExceptions) {
			return conformsToSpec("AppManifest", interfaces.AppManifest, obj, throwExceptions);
		}
	};

	return interfaces;

});