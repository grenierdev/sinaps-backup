var admin = sinaps.require('sinaps.admin');
var FieldType = admin.FieldType;

module.exports = function () {

	// text
	admin.addFieldType(new FieldType({
		name: 'text',
		label: 'Text',
		settings: {
			type: {
				type: 'selectbox',
				label: 'Type',
				value: 'text',
				options: [{
					value: 'text',
					label: 'Plain text'
				},{
					value: 'password',
					label: 'Password'
				}]
			},
			size: {
				type: 'number',
				label: 'Size',
				decimal: 0
			},
			maxlength: {
				type: 'number',
				label: 'Maximum length',
				decimal: 0
			},
			placeholder: {
				type: 'text',
				label: 'Placeholder',
				value: ''
			}
		},
		getHTML: function (options) {
			return sinaps.nunjucks.renderString("\
				{% import 'sinaps.admin/components/fields.html' as fields %}\
				{{ fields.textField(options) }}\
			", options);
		}
	}));

	// textarea
	admin.addFieldType(new FieldType({
		name: 'textarea',
		label: 'Textarea',
		settings: {
			rows: {
				type: 'number',
				label: 'Number of rows',
				decimal: 0
			},
			placeholder: {
				type: 'text',
				label: 'Placeholder'
			}
		},
		getHTML: function (options) {
			return sinaps.nunjucks.renderString("\
				{% import 'sinaps.admin/components/fields.html' as fields %}\
				{{ fields.textareaField(options) }}\
			", options);
		}
	}));

	// number
	admin.addFieldType(new FieldType({
		name: 'number',
		label: 'Number',
		settings: {
			decimal: {
				type: 'number',
				label: 'Decimal',
				value: 0
			}
		},
		getHTML: function (options) {
			return sinaps.nunjucks.renderString("\
				{% import 'sinaps.admin/components/fields.html' as fields %}\
				{{ fields.numberField(options) }}\
			", options);
		}
	}));

	// checkbox
	admin.addFieldType(new FieldType({
		name: 'checkbox',
		label: 'Checkbox',
		settings: {
			default: {
				type: 'checkbox',
				label: 'Default',
				value: false
			}
		},
		getHTML: function (options) {
			return sinaps.nunjucks.renderString("\
				{% import 'sinaps.admin/components/fields.html' as fields %}\
				{{ fields.checkboxField(options) }}\
			", options);
		}
	}));

	// date
	admin.addFieldType(new FieldType({
		name: 'date',
		label: 'Date',
		settings: {
			format: {
				type: 'text',
				label: 'Format',
				value: 'yyyy-mm-dd'
			}
		},
		getHTML: function (options) {
			return sinaps.nunjucks.renderString("\
				{% import 'sinaps.admin/components/fields.html' as fields %}\
				{{ fields.dateField(options) }}\
			", options);
		}
	}));

	// time
	admin.addFieldType(new FieldType({
		name: 'time',
		label: 'Time',

		getHTML: function (options) {
			return sinaps.nunjucks.renderString("\
				{% import 'sinaps.admin/components/fields.html' as fields %}\
				{{ fields.timeField(options) }}\
			", options);
		}
	}));

	// matrix
	admin.addFieldType(new FieldType({
		name: 'matrix',
		label: 'Matrix',
		settings: {
			maximum: {
				type: 'number',
				label: 'Maximum number of blocks'
			}
		},
		getHTML: function (options) {
			return '<!-- special magic in sinaps.section/section-form.html -->';
		}
	}));

}
