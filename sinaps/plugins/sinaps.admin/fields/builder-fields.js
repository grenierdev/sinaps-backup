var _ = require('lodash');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

	// Layout builder
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'builder-fields',
		label: 'Fields builder',
		type: Object,
		settings: {},
		getInputTemplate: function () {
			return '<input type="hidden" role="builder-fields"\
				id="{{ field.id|default(field.name) }}"\
				{% if field.name %} name="{{ field.name }}"{% endif %}\
				{% if field.value %} value="{{ field.value|json|escape }}"{% endif %}\
			/>';
		}
	}));

}
