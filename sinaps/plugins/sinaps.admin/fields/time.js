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
			return '<div class="input-group input-medium">\
	<input 	type="text"\
	 		class="{{ field.class|default("form-control timepicker timepicker-24") }}"\
			id="{{ field.id|default(field.name) }}"\
			{% if field.name %} name="{{ field.name }}"{% endif %}\
			{% if field.value %} value="{{ field.value }}"{% endif %}\
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
};
