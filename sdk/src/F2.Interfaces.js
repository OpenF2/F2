define('F2.Interfaces', [], function() {

	tv4.addSchema('appConfig', {
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
				type: 'array'
			}
		},
		required: ['appId', 'manifestUrl']
	});

	tv4.addSchema('appContent', {
		id: 'appContent',
		title: 'App Content',
		type: 'object',
		properties: {
			success: {
				type: 'boolean'
			},
			data: {
				type: 'object'
			},
			html: {
				type: 'string'
			}
		},
		required: ['success']
	});

	tv4.addSchema('appManifest', {
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
			apps: {
				type: 'array',
				items: {
					$ref: 'appContent'
				}
			}
		},
		required: ['scripts', 'styles', 'inlineScripts', 'apps']
	});

	tv4.addSchema('containerConfig', {
		id: 'containerConfig',
		title: 'Container Config',
		type: 'object',
		properties: {
			debugMode: {
				type: 'boolean'
			},
			loadScripts: {
				type: 'object'
			},
			loadStyles: {
				type: 'object'
			},
			supportedViews: {
				type: 'array',
				items: {
					type: 'string'
				}
			},
			xhr: {
				type: 'object',
				properties: {
					dataType: {
						type: 'object'
					},
					type: {
						type: 'object'
					},
					url: {
						type: 'object'
					},
					timeout: {
						type: 'integer',
						minimum: 0
					}
				}
			}
		}
	});

	return {
		validate: function(json, name) {
			if (!name) {
				throw 'F2.Interfaces: you must provide a schema name.';
			}

			var schema = tv4.getSchema(name);

			if (!schema) {
				throw 'F2.Interfaces: unrecognized schema name.';
			}

			return tv4.validate(json, schema);
		},
		add: function(name, schema) {
			if (!name) {
				throw 'F2.Interfaces: you must provide a schema name.';
			}

			if (!schema) {
				throw 'F2.Interfaces: you must provide a schema.';
			}

			if (tv4.getSchema(name)) {
				throw 'F2.Interfaces: ' + name + ' is already a registered schema.';
			}

			tv4.addSchema(name, schema);
		},
		getSchemas: function() {
			return tv4.getSchemaMap();
		}
	};

});