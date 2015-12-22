var _ = require('lodash');
var moment = require('moment');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

	// Date
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'date',
		label: 'Date',
		type: Date,
		setter: function (v) {
			var m = moment(v)
			return m.isValid() ? m.toDate() : '';
		},
		settings: {
			format: {
				type: 'text',
				label: 'Format',
				value: 'YYYY-MM-DD'
			}
		},

		getInputTemplate: function () {
			return '<div class="input-group date" role="date" data-date-format="{{ field.format|default("yyyy-mm-dd") }}">\
	<input 	type="text"\
	 		class="{{ field.class|default("form-control") }}"\
			id="{{ field.id|default(field.name) }}"\
			{% if field.name %} name="{{ field.name }}"{% endif %}\
			{% if field.value %} value="{{ field.value }}"{% endif %}\
			{% if field.autofocus %} autofocus{% endif %}\
			{% if field.required %} required{% endif %}\
			{% if field.disabled %} disabled{% endif %}\
			{% if field.readonly %} readonly{% endif %}\
	/>\
	<span class="input-group-btn" style="order: -1">\
		<button class="btn date" type="button"><i class="fa fa-calendar"></i></button>\
	</span>\
</div>';
		},

		getValueTemplate: function () {
			return '{% if field.value %}{{ field.value|date(field.format|default("YYYY-MM-DD")) }}{% endif %}';
		},

		getIncludedResources: function () {
			return [{
				type: 'script',
				src: '/admin/resources/js/vendors/bootstrap-datepicker/js/bootstrap-datepicker.min.js'
			}, {
				type: 'css',
				src: '/admin/resources/js/vendors/bootstrap-datepicker/css/bootstrap-datepicker4.css'
			}];
		},

		getIncludedJS: function () {
			return '$(".input-group[role=\'date\']:not([data-field-discovered])").attr("data-field-discovered", "").each(function () {\
				var $date = $(this);\
				$date.datepicker({\
					autoclose: true,\
					format: $date.data("date-format") || "yyyy-mm-dd"\
				});\
			});';
		}
	}));
};
