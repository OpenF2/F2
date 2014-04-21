/**
 * Schema validations
 * @class F2.Schemas
 */
(function(tv4, _) {
	'use strict';

	var ERRORS = {
		BAD_NAME: function() {
			return 'F2.Schemas: you must provide a string schema name.';
		},
		BAD_JSON: function() {
			return 'F2.Schemas: you must provide a schema.';
		},
		DUPE_SCHEMA: function(name) {
			return 'F2.Schemas: "' + name + '" is already a registered schema.';
		},
		NO_SCHEMA: function(name) {
			return 'F2.Schemas: "' + name + '" is not a registered schema.';
		}
	};

	var _prototype_addSchema = function(name, json) {
		if (!_.isString(name)) {
			throw ERRORS.BAD_NAME();
		}

		if (Helpers.hasSchema(name)) {
			throw ERRORS.DUPE_SCHEMA(name);
		}

		if (!_.isObject(json)) {
			throw ERRORS.BAD_JSON();
		}

		tv4.addSchema(name, json);

		return true;
	};

	Object.defineProperty(F2.prototype, 'addSchema', {
		value : _prototype_addSchema,
		writable : false,
		configurable : false
	});


	Helpers.hasSchema = function(name) {
		if (!_.isString(name)) {
			throw ERRORS.BAD_NAME();
		}

		return !!tv4.getSchema(name);
	};

	Object.defineProperty(F2.prototype, 'hasSchema', {
		value : Helpers.hasSchema,
		writable : false,
		configurable : false
	});

	Helpers.validate = function(json, name) {
		if (!_.isString(name)) {
			throw ERRORS.BAD_NAME();
		}

		if (!Helpers.hasSchema(name)) {
			throw ERRORS.NO_SCHEMA(name);
		}

		if (!_.isObject(json)) {
			throw ERRORS.BAD_JSON();
		}

		var schema = tv4.getSchema(name);

		return tv4.validate(json, schema);
	};

	Object.defineProperty(F2.prototype, 'validate', {
		value : Helpers.validate,
		writable : false,
		configurable : false
	});

	// Hard code some predefined schemas
	var librarySchemas = {
		appConfig: {
			id: 'appConfig',
			title: 'App Config',
			type: 'object',
			properties: {
				appId: {
					type: 'string'
				},
				context: {
					type: 'object'
				},
				manifestUrl: {
					type: 'string'
				},
				enableBatchRequests: {
					type: 'boolean'
				},
				views: {
					type: 'array',
					items: {
						type: 'string'
					}
				}
			},
			required: ['appId']
		},
		appManifest: {
			id: 'appManifest',
			title: 'App Manifest',
			type: 'object',
			properties: {
				scripts: {
					type: 'array',
					items: {
						type: 'string'
					}
				},
				styles: {
					type: 'array',
					items: {
						type: 'string'
					}
				},
				inlineScripts: {
					type: 'array',
					items: {
						type: 'string'
					}
				},
				error: {
					type: 'object'
				},
				data: {
					type: 'object'
				},
				html: {
					type: 'string'
				}
			},
			required: ['scripts', 'styles', 'inlineScripts']
		},
		uiModalParams: {
			id: 'uiModalParams',
			title: 'F2.UI Modal Parameters',
			type: 'object',
			properties: {
				buttons: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							label: {
								type: 'string'
							},
							handler: {
								type: 'function'
							}
						},
						required: ['label', 'handler']
					}
				},
				content: {
					type: 'string'
				},
				onClose: {
					type: 'function'
				},
				title: {
					type: 'string'
				}
			}
		}
	};

	// Add each schema
	for (var name in librarySchemas) {
		tv4.addSchema(name, librarySchemas[name]);
	}

})(tv4, Helpers._);
