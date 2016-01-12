var _ = require('lodash');
var nunjucks = require('nunjucks');
var admin;
var uid = 0;

function FieldType (options) {
	_.extend(this, {
		handle: '',
		label: '',
		type: undefined,
		getter: undefined,
		setter: undefined,
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
			return '<div class="form-group row">\
	<label class="col-xs-12 {% if field.inline %}col-md-2 form-control-label-md{% endif %}" for="{{ field.id|default(field.name) }}">\
		{{ field.label }}\
		{% if field.locale %}<small><code>{{ field.locale|upper }}</code></small>{% endif %}\
	</label>\
	<div class="col-xs-12 {% if field.inline %}col-md-10{% endif %}">\
		'+ this.getInputTemplate(field) +'\
		{% if field.instructions %}<small class="text-muted">{{ field.instructions }}</small>{% endif %}\
		{% if field.success %}<small class="text-success">{{ field.success }}</small>{% endif %}\
		{% if field.info %}<small class="text-info">{{ field.info }}</small>{% endif %}\
		{% if field.warning %}<small class="text-warning">{{ field.warning }}</small>{% endif %}\
		{% if field.error %}<small class="text-error">{{ field.error }}</small>{% endif %}\
	</div>\
</div>';
		},

		getFieldHTML: function (field) {
			return sinaps.nunjucks.renderString(this.getFieldTemplate(field), {
				field: field
			});
		},

		getValueTemplate: function (field) {
			return '{{ field.value }}';
		},

		getValueHTML: function (field) {
			return sinaps.nunjucks.renderString(this.getValueTemplate(field), {
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
