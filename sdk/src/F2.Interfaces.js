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

	function _getValueFromType(type) {
		switch (type) {
			case 'array':
				return [];
			case 'boolean':
				return false;
			case 'integer':
			case 'number':
				return 0;
			case 'object':
				return {};
			case 'string':
				return '';
		}

		return null;
	}

	function _createSchemaInstance(schema) {
		var obj;

		if (schema.properties) {
			obj = {};

			for (var prop in schema.properties) {
				var def = schema.properties[prop];
				var value;

				// Use the default if it's available
				if (typeof def['default'] !== 'undefined' && def['default'] !== 'any') {
					value = def['default'];
				}
				else {
					if (def.type === 'object' && def.properties) {
						// Recurse down into oblivion
						value = _createSchemaInstance(def);
					}
					else if (def.type === 'array' && def.minItems > 0) {
						value = _getValueFromType(def.type);

						// Make a new instance of each required item
						if (def.items) {
							for (var i = 0; i < def.minItems; i++) {
								value.push(_createSchemaInstance(def.items));
							}
						}
						else {
							// Populate the array with undefined
							// TODO: figure out if we want to add undefineds
							value.length = def.minItems;
						}
					}
					else {
						value = _getValueFromType(def.type);
					}
				}

				obj[prop] = value;
			}
		}
		else {
			obj = _getValueFromType(schema.type);
		}

		return obj;
	}

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
		create: function(schema) {
			if (!schema) {
				throw 'F2.Interfaces: you must provide a schema or schema name.';
			}

			// Grab the actual schema if they passed in a string
			if (schemas[schema]) {
				schema = schemas[schema];
			}

			return _createSchemaInstance(schema);
		},
		schemas: schemas
	};

});