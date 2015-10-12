var _ = require('lodash');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

	pluginAdmin.registerFieldType(new FieldType({
		handle: 'selectbox',
		label: 'Selectbox',
		type: String,
		settings: {},

		getInputTemplate: function () {
			return '<select class="form-control {{ field.class }}"\
		id="{{ field.id|default(field.name) }}"\
		{% if field.name %} name="{{ field.name }}"{% endif %}\
		{% if field.required %} required{% endif %}\
		{% if field.disabled %} disabled{% endif %}\
		{% if field.readonly %} readonly{% endif %}\
		{% if field.multiple %} multiple{% endif %}\
>\
	{% for opt in field.options %}\
		<option value="{{ opt.value }}" {% if opt.value == field.value %}selected{% endif %}>{{ opt.label }}</option>\
	{% endfor %}\
</select>';
		}
	}));
};
