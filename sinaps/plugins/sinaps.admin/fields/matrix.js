var _ = require('lodash');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

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
									_.paths(_.omit(block, '__uid', '_id', 'type')),
									function (v, k) {
										return {
											path: '[' + k.split('.').join('][') + ']',
											name: k.split('.').pop(),
											value: v // TODO display something prettier defined by the field
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
								var ids = $(this).sortable('toArray', { attribute: 'data-block' });
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
