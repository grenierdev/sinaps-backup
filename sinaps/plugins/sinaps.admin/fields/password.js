var _ = require('lodash');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

	// Password
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'password',
		label: 'Password',
		type: String,
		settings: {
			placeholder: {
				type: 'text',
				label: 'Placeholder',
				value: ''
			}
		},
		getInputTemplate: function () {
			return '<input type="password"\
		id="{{ field.id|default(field.name) }}"\
		class="{{ field.class|default("form-control input-sm") }}"\
		{% if field.name %} name="{{ field.name }}"{% endif %}\
		{% if field.value %} value="{{ field.value }}"{% endif %}\
		{% if field.autofocus %} autofocus{% endif %}\
		{% if field.required %} required{% endif %}\
		{% if field.disabled %} disabled{% endif %}\
		{% if field.readonly %} readonly{% endif %}\
		{% if field.placeholder %} placeholder="{{ field.placeholder }}"{% endif %}\
	/>';
		}
	}));
};
