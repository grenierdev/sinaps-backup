var _ = require('lodash');
var moment = require('moment');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

	// Datetime
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'datetime',
		label: 'Datetime',
		type: Date,
		setter: function (v) {
			var m = moment(v)
			return m.isValid() ? m.toDate() : '';
		},
		settings: {
			format: {
				type: 'text',
				label: 'Format',
				value: 'YYYY-MM-DD HH:mm'
			}
		},

		getInputTemplate: function () {
			return '<div class="input-group date" role="datetime" data-datetime-format="{{ field.format|default("YYYY-MM-DD HH:mm") }}">\
	<input 	type="text"\
	 		class="{{ field.class|default("form-control") }}"\
			id="{{ field.id|default(field.name) }}"\
			{% if field.name %} name="{{ field.name }}"{% endif %}\
			{% if field.value %} value="{{ field.value|date("YYYY-MM-DD HH:mm") }}"{% endif %}\
			{% if field.autofocus %} autofocus{% endif %}\
			{% if field.required %} required{% endif %}\
			{% if field.disabled %} disabled{% endif %}\
			{% if field.readonly %} readonly{% endif %}\
	/>\
	<span class="input-group-addon" style="order: -1">\
		<i class="fa fa-calendar"></i>\
	</span>\
</div>';
		},

		getValueTemplate: function () {
			return '{% if field.value %}{{ field.value|date(field.format|default("YYYY-MM-DD HH:mm")) }}{% endif %}';
		},

		getIncludedResources: function () {
			return [{
				type: 'script',
				src: '/admin/resources/js/vendors/bootstrap-datetimepicker/bootstrap-datetimepicker.min.js'
			}, {
				type: 'css',
				src: '/admin/resources/js/vendors/bootstrap-datetimepicker/bootstrap-datetimepicker.css'
			}];
		},

		getIncludedJS: function () {
			return '$(".input-group[role=\'datetime\']:not([data-field-discovered])").attr("data-field-discovered", "").each(function () {\
				var $date = $(this);\
				$date.datetimepicker({\
					format: $date.data("datetime-format") || "YYYY-MM-DD HH:mm",\
					icons: {\
						time: "fa fa-clock-o",\
						date: "fa fa-calendar",\
						up: "fa fa-chevron-up",\
						down: "fa fa-chevron-down",\
						previous: "fa fa-chevron-left",\
						next: "fa fa-chevron-right",\
						today: "fa fa-crosshairs",\
						clear: "fa fa-trash",\
						close: "fa fa-times"\
					}\
				});\
			});';
		}
	}));
};
