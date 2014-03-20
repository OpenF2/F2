Lib.Schemas = function(tv4) {

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

};
