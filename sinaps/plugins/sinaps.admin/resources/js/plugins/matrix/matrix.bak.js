$(function () {
	var uid = 0;
	var templates = {};

	function downloadTemplate (tpl, url) {
		return function () {
			var promise = $.ajax({ url: url });
			promise.then(function (source) {
				templates[tpl] =  nunjucks.compile(source.replace(/(^\s+|\s+$)/g, ''));
			});
			return promise;
		}
	}

	downloadTemplate('blocks', '/admin/resources/js/plugins/matrix/templates/blocks.twig')()
	.then(downloadTemplate('modal', '/admin/resources/js/plugins/matrix/templates/modal.twig'))
	.then(function () {
		downloadTemplateDone(templates);
	});

	function downloadTemplateDone (templates) {

		$('body').on('refresh-fields', function (e) {
			$('[role="matrix"] > input:not([data-field-discovered])').attr('data-field-discovered', '').each(function () {
				var $input = $(this);
				var $matrix = $input.parent();
				var id = uid++;
				var name = $input.attr('name');
				var blockTypes = $input.data('blocks');
				var blocks = $input.val();
				var depth = $input.parents('[role="matrix"]').length - 1;

				$input.removeAttr('name').removeAttr('value').removeAttr('data-blocks');

				blockTypes = _.isArray(blockTypes) ? blockTypes : [];

				try {
					blocks = JSON.parse(blocks);
				} catch (e) {
					blocks = [];
				}

				blocks.forEach(function (block, i) {
					block.__active = i == 0;
					block.__uid = i;
				});

				var t = blockTypes;
				blockTypes = {};
				t.forEach(function (type) {
					type.template = '';
					if (type.fields && _.isArray(type.fields)) {
						type.fields.forEach(function (field) {
							type.template += ('{% set field = '+ JSON.stringify(_.merge({
								id: field.handle + id,
								name: name + '[__uid][' + field.handle + ']',
								value: '{{ ' + field.handle + ' }}'
							}, field)) +' %}').replace(/\[__uid\]/g, '[" + __uid + "]').replace(/"value":"\{\{ ([^ ]+) \}\}"/g, '"value": $1|default(null)');
							type.template += sinaps.fieldTypes[field.input].templates.field.tmplStr;
						});
					}
					type.template = nunjucks.compile(type.template);

					blockTypes[type.handle] = type;
				});

				console.debug('Matrix', depth, blocks, blockTypes);

				var $view = null;
				updateView();
				function updateData () {
					var form = $view.closest('form').serializeObject();
					var path = name.replace(/\]\[/g, '.').replace(/(\[)/, '.').replace(/\]$/, '') + '.';
					for (var a = 0, b = blocks.length; a < b; ++a) {
						var p = path + a;
						blocks[a] = _.merge({
							__active: blocks[a].__active,
							__uid: a
						}, _.get(form, p));
					}
				}
				function updateView () {
					if ($view) {
						$view.remove();
						$view = null;
					}

					$view = $($.parseHTML(templates.blocks.render({
						uid: id,
						depth: depth,
						name: name,
						blockTypes: blockTypes,
						blocks: blocks.map(function (block) {
							return _.merge({
								__blockType: blockTypes[block.type].label,
								__template: blockTypes[block.type].template.render(block)
							}, block);
						})
					})));
					$input.after($view);

					// Maintain UI active state and data
					$matrix.on('show.bs.collapse', function (e) {
						e.stopPropagation();
						var blockid = $(e.target).closest('[data-blockid]').data('blockid');
						blocks[blockid].__active = true;
					});
					$matrix.on('hide.bs.collapse', function (e) {
						e.stopPropagation();
						var blockid = $(e.target).closest('[data-blockid]').data('blockid');
						blocks[blockid].__active = false;
					});

					// Sort blocks
					$matrix.find('ul.blocks').sortable({
						tolerance: 'pointer',
						axis: 'y',
						items: 'li',

						stop: function (e, ui) {
							var order = $(this).children().map(function () {
								return $(this).data('blockid');
							}).get();
							updateData();
							blocks = order.map(function (id, i) {
								blocks[id].__uid = i;
								return blocks[id];
							});
							updateView();
						}
					});

					$matrix.find('[role="matrix-remove"]').on('click', function (e) {
						e.preventDefault();
						e.stopPropagation();

						var blockid = $(this).closest('[data-blockid]').data('blockid') || -1;
						sinaps.Modal.confirm('Are you sure you want to remove this block?', 'Remove block', function (state) {
							if (state) {
								updateData();
								blocks.splice(blockid, 1);
								updateView();
							}
						});
					});

					// Nested matrices
					$matrix.find('[role="matrix"]').each(function () {
						var $submatrix = $(this);
						var copy = $submatrix.parent().html();
						var $popup = $('<button type="button" class="btn btn-secondary btn-sm" role="matrix-popup"><i class="fa fa-external-link"></i> Blocks</button>').insertAfter($submatrix);
						$submatrix.attr('role', 'submatrix'); // prevent sub-matrix discovery

						var data = [];
						try {
							data = JSON.parse($submatrix.find('> input').val());
						} catch (e) {};

						$popup.on('click', function (e) {
							e.preventDefault();

							var form = false;
							var modal = sinaps.Modal.create({
								suicide: true,
								title: 'Edit block',

								onClose: function (e) {
									if (form) {
										data = form.blocks || [];
										updateHidden();
									}
								}
							});

							var $ok = $('<button class="btn btn-primary pull-right close-modal"><i class="fa fa-check"></i> Save</button>');
							var $cancel = $('<button class="btn btn-secondary close-modal">Cancel</button>');

							$ok.on('click', function (e) {
								form = _.merge({}, $form.serializeObject());
							});

							modal.$footer.append($ok);
							modal.$footer.append($cancel);

							var $content = $($.parseHTML(templates.modal.render({
								//matrix: copy
								matrix: sinaps.fieldTypes.matrix.templates.field.render({
									field: {
										name: name,
										value: data,
										blocks: $submatrix.find('> input').data('blocks')
									}
								})
							})));
							$content.find('[role="matrix"] > input').attr('name', 'blocks');

							modal.$main.append($content);

							$form = modal.$main.find('form:first');

							$('body').trigger('refresh-fields');

							modal.open();
						});

						updateHidden();
						function updateHidden () {
							$submatrix.nextAll('input[type="hidden"]').remove();

							_.each(_.paths(data), function (v, n) {
								var $hidden = $('<input type="hidden" name="" value="" />').insertAfter($submatrix);
								$hidden.attr('name', name + '[' + n.split('.').join('][') + ']');
								$hidden.val(v);
							});
						}
					});

					$('body').trigger('refresh-fields');
				}
			});
		});
	}
});
