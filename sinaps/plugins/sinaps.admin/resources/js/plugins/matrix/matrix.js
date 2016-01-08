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

		// TODO updateView retain scroll position

		$('body').on('refresh-fields', function (e) {
			$('[role="matrix"] > input[data-blocks]:not([data-field-discovered])').attr('data-field-discovered', '').each(function () {
				var $input = $(this);
				var $matrix = $input.parent();
				var id = uid++;
				var name = $input.attr('name');
				var dataTypes = $input.data('blocks');
				var blockTypes = {};
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

				dataTypes.forEach(function (type) {
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

				var $view = null;
				updateView();
				function updateData () {
					var form = $view.closest('form').serializeObject();
					var path = name.replace(/\]\[/g, '.').replace(/(\[)/, '.').replace(/\]$/, '') + '.';
					for (var a = 0, b = fields.length; a < b; ++a) {
						var p = path + a;
						fields[a] = _.merge({
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
						blockTypes: _.values(blockTypes),
						blocks: blocks.map(function (block) {
							return _.merge({
								__blockType: blockTypes[block.type].label,
								__template: blockTypes[block.type].template.render(block)
							}, block);
						})
					})));
					$input.after($view);

					$('body').trigger('refresh-fields');

					// Popup
					if (depth > 0) {
						var $popup = $matrix.find('[role="matrix-popup"]');
						$popup.on('click', function (e) {
							e.preventDefault();

							var form = false;
							var modal = sinaps.Modal.create({
								suicide: true,
								title: 'Edit block',

								onClose: function (e) {
									if (form) {
										blocks = form.blocks || [];
										updateHidden();
										updateView();
									}
								}
							});

							var $ok = $('<button class="btn btn-primary pull-right close-modal"><i class="fa fa-check"></i> Save</button>');
							var $cancel = $('<button class="btn btn-secondary close-modal">Cancel</button>');

							$ok.on('click', function (e) {
								form = _.merge({}, $form.serializeObject());
							});

							modal.$header.append('<div class="btn-group pull-right m-r-md" role="changelanguage">\
								<button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\
									'+ sinaps.currentLang.toUpperCase() +'\
								</button>\
								<div class="dropdown-menu">\
									'+ sinaps.languages.map(function (lang) {
										return '<a class="dropdown-item" href="#" data-switch-lang="' + lang.toLowerCase() + '">' + lang.toUpperCase() + '</a>';
									}).join('') +'\
								</div>\
							</div>');

							modal.$footer.append($ok);
							modal.$footer.append($cancel);

							var $content = $($.parseHTML(templates.modal.render({
								//matrix: copy
								matrix: sinaps.fieldTypes.matrix.templates.field.render({
									field: {
										name: name,
										value: blocks,
										blocks: _.values(blockTypes)
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
					}

					// Inline actions
					else {
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

						$matrix.find('[role="matrix-handle"]').on('mousedown', function (e) {
							var $collapse = $(this).closest('[data-toggle="collapse"]');

							$($collapse.data('target')).collapse('hide');
						});

						// Sort blocks
						$matrix.find('ul.blocks').sortable({
							tolerance: 'pointer',
							axis: 'y',
							handle: '[role="matrix-handle"]',

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

						// Remove block
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
							}, ['Remove', 'Cancel']);
						});

						// Add block
						$matrix.find('[data-type]').on('click', function (e) {
							e.preventDefault();
							var type = $(this).data('type');

							updateData();
							blocks.push({
								__active: true,
								__uid: blocks.length,
								type: type
							});
							updateView();
						});
					}

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

					function updateHidden () {
						$popup.nextAll('input[type="hidden"]').remove();
						var $parent = $popup.parent();

						_.each(_.paths(_.map(blocks, function (block) { return _.omit(block, '__uid', '__active', '_id'); })), function (v, n) {
							var $hidden = $('<input type="hidden" name="" value="" />').appendTo($parent);
							$hidden.attr('name', name + '[' + n.split('.').join('][') + ']');
							$hidden.val(v);
						});

						updateData();
					}
				}
			});
		});
	}
});
