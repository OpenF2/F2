define('F2.Schemas', [], function() {

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
				type: 'array',
				items: {
					type: 'string'
				}
			}
		},
		required: ['appId']
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
			ui: {
				type: 'object',
				properties: {
					modal: {
						// type: 'object'
					},
					hideLoading: {
						// type: 'object'
					},
					showLoading: {
						// type: 'object'
					}
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

	tv4.addSchema('uiModalParams', {
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
							type: 'object'
						}
					},
					required: ['label', 'handler']
				}
			},
			content: {
				type: 'string'
			},
			onClose: {
				type: 'object'
			},
			title: {
				type: 'string'
			}
		}
	});

	return {
		add: function(name, schema) {
			if (!name) {
				throw 'F2.Schemas: you must provide a schema name.';
			}

			if (!schema) {
				throw 'F2.Schemas: you must provide a schema.';
			}

			if (tv4.getSchema(name)) {
				throw 'F2.Schemas: ' + name + ' is already a registered schema.';
			}

			tv4.addSchema(name, schema);

			return true;
		},
		isDefined: function(name) {
			return !!tv4.getSchemaMap()[name];
		},
		validate: function(json, name) {
			if (!name) {
				throw 'F2.Schemas: you must provide a schema name.';
			}

			var schema = tv4.getSchema(name);

			if (!schema) {
				throw 'F2.Schemas: unrecognized schema name.';
			}

			return tv4.validate(json, schema);
		}
	};

});