/**
 * Schema validations
 * @class F2.Schemas
 */
(function(tv4, _) {

	Library.addSchema = function(name, schema) {
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
	};

	Library.hasSchema = function(name) {
		return !!tv4.getSchemaMap()[name];
	};

	Library.validate = function(json, name) {
		if (!name) {
			throw 'F2.Schemas: you must provide a schema name.';
		}

		var schema = tv4.getSchema(name);

		if (!schema) {
			throw 'F2.Schemas: unrecognized schema name.';
		}

		return tv4.validate(json, schema);
	};

})(tv4, Helpers._);
