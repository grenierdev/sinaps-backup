var _ = require('lodash');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

	// Checkbox
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'checkbox',
		label: 'Checkbox',
		type: Boolean,
		settings: {
			default: {
				type: 'checkbox',
				label: 'Default',
				value: false
			}
		},
		getInputTemplate: function () {
			return '<div class="md-checkbox inline" style="border: 0">\
	<input type="checkbox"\
			class="md-check"\
			id="{{ field.id|default(field.name) }}"\
			{% if field.name %} name="{{ field.name }}"{% endif %}\
			{% if field.required %} required{% endif %}\
			{% if field.disabled %} disabled{% endif %}\
			{% if field.readonly %} readonly{% endif %}\
			{% if field.checked or field.value %} checked{% endif %}\
	/>\
	<label for="{{ field.id|default(field.name) }}">\
		<span></span>\
		<span class="check"></span>\
		<span class="box"></span>\
	</label>\
</div>';
		},

		getFieldTemplate: function () {
			return '<div class="form-group form-sm-line-input">\
	'+ this.getInputTemplate() +'\
	<label for="{{ field.id|default(field.name) }}">{{ field.label }}</label>\
	{% if field.instructions %}<span class="help-block">{{ field.instructions }}</span>{% endif %}\
</div>';
		}
	}));
};
