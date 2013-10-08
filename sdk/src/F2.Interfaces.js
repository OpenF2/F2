define('F2.Interfaces', [], function() {

	var schemas = {
		AppManifest: {
			title: 'App Manifest',
			type: 'object',
			properties: {
				scripts: {
					type: 'array'
				},
				styles: {
					type: 'array'
				},
				inlineScripts: {
					type: 'array'
				},
				apps: {
					type: 'array',
					items: {
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
					}
				}
			},
			required: ['scripts', 'styles', 'inlineScripts', 'apps']
		},
		ContainerConfig: {
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
				scriptErrorTimeout: {
					type: 'integer',
					minimum: 0,
					'default': 7000
				},
				supportedViews: {
					type: 'array'
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
						}
					}
				}
			}
		}
	};

	return {
		validate: function(json, nameOrSchema) {
			if (!nameOrSchema) {
				throw 'F2.Interfaces: you must provide a schema or schema name.';
			}

			// Grab the actual schema if they passed in a string
			if (schemas[nameOrSchema]) {
				nameOrSchema = schemas[nameOrSchema];
			}

			return tv4.validate(json, nameOrSchema);
		},
		add: function(name, schema) {
			if (!name) {
				throw 'F2.Interfaces: you must provide a schema name.';
			}

			if (!schema) {
				throw 'F2.Interfaces: you must provide a schema.';
			}

			if (schema[name]) {
				throw 'F2.Interfaces: ' + name + ' is already a registered schema.';
			}

			schemas[name] = schema;
		},
		schemas: schemas
	};

});