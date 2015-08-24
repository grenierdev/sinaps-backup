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

		getInputTemplate: function () {
			return '<!-- Could have been the input for {{ field.id }} {{ field.name }} -->';
		},

		getInputHTML: function (options) {
			return sinaps.nunjucks.renderString(this.getInputTemplate(), {
				field: options
			});
		},

		getFieldTemplate: function () {
			return '<div class="form-group form-md-line-input">\
	'+ this.getInputTemplate() +'\
	<label for="{{ field.id|default(field.name) }}">{{ field.label }}</label>\
	{% if field.instructions %}<span class="help-block">{{ field.instructions }}</span>{% endif %}\
</div>';
		},

		getFieldHTML: function (options) {
			return sinaps.nunjucks.renderString(this.getFieldTemplate(), {
				field: options
			});
		},

		getSettingTemplate: function () {
			var tpl = '';
			var admin = sinaps.require('sinaps.admin');

			_.forEach(this.settings, function (options, name) {
				tpl += '{% set field = '+ JSON.stringify(_.merge({
					id: name + '"+ __uid',
					name: name
				}, options)) +' %}';
				tpl += admin.getFieldType(options.type).getFieldTemplate();
			}.bind(this));

			return tpl.replace(/\\"\+ __uid"/g, '"+ __uid');
		}

	}, options);
}

module.exports = FieldType;
