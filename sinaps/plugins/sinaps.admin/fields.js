var _ = require('lodash');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

	// Text
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'text',
		label: 'Text',
		type: String,
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
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'textarea',
		label: 'Textarea',
		type: String,
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
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'number',
		label: 'Number',
		type: Number,
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
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'selectbox',
		label: 'Selectbox',
		type: String,
		settings: {},

		getInputTemplate: function () {
			return '<select class="form-control {{ field.class }}"\
		id="{{ field.id|default(field.name) }}"\
		{% if field.name %} name="{{ field.name }}"{% endif %}\
		{% if field.required %} required{% endif %}\
		{% if field.disabled %} disabled{% endif %}\
		{% if field.readonly %} readonly{% endif %}\
		{% if field.multiple %} multiple{% endif %}\
>\
	{% for opt in field.options %}\
		<option value="{{ opt.value }}" {% if opt.value == field.value %}selected{% endif %}>{{ opt.label }}</option>\
	{% endfor %}\
</select>';
		}/*,

		getIncludedJS: function () {
			return '$(".bs-select:not([data-field-discovered])").attr("data-field-discovered", "").selectpicker({iconBase: "fa", tickIcon: "fa-check" });';
		}*/
	}));

	// Checkbox
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'checkbox',
		label: 'Checkbox',
		type: Boolean,
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
			{% if field.checked or field.value %} checked{% endif %}\
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
	<label for="{{ field.id|default(field.name) }}">{{ field.label }}</label>\
	{% if field.instructions %}<span class="help-block">{{ field.instructions }}</span>{% endif %}\
</div>';
		}
	}));

	// Date
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'date',
		label: 'Date',
		type: Date,
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
			{% if field.value %} value="{{ field.value }}"{% endif %}\
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

	// Matrix
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'matrix',
		label: 'Matrix',
		type: 'blocks',
		settings: {
			maxblocks: {
				type: 'number',
				label: 'Maximum number of blocks',
				decimal: 0
			}
		},
		getInputTemplate: function (field) {
			return '<div class="input-group matrix">\
	<input type="hidden"\
		id="{{ field.id|default(field.name) }}"\
		class="sinaps-matrix"\
		{% if field.name %} name="{{ field.name }}"{% endif %}\
		{% if field.value %} value="{{ field.value|json|escape }}"{% endif %}\
		data-blocks="{{ field.blocks|json|escape }}"\
	/>\
</div>';
		},
		getIncludedJS: function () {
			var rawjs = function () {
				var uid = 0;
				$(".sinaps-matrix:not([data-field-discovered])").attr("data-field-discovered", "").each(function () {
					var $matrix = $(this),
						$blocks = $('<ul class="blocks"></ul>').insertAfter($matrix),
						blocks = $matrix.data('blocks'),
						name = $matrix.attr('name'),
						value = $matrix.val(),
						uid = 0;

					$matrix.removeAttr('name');

					try {
						value = JSON.parse(value);
					} catch (e) {
						value = [];
					}

					_.each(value, function (block) {
						block.__uid = uid++;
					});

					var $addgroup = $('<div class="btn-group btn-group-sm">\
	' + blocks.map(function (block, i) { return '<a href="#" class="btn btn-default" data-type="'+ block.handle +'">'+ (i === 0 ? '<i class="fa fa-plus"></i>' : '') + block.label +'</a>'; }).join("") + '\
</div>').insertAfter($blocks);
					var $addselect = $('<div class="btn-group btn-group-sm dropup">\
	<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" data-hover="dropdown" data-delay="1000" data-close-others="true">\
		<i class="fa fa-plus"></i> Add block\
	</button>\
	<ul class="dropdown-menu" role="menu">\
		' + blocks.map(function (block) { return '<li><a href="#" data-type="'+ block.handle +'">'+ block.label +'</a></li>'; }).join("") + '\
	</ul>\
</div>');//.insertAfter($blocks);

					var getBlock = function (type) {
						for (var a = 0, b = blocks.length; a < b; ++a) {
							if (blocks[a].handle == type)
								return _.cloneDeep(blocks[a]);
						}
						return null;
					};

					var showModal = function (type, state, onClose) {
						var block = getBlock(type);
						if (!block) {
							return;
						}

						state.__uid = ++uid;
						state.__block = block;

						var $modal = $('<div class="modal fade" tabindex="-1" data-backdrop="static" aria-hidden="true"></div>').appendTo('body'),
							$form,
							saveState;

						var updateContent = function () {
							var tpl = '';
							tpl += '<div class="modal-dialog">\
	<div class="modal-content">\
		<form>\
			<div class="modal-header">\
				<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>\
				<h4 class="modal-title">{% if __action == "add" %}New {{ __block.label }}{% else %}Edit {{ __block.label }}{% endif %}</h4>\
			</div>\
			<div class="modal-body">\
				'+ block.fields.map(function (field, i) {
					var tpl = sinaps.fieldTypes.templates.field[field.input];
					if (!tpl) {
						return '';
					}
					field.id = field.handle + state.__uid;
					field.name = field.handle;
					field.value = state[field.handle] || '';
					field.autofocus = i == 0;
					return tpl.render({field: field});
				}).join('') +'\
			</div>\
			<div class="modal-footer">\
				<button type="button" class="btn default" data-dismiss="modal">Cancel</button>\
				<button type="submit" class="btn blue">\
					{% if __action == "add" %}Add{% else %}Save{% endif %}\
				</button>\
			</div>\
		</form>\
	</div>\
</div>';

							$modal.empty().html(nunjucks.renderString(tpl, state));
							$form = $modal.find('form');

							$form.on('submit', function (e) {
								e.preventDefault();

								updateState();
								saveState = _.merge({}, _.omit(state, '__uid', '__action', '__block'));
								$modal.modal('hide');
							});

							$('body').trigger('refresh-fields');
						};
						var updateState = function () {
							_.keys(_.omit(state, '__action', '__uid')).forEach(function (key) { delete state[key]; });
							_.merge(state, $form.serializeObject());
						};
						updateContent();

						// Modal closed, do the callback
						$modal.on('hide.bs.modal', function (e) {
							if (typeof onClose == 'function') {
								onClose(saveState, state);
							}
						});
						$modal.on('shown.bs.modal', function (e) {
							$modal.find(':input[autofocus]:first').focus();
						});

						$modal.modal('show');

						return {
							updateContent: updateContent,
							updateState: updateState,
							$modal: $modal
						};
					};

					var getBlockById = function (id) {
						for (var a = 0, b = value.length; a < b; ++a) {
							if (value[a].__uid == id) {
								return value[a];
							}
						}
						return undefined;
					};

					var updateBlocks = function () {
						$matrix.val(JSON.stringify(_.map(value, function (block) {
							return _.omit(block, '__uid');
						})));
						$blocks.empty();

						_.each(value, function (block, i) {
							$blocks.append(nunjucks.renderString('<li class="block" data-block="{{ block.__uid }}">\
	<div class="handle"><i class="fa fa-bars"></i></div>\
	<div class="title">{{ label }}</div>\
	<div class="values">\
		<input type="hidden" name="{{ name }}[type]" value="{{ block.type }}" />\
		{% for field in fields %}\
			{{ field.value }}\
			<input type="hidden" name="{{ name }}{{ field.path }}" value="{{ field.value|e }}" />\
			{% if not loop.last %} | {% endif %}\
		{% endfor %}\
	</div>\
	<div class="actions">\
		<a href="#edit"><i class="fa fa-edit"></i></a>\
		<a href="#remove"><i class="fa fa-trash-o"></i></a>\
	</div>\
</li>', {
								name: name + '[' + i + ']',
								block: block,
								label: blocks.filter(function (b) { return b.handle == block.type; })[0].label,
								fields: _.map(
									_.paths(_.omit(block, '__uid', 'type')),
									function (v, k) {
										return {
											path: '[' + k.split('.').join('][') + ']',
											name: k.split('.').pop(),
											value: v
										};
									}
								)
							}));
						});

						// Reorder blocks
						$blocks.sortable({
							items: 'li',
							handle: '.handle',

							stop: function (e, ui) {
								var ids = $blocks.sortable('toArray', { attribute: 'data-block' });
								value = _.map(ids, function (id) { return getBlockById(id) });
								updateBlocks();
							}
						});
					};
					updateBlocks();

					// Add block based on this type
					$addgroup.add($addselect).on('click', '[data-type]', function (e) {
						e.preventDefault();
						var type = $(this).data('type'),
							block = blocks.filter(function (b) { return b.handle == type; })[0];
						showModal(type, {__action: 'add'}, function (state) {
							if (state) {
								state.__uid = uid++;
								state.type = block.handle;
								value.push(state);
							}
							updateBlocks();
						});
					});

					// Edit block
					$blocks.on('click', '[href="#edit"]', function (e) {
						e.preventDefault();
						var $btn = $(this),
							$li = $btn.closest('li'),
							uid = $li.data('block'),
							block = getBlockById(uid);

						showModal(block.type, _.merge({__action: 'edit'}, block), function (state) {
							if (state) {
								_.merge(block, state);
							}
							updateBlocks();
						});
					});

					// Delete block
					$blocks.on('click', '[href="#remove"]', function (e) {
						e.preventDefault();
						var $btn = $(this),
							$li = $btn.closest('li'),
							uid = $li.data('block'),
							block = getBlockById(uid);

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
							var i = value.indexOf(block);
							if (i > -1) {
								value.splice(i, 1);
							}
							updateBlocks();
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
