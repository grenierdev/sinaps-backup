var _ = require('lodash');
var nunjucks = require('nunjucks');

function FieldType (options) {
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


module.exports = FieldType;
