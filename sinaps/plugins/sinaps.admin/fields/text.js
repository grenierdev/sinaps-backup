var _ = require('lodash');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

	// Text
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'text',
		label: 'Text',
		type: String,
		settings: {
			multiline: {
				type: 'checkbox',
				label: 'Allow multiline'
			},
			size: {
				type: 'number',
				label: 'Size',
				decimal: 0
			},
			maxlength: {
				type: 'number',
				label: 'Maximum length',
				decimal: 0
			},
			placeholder: {
				type: 'text',
				label: 'Placeholder',
				value: ''
			}
		},
		getInputTemplate: function () {
			return '{% if field.multiline %}\
	<textarea\
		id="{{ field.id|default(field.name) }}"\
		class="{{ field.class|default("form-control") }}"\
		{% if field.name %} name="{{ field.name }}"{% endif %}\
		{% if field.rows %} rows="{{ field.rows }}"{% endif %}\
		{% if field.autofocus %} autofocus{% endif %}\
		{% if field.required %} required{% endif %}\
		{% if field.disabled %} disabled{% endif %}\
		{% if field.readonly %} readonly{% endif %}\
		{% if field.placeholder %} placeholder="{{ field.placeholder }}"{% endif %}\
	>{{ field.value }}</textarea>\
{% else %}\
	<input type="text"\
		id="{{ field.id|default(field.name) }}"\
		class="{{ field.class|default("form-control") }}"\
		{% if field.name %} name="{{ field.name }}"{% endif %}\
		{% if field.value %} value="{{ field.value }}"{% endif %}\
		{% if field.size %} size="{{ field.size }}"{% endif %}\
		{% if field.maxlength %} maxlength="{{ field.maxlength }}"{% endif %}\
		{% if field.autofocus %} autofocus{% endif %}\
		{% if field.required %} required{% endif %}\
		{% if field.disabled %} disabled{% endif %}\
		{% if field.readonly %} readonly{% endif %}\
		{% if field.placeholder %} placeholder="{{ field.placeholder }}"{% endif %}\
	/>\
{% endif %}';
		}
	}));
};
