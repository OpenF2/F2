Lib.SchemaModels = function(Schemas) {

	var schemas = {
		'appConfig': {
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
		'appContent': {
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
		},
		'appManifest': {
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
		},
		'containerConfig': {
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
		},
		'uiModalParams': {
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
		}
	};

	// Add each schema
	for (var name in schemas) {
		Schemas.add(name, schemas[name]);
	}

};
