var _ = require('lodash');
var nunjucks = require('nunjucks');
var admin;
var uid = 0;

function FieldType (options) {
	_.extend(this, {
		handle: '',
		label: '',
		type: {},
		settings: {},

		getIncludedResources: function () {
			return [];
		},

		getIncludedJS: function () {
			return '';
		},

		getInputTemplate: function (field) {
			return '<!-- Could have been the input for {{ field.id }} {{ field.name }} -->';
		},

		getInputHTML: function (field) {
			return sinaps.nunjucks.renderString(this.getInputTemplate(field), {
				field: field
			});
		},

		getFieldTemplate: function (field) {
			return '<div class="form-group form-md-line-input">\
	'+ this.getInputTemplate(field) +'\
	<label for="{{ field.id|default(field.name) }}">{{ field.label }}</label>\
	{% if field.instructions %}<span class="help-block">{{ field.instructions }}</span>{% endif %}\
</div>';
		},

		getFieldHTML: function (field) {
			return sinaps.nunjucks.renderString(this.getFieldTemplate(field), {
				field: field
			});
		},

		getSettingTemplate: function () {
			var tpl = '';
			var admin = sinaps.require('sinaps.admin');

			_.forEach(this.settings, function (options, name) {
				tpl += '{% set field = '+ JSON.stringify(_.merge({
					id: name + '"+ __uid',
					name: name,
					value: '{{ '+ name +' }}'
				}, options)) +' %}';
				tpl += admin.getFieldType(options.type).getFieldTemplate();
			}.bind(this));

			return tpl.replace(/\\"\+ __uid"/g, '"+ __uid').replace(/"value":"\{\{ ([^ ]+) \}\}"/g, '"value": $1|default(null)');
		}

	}, options);
}

module.exports = FieldType;
