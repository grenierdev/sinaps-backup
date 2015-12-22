var _ = require('lodash');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

	pluginAdmin.registerFieldType(new FieldType({
		handle: 'dictionary',
		label: 'Dictionary',
		type: 'array',
		//array: 'object',
		settings: {

		},
		getInputTemplate: function () {
			return '<div class="input-group" role="dictionary">\
	<input type="hidden"\
		id="{{ field.id|default(field.name) }}"\
		{% if field.name %} name="{{ field.name }}"{% endif %}\
		{% if field.value %} value="{{ field.value|json|escape }}"{% endif %}\
	/>\
</div>';
		},

		getValueTemplate: function () {
			return '{{ field.value.length }} {% if field.value.length > 1 %}pairs{% else %}pair{% endif %}';
		},

		getIncludedResources: function () {
			return [{
				type: 'script',
				src: '/admin/resources/js/plugins/dictionary/dictionary.js'
			}, {
				type: 'css',
				src: '/admin/resources/js/plugins/dictionary/dictionary.css'
			}];
		},
	}));
};
