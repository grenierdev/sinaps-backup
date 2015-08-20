var _ = require('lodash');
var admin = sinaps.require('sinaps.admin');
var FieldType = admin.FieldType;

module.exports = function () {

	// Text
	admin.registerFieldType(new FieldType({
		handle: 'text',
		label: 'Text',
		storage: String,
		settings: {
			subtype: {
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
		getInputTemplate: function () {
			return '<input type="{{ field.subtype|default("text") }}"\
	id="{{ field.id|default(field.name) }}"\
	class="{{ field.class|default("form-control input-sm") }}"\
	{% if field.name %} name="{{ field.name }}"{% endif %}\
	{% if field.value %} value="{{ field.value }}"{% endif %}\
	{% if field.size %} size="{{ field.size }}"{% endif %}\
	{% if field.maxlength %} maxlength="{{ field.maxlength }}"{% endif %}\
	{% if field.autofocus %} autofocus{% endif %}\
	{% if field.required %} required{% endif %}\
	{% if field.disabled %} disabled{% endif %}\
	{% if field.readonly %} readonly{% endif %}\
	{% if field.placeholder %} placeholder="{{ field.placeholder }}"{% endif %}\
/>';
		}
	}));

	// Textarea
	admin.registerFieldType(new FieldType({
		handle: 'textarea',
		label: 'Textarea',
		storage: String,
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
		getInputTemplate: function () {
			return '<textarea\
	id="{{ field.id|default(field.name) }}"\
	class="{{ field.class|default("form-control input-sm") }}"\
	{% if field.name %} name="{{ field.name }}"{% endif %}\
	{% if field.cols %} cols="{{ field.cols }}"{% endif %}\
	{% if field.rows %} rows="{{ field.rows }}"{% endif %}\
	{% if field.autofocus %} autofocus{% endif %}\
	{% if field.required %} required{% endif %}\
	{% if field.disabled %} disabled{% endif %}\
	{% if field.readonly %} readonly{% endif %}\
	{% if field.placeholder %} placeholder="{{ field.placeholder }}"{% endif %}\
>{{ field.value }}</textarea>';
		}
	}));

	// Number
	admin.registerFieldType(new FieldType({
		handle: 'number',
		label: 'Number',
		storage: String,
		settings: {
			decimal: {
				type: 'number',
				label: 'Decimal',
				decimal: 0
			}
		},
		getInputTemplate: function () {
			return '<input type="text"\
	id="{{ field.id|default(field.name) }}"\
	class="{{ field.class|default("form-control input-sm") }}"\
	{% if field.name %} name="{{ field.name }}"{% endif %}\
	{% if field.value %} value="{{ field.value }}"{% endif %}\
	{% if field.size %} size="{{ field.size }}"{% endif %}\
	{% if field.maxlength %} maxlength="{{ field.maxlength }}"{% endif %}\
	{% if field.autofocus %} autofocus{% endif %}\
	{% if field.required %} required{% endif %}\
	{% if field.disabled %} disabled{% endif %}\
	{% if field.readonly %} readonly{% endif %}\
	{% if field.placeholder %} placeholder="{{ field.placeholder }}"{% endif %}\
/>';
		}
	}));

	// Selectbox
	admin.registerFieldType(new FieldType({
		handle: 'selectbox',
		label: 'Selectbox',
		storage: String,
		settings: {},

		getInputTemplate: function () {
			return '<select class="{{ field.class|default("bs-select form-control") }}"\
		id="{{ field.id|default(field.name) }}"\
		{% if field.name %} name="{{ field.name }}"{% endif %}\
		{% if field.required %} required{% endif %}\
		{% if field.disabled %} disabled{% endif %}\
		{% if field.readonly %} readonly{% endif %}\
		{% if field.multiple %} multiple{% endif %}\
>\
	{% for opt in field.options %}\
		<option value="{{ opt.value }}" {% if opt.selected %}selected{% endif %}>{{ opt.label }}</option>\
	{% endfor %}\
</select>';
		},

		getIncludedJS: function () {
			return '$(".bs-select:not([data-field-discovered])").attr("data-field-discovered", "").selectpicker({iconBase: "fa", tickIcon: "fa-check" });';
		}
	}));

	// Checkbox
	admin.registerFieldType(new FieldType({
		handle: 'checkbox',
		label: 'Checkbox',
		storage: String,
		settings: {
			default: {
				type: 'checkbox',
				label: 'Default',
				value: false
			}
		},
		getInputTemplate: function () {
			return '<div class="md-checkbox inline" style="border: 0">\
	<input type="checkbox"\
			class="md-check"\
			id="{{ field.id|default(field.name) }}"\
			{% if field.name %} name="{{ field.name }}"{% endif %}\
			{% if field.required %} required{% endif %}\
			{% if field.disabled %} disabled{% endif %}\
			{% if field.readonly %} readonly{% endif %}\
			{% if field.checked %} checked{% endif %}\
	/>\
	<label for="{{ field.id|default(field.name) }}">\
		<span></span>\
		<span class="check"></span>\
		<span class="box"></span>\
	</label>\
</div>';
		},

		getFieldTemplate: function () {
			return '<div class="form-group form-sm-line-input">\
	'+ this.getInputTemplate() +'\
	<label for="{{ field.id }}">{{ field.label }}</label>\
	{% if field.instructions %}<span class="help-block">{{ field.instructions }}</span>{% endif %}\
</div>';
		}
	}));

	// Date
	admin.registerFieldType(new FieldType({
		handle: 'date',
		label: 'Date',
		storage: Date,
		settings: {
			format: {
				type: 'text',
				label: 'Format',
				value: 'yyyy-mm-dd'
			}
		},

		getInputTemplate: function () {
			return '<div class="input-group input-medium date date-picker" data-date-format="{{ field.format|default("yyyy-mm-dd") }}">\
	<input 	type="text"\
	 		class="{{ field.class|default("form-control") }}"\
			id="{{ field.id|default(field.name) }}"\
			{% if field.name %} name="{{ field.name }}"{% endif %}\
			{% if field.autofocus %} autofocus{% endif %}\
			{% if field.required %} required{% endif %}\
			{% if field.disabled %} disabled{% endif %}\
			{% if field.readonly %} readonly{% endif %}\
	/>\
	<span class="input-group-btn">\
		<button class="btn default" type="button"><i class="fa fa-calendar"></i></button>\
	</span>\
</div>';
		},

		getIncludedJS: function () {
			return '$(".date-picker:not([data-field-discovered])").attr("data-field-discovered", "").datepicker({orientation: "left", autoclose: true});';
		}
	}));

	// Time
	admin.registerFieldType(new FieldType({
		handle: 'time',
		label: 'Time',
		storage: String,
		settings: {},

		getInputTemplate: function () {
			return '<div class="input-group input-medium">\
	<input 	type="text"\
	 		class="{{ field.class|default("form-control timepicker timepicker-24") }}"\
			id="{{ field.id|default(field.name) }}"\
			{% if field.name %} name="{{ field.name }}"{% endif %}\
			{% if field.autofocus %} autofocus{% endif %}\
			{% if field.required %} required{% endif %}\
			{% if field.disabled %} disabled{% endif %}\
			{% if field.readonly %} readonly{% endif %}\
	/>\
	<span class="input-group-btn">\
		<button class="btn default" type="button"><i class="fa fa-clock-o"></i></button>\
	</span>\
</div>';
		},

		getIncludedJS: function () {
			return '$(".timepicker:not([data-field-discovered])").attr("data-field-discovered", "").timepicker({autoclose: true, minuteStep: 1, showSeconds: false, showMeridian: false});';
		}
	}));

	// Matrix
	admin.registerFieldType(new FieldType({
		handle: 'matrix',
		label: 'Matrix',
		storage: String,
		settings: {
			maxblocks: {
				type: 'number',
				label: 'Maximum number of blocks',
				decimal: 0
			}
		},
		getInputTemplate: function () {
			return '';
		}
	}));

}
