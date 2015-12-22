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
			return '<div>\
				<div class="checkbox checkbox-inline lightswitch{% if field.disabled %} disabled{% endif %}">\
					<label>\
						<input type="checkbox"\
							id="{{ field.id|default(field.name) }}"\
							{% if field.name %} name="{{ field.name }}"{% endif %}\
							{% if field.required %} required{% endif %}\
							{% if field.readonly %} readonly{% endif %}\
							{% if field.checked or field.value %} checked{% endif %}\
						/>\
						<div class="handle"></div>\
					</label>\
				</div>\
			</div>';
		},

		getValueTemplate: function () {
			return '{% if field.value %}On{% else %}Off{% endif %}';
		}
	}));
};
