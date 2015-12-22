var _ = require('lodash');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

	// Time
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'time',
		label: 'Time',
		type: String,
		settings: {},

		getInputTemplate: function () {
			return '<div class="input-group" role="time">\
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
		<button class="btn date" type="button"><i class="fa fa-clock-o"></i></button>\
	</span>\
</div>';
		},

		getIncludedResources: function () {
			return [{
				type: 'script',
				src: '/admin/resources/js/vendors/bootstrap-timepicker/js/bootstrap-timepicker.min.js'
			}, {
				type: 'css',
				src: '/admin/resources/js/vendors/bootstrap-timepicker/css/bootstrap-timepicker.min.css'
			}];
		},

		getIncludedJS: function () {
			return '$(".input-group[role=\'time\']:not([data-field-discovered])").attr("data-field-discovered", "").each(function () {\
				var $date = $(this);\
				var $input = $date.find("input:first");\
				$date.timepicker({\
					showMeridian: false,\
					defaultTime: $input.val()\
				}).on("changeTime.timepicker", function (e) {\
					$input.val(e.time.value);\
				});\
			});';
		}
	}));
};
