var _ = require('lodash');
var moment = require('moment');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

	// Datetime
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'daterange',
		label: 'Date range',
		type: 'object',
		fields: [
			{
				handle: 'from',
				type: 'date'
			},
			{
				handle: 'to',
				type: 'date'
			}
		],
		settings: {
			format: {
				type: 'text',
				label: 'Format',
				value: 'YYYY-MM-DD'
			}
		},

		getInputTemplate: function () {
			return '<div class="input-group date" role="daterange" data-date-format="{{ field.format|default("YYYY-MM-DD") }}">\
	<input 	type="text"\
	 		class="{{ field.class|default("form-control") }}"\
			id="{{ field.id|default(field.name) }}from"\
			{% if field.name %} name="{{ field.name }}[from]"{% endif %}\
			{% if field.value.from %} value="{{ field.value.from|date("YYYY-MM-DD") }}"{% endif %}\
			{% if field.autofocus %} autofocus{% endif %}\
			{% if field.required %} required{% endif %}\
			{% if field.disabled %} disabled{% endif %}\
			{% if field.readonly %} readonly{% endif %}\
	/>\
	<span class="input-group-addon" style="order: -1">\
		<i class="fa fa-calendar"></i>\
	</span>\
	<span class="input-group-addon">to</span>\
	<input 	type="text"\
	 		class="{{ field.class|default("form-control") }}"\
			id="{{ field.id|default(field.name) }}to"\
			{% if field.name %} name="{{ field.name }}[to]"{% endif %}\
			{% if field.value.to %} value="{{ field.value.to|date("YYYY-MM-DD") }}"{% endif %}\
			{% if field.autofocus %} autofocus{% endif %}\
			{% if field.required %} required{% endif %}\
			{% if field.disabled %} disabled{% endif %}\
			{% if field.readonly %} readonly{% endif %}\
	/>\
	<span class="input-group-addon">\
		<i class="fa fa-calendar"></i>\
	</span>\
</div>';
		},

		getValueTemplate: function () {
			return '{% if field.value %}{{ field.value|date(field.format|default("YYYY-MM-DD")) }}{% endif %}';
		},

		getIncludedJS: function () {
			return '$(".input-group[role=\'daterange\']:not([data-field-discovered])").attr("data-field-discovered", "").each(function () {\
				var $date = $(this);\
				var $from = $date.find(":input:first");\
				var $to = $date.find(":input:last");\
				$from.datetimepicker({\
					allowInputToggle: true,\
					useCurrent: false,\
					maxDate: $to.val() || null,\
					format: $date.data("date-format") || "YYYY-MM-DD",\
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
				$from.on("dp.change", function (e) {\
					$to.data("DateTimePicker").minDate(e.date);\
				});\
				$date.find(".input-group-addon:first").on("click", function (e) {\
					e.preventDefault();\
					$from.data("DateTimePicker").toggle();\
				});\
				\
				$to.datetimepicker({\
					allowInputToggle: true,\
					useCurrent: false,\
					minDate: $to.val() || null,\
					format: $date.data("date-format") || "YYYY-MM-DD",\
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
				$to.on("dp.change", function (e) {\
					$from.data("DateTimePicker").maxDate(e.date);\
				});\
				$date.find(".input-group-addon:last").on("click", function (e) {\
					e.preventDefault();\
					$to.data("DateTimePicker").toggle();\
				});\
			});';
		}
	}));
};
