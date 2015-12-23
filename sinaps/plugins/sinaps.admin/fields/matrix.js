var _ = require('lodash');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

	// Matrix
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'matrix',
		label: 'Matrix',
		type: 'blocks',
		settings: {
			blocks: {
				type: 'builder-tabs',
				label: 'Blocks'
			},
			maxblocks: {
				type: 'number',
				label: 'Maximum number of blocks',
				decimal: 0
			}
		},
		getInputTemplate: function () {
			return '<div class="input-group" role="matrix">\
	<input type="hidden"\
		id="{{ field.id|default(field.name) }}"\
		{% if field.name %} name="{{ field.name }}"{% endif %}\
		{% if field.value %} value="{{ field.value|json|escape }}"{% endif %}\
		data-blocks="{{ field.blocks|json|escape }}"\
	/>\
</div>';
		},

		getValueTemplate: function () {
			return '{{ field.value.length }} {% if field.value.length > 1 %}blocks{% else %}block{% endif %}';
		},

		getIncludedResources: function () {
			return [{
				type: 'script',
				src: '/admin/resources/js/plugins/matrix/matrix.js'
			}, {
				type: 'css',
				src: '/admin/resources/js/plugins/matrix/matrix.css'
			}];
		},
	}));
};
