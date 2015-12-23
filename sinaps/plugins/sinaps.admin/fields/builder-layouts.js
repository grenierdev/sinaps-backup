var _ = require('lodash');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

	// Layout builder
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'builder-layouts',
		label: 'Layouts builder',
		type: Object,
		settings: {},
		getInputTemplate: function () {
			return '<input type="hidden" role="builder-layouts"\
				id="{{ field.id|default(field.name) }}"\
				{% if field.name %} name="{{ field.name }}"{% endif %}\
				{% if field.value %} value="{{ field.value|json|escape }}"{% endif %}\
				{% if field.label %} title="{{ field.label }}"{% endif %}\
			/>';
		},
		getFieldTemplate: function (field) {
			return '<div class="form-group">\
				'+ this.getInputTemplate(field) +'\
				{% if field.instructions %}<small class="text-muted">{{ field.instructions }}</small>{% endif %}\
				{% if field.success %}<small class="text-success">{{ field.success }}</small>{% endif %}\
				{% if field.info %}<small class="text-info">{{ field.info }}</small>{% endif %}\
				{% if field.warning %}<small class="text-warning">{{ field.warning }}</small>{% endif %}\
				{% if field.error %}<small class="text-error">{{ field.error }}</small>{% endif %}\
			</div>';
		},
		getIncludedResources: function () {
			return [{
				type: 'script',
				src: '/admin/resources/js/plugins/builder/builder.js'
			}, {
				type: 'css',
				src: '/admin/resources/js/plugins/builder/builder.css'
			}];
		}
	}));

}
