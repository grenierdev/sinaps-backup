var _ = require('lodash');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

	pluginAdmin.registerFieldType(new FieldType({
		handle: 'dictionary',
		label: 'Dictionary',
		type: 'array',
		//array: 'object',
		settings: {

		},
		getInputTemplate: function () {
			return '<div class="input-group dictionary">\
	<input type="hidden"\
		id="{{ field.id|default(field.name) }}"\
		class="sinaps-dictionary"\
		{% if field.name %} name="{{ field.name }}"{% endif %}\
		{% if field.value %} value="{{ field.value|json|escape }}"{% endif %}\
	/>\
</div>';
		},

		getValueTemplate: function () {
			return '{{ field.value.length }} {% if field.value.length > 1 %}pairs{% else %}pair{% endif %}';
		},

		getIncludedJS: function () {
			var rawjs = function () {
				var uid = 0;
				$(".sinaps-dictionary:not([data-field-discovered])").attr("data-field-discovered", "").each(function () {
					var $dictionary = $(this),
						$keys = $('<ul class="keys"></ul>').insertAfter($dictionary),
						name = $dictionary.attr('name'),
						value = $dictionary.val(),
						uid = 0;

					$dictionary.removeAttr('name');

					try {
						value = JSON.parse(value);
					} catch (e) {
						value = [];
					}

					_.each(value, function (key) {
						key.__uid = uid++;
					});

					var $add = $('<a href="#add" class="btn btn-default"><i class="fa fa-plus"></i> Key</a>').insertAfter($keys);

					var getKey = function (id) {
						for (var a = 0, b = value.length; a < b; ++a) {
							if (value[a].__uid == id) {
								return value[a];
							}
						}
						return null;
					};

					var updateKeys = function () {
						$dictionary.val(JSON.stringify(_.map(value, function (key) { return _.omit(key, '__uid'); })));
						$keys.empty();

						_.each(value, function (key, i) {
							$keys.append(nunjucks.renderString('<li class="key" data-id="{{ __uid }}">\
	<div class="handle"><i class="fa fa-bars"></i></div>\
	<div class="inputs">\
		<input type="text" name="{{ name }}[value]" value="{{ value|e }}" placeholder="{{ "Value" }}" />\
	</div>\
	<div class="inputs">\
		<input type="text" name="{{ name }}[label]" value="{{ label|e }}" placeholder="{{ "Label" }}" />\
	</div>\
	<div class="actions">\
		<a href="#remove"><i class="fa fa-trash-o"></i></a>\
	</div>\
</li>', {
								name: name + '[' + i + ']',
								__uid: key.__uid,
								value: key.value,
								label: key.label
							}));
						});

						// Reorder keys
						$keys.sortable({
							items: 'li',
							handle: '.handle',

							stop: function (e, ui) {
								var ids = $(this).sortable('toArray', { attribute: 'data-id' });
								value = _.map(ids, function (id) { return getKey(id); });
								updateKeys();
							}
						});
					};
					updateKeys();

					$add.on('click', function (e) {
						e.preventDefault();

						value.push({
							__uid: uid++,
							value: '',
							label: ''
						});
						updateKeys();
					});

					$keys.on('change', '.inputs input', function (e) {
						var $input = $(this),
							$key = $input.closest('[data-id]'),
							id = $key.data('id'),
							key = getKey(id);
						key.label = $key.find('input[name$="[label]"]').val();
						key.value = $key.find('input[name$="[value]"]').val();
					});

					$keys.on('click', '[href="#remove"]', function (e) {
						e.preventDefault();
						var id = $(this).closest('[data-id]').data('id'),
							key = getKey(id);

						var $modal = $('<div class="modal fade" tabindex="-1" data-backdrop="static" aria-hidden="true"></div>').appendTo('body'),
							$form,
							saveState = false;

						$modal.append('<div class="modal-dialog">\
							<div class="modal-content">\
								<form>\
									<div class="modal-header">\
										<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>\
										<h4 class="modal-title">Remove</h4>\
									</div>\
									<div class="modal-body">\
										Are you sure you want to remove this item?\
									</div>\
									<div class="modal-footer">\
										<button type="button" class="btn default" data-dismiss="modal">Cancel</button>\
										<button type="submit" class="btn red">Remove</button>\
									</div>\
								</form>\
							</div>\
						</div>');

						$modal.find('form').on('submit', function (e) {
							e.preventDefault();
							var i = value.indexOf(key);
							if (i > -1) {
								value.splice(i, 1);
							}
							updateKeys();
							$modal.modal('hide');
						});

						$modal.modal('show');
					});
				});
			};

			return rawjs.toString().replace(/^\s*function \(\) \{\s*/, '').replace(/\s*}\s*$/, '');
		}
	}));
};
