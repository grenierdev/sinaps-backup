var _ = require('lodash');
var nunjucks = require('nunjucks');
var admin;
var uid = 0;

function FieldType (options) {
	_.extend(this, {
		handle: '',
		label: '',
		storage: {},
		settings: {},

		getUniqueId: function () {
			return 'field_' + (++uid);
		},

		includeResource: function (src, type) {
			if (!admin) {
				admin = sinaps.require('sinaps.admin');
			}
			return admin.includeResource(src, type);
		},

		includeJS: function (code) {
			if (!admin) {
				admin = sinaps.require('sinaps.admin');
			}
			return admin.includeJS(code);
		},

		getInputTemplate: function () {
			return '<!-- Could have been the input for {{ field.id }} {{ field.name }} -->';
		},

		getInputHTML: function (options) {
			return sinaps.nunjucks.renderString(this.getInputTemplate(), {
				field: _.merge({
					id: this.getUniqueId()
				}, options)
			});
		},

		getFieldTemplate: function () {
			return '<div class="form-group form-md-line-input">\
	'+ this.getInputTemplate() +'\
	<label for="{{ field.id }}">{{ field.label }}</label>\
	{% if field.instructions %}<span class="help-block">{{ field.instructions }}</span>{% endif %}\
</div>';
		},

		getFieldHTML: function (options) {
			return sinaps.nunjucks.renderString(this.getFieldTemplate(), {
				field: _.merge({
					id: this.getUniqueId()
				}, options)
			});
		},

		getSettingTemplate: function () {
			var tpl = '';
			var admin = sinaps.require('sinaps.admin');

			_.forEach(this.settings, function (options, name) {
				tpl += '{% set field = '+ JSON.stringify(_.merge({
					id: this.getUniqueId(),
					name: name
				}, options)) +' %}';
				tpl += admin.getFieldType(options.type).getFieldTemplate();
			}.bind(this));

			return tpl;
		}

	}, options);
}

module.exports = FieldType;

/*function FieldType (options) {
	_.extend(this, {
		name: '',
		label: '',
		settings: {},

		getHTML: function (field) {
			return '';
		},

		renderSettings: function (options) {

			if (!this._templateSettings) {
				var html = "";

				_.map(this.settings, function (opt, name) {
					var type = (opt.type || '').toLowerCase();
					switch (type) {
						case 'text':
						case 'textarea':
						case 'number':
						case 'checkbox':
						case 'selectbox':
							var opt = _.omit(opt, 'type');
							opt.name = name;
							opt.label = opt.label || opt.name;
							html += '{{ fields.' + type + 'Field(' + JSON.stringify(opt) + ') }}';
							break;
					}
				});

				if (html == '') {
					this._templateSettings = {render: function () {}};
				} else {
					html = "{% import 'sinaps.admin/components/fields.html' as fields %}" + html;
					this._templateSettings = nunjucks.compile(html, sinaps.nunjucks);
				}
			}


			return this._templateSettings.render(options);
		}

	}, options);
}


module.exports = FieldType;*/
