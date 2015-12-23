$(function () {
	var uid = 0;
	var formUID = 0;
	var templates = {
		layouts: null
	};

	function downloadTemplate (tpl, url) {
		return function () {
			var promise = $.ajax({ url: url });
			promise.then(function (source) {
				templates[tpl] =  nunjucks.compile(source.replace(/(^\s+|\s+$)/g, ''));
			});
			return promise;
		}
	}

	downloadTemplate('layouts', '/admin/resources/js/plugins/builder/templates/layouts.twig')()
	.then(downloadTemplate('form-layout', '/admin/resources/js/plugins/builder/templates/form-layout.twig'))
	.then(downloadTemplate('form-field', '/admin/resources/js/plugins/builder/templates/form-field.twig'))
	.then(downloadTemplate('tabs', '/admin/resources/js/plugins/builder/templates/tabs.twig'))
	.then(downloadTemplate('fields', '/admin/resources/js/plugins/builder/templates/fields.twig'))
	.then(downloadTemplate('modal-paste', '/admin/resources/js/plugins/builder/templates/modal-paste.twig'))
	.then(downloadTemplate('modal-copy', '/admin/resources/js/plugins/builder/templates/modal-copy.twig'))
	.then(function () {
		downloadTemplateDone(templates);
	});

	function downloadTemplateDone (templates) {
		$('body').on('refresh-fields', function (e) {
			$('[role="builder-layouts"]:not([data-field-discovered])').attr('data-field-discovered', '').each(function () {
				var $input = $(this);
				var layouts = $input.val();
				var name = $input.attr('name');
				var label = $input.attr('title');
				var id = uid++;

				$input.removeAttr('name').removeAttr('value');

				try {
					layouts = JSON.parse(layouts);
				} catch (e) {
					layouts = [];
				}

				layouts.forEach(function (layout, i) {
					layout.__active = i == 0;
					layout.__uid = i;
				});

				function getSelectedId () {
					for (var a = 0, b = layouts.length; a < b; ++a) {
						if (layouts[a].__active) {
							return a;
						}
					}
					return -1;
				}

				var $view = null;
				updateView();
				function updateData () {
					var form = $view.closest('form').serializeObject();
					var path = name.replace(/\]\[/g, '.').replace(/(\[)/, '.').replace(/\]$/, '') + '.';
					for (var a = 0, b = layouts.length; a < b; ++a) {
						var p = path + a;
						layouts[a] = _.merge({
							__active: layouts[a].__active,
							__uid: a
						}, _.get(form, p));
					}
				}
				function updateView () {
					if ($view) {
						$view.remove();
						$view = null;
					}
					$view = $($.parseHTML(templates.layouts.render({
						uid: id,
						name: name,
						label: label,
						layouts: layouts
					})));
					$input.after($view);

					$('body').trigger('refresh-fields');

					// Maintain UI active state and data
					$view.on('mouseup', '> nav .nav-item:not(.ui-sortable-placeholder, .ui-sortable-helper)', function (e) {
						var id = $(this).index();
						for (var a = 0, b = layouts.length; a < b; ++a) {
							layouts[a].__active = false;
						}
						layouts[id].__active = true;
					});

					// Sort layouts
					$view.find('> nav ul.nav').sortable({
						tolerance: 'pointer',
						axis: 'y',
						items: 'li',

						stop: function (e, ui) {
							var order = $view.find('> nav ul.nav').children().map(function () {
								return $(this).data('layoutid');
							}).get();

							updateData();
							layouts = order.map(function (id, i) {
								layouts[id].__uid = i;
								return layouts[id];
							});
							updateView();
						}
					})

					// Paste layout
					$view.on('click', '> nav [role="paste"]', function (e) {
						e.preventDefault();

						showPasteModal(function (state) {
							if (state) {
								var layout;
								try {
									layout = JSON.parse(state.json);
								} catch (e) { }
								if (layout) {
									for (var a = 0, b = layouts.length; a < b; ++a) {
										layouts[a].__active = false;
									}
									if (layout.tabs.length > 0) {
										layout.tabs[0].__active = true;
									}
									updateData();
									layouts.push(_.merge(layout, {
										__active: true,
										__uid: layouts.length,
										handle: state.handle || (layout.handle + '_copy'),
										label: state.label || (layout.label + ' copy')
									}));
									updateView();
								}
							}
						});
					});

					// Copy layout
					$view.on('click', '> nav [role="copy"]', function (e) {
						e.preventDefault();

						var selected = getSelectedId();
						var form = $view.closest('form').serializeObject();
						var path = name.replace(/\]\[/g, '.').replace(/(\[)/, '.').replace(/\]$/, '') + '.' + selected;

						showCopyModal(_.get(form, path));
					});

					// Create layout
					$view.on('click', '> nav [role="create"]', function (e) {
						e.preventDefault();

						showFormModal('New layout', 'form-layout', {}, function (state) {
							if (state) {
								var layout = state;

								for (var a = 0, b = layouts.length; a < b; ++a) {
									layouts[a].__active = false;
								}
								updateData();
								layouts.push(_.merge(layout, {
									__active: true,
									__uid: layouts.length,
									tabs: []
								}));
								updateView();
							}
						});
					});

					// Edit layout
					$view.on('click', '> nav [role="edit"]', function (e) {
						e.preventDefault();

						var selected = getSelectedId();
						var form = $view.closest('form').serializeObject();
						var path = name.replace(/\]\[/g, '.').replace(/(\[)/, '.').replace(/\]$/, '') + '.' + selected;
						var state = _.get(form, path);

						showFormModal('Edit layout', 'form-layout', state, function (state) {
							if (state) {
								updateData();
								layouts[selected] = _.merge(layouts[selected], state);
								updateView();
							}
						});
					});

					// Delete layout
					$view.on('click', '> nav [role="remove"]', function (e) {
						e.preventDefault();

						var selected = getSelectedId();
						sinaps.Modal.confirm('Are you sure you want to remove this layout?', 'Remove layout', function (state) {
							if (state) {
								updateData();
								layouts.splice(selected, 1);
								layouts.forEach(function (layout, i) {
									layout.__active = i == 0 ? true : false;
									layout.__uid = i;
								});
								updateView();
							}
						}, ['Remove', 'Cancel']);
					});


				}
			});

			$('[role="builder-tabs"]:not([data-field-discovered])').attr('data-field-discovered', '').each(function () {
				var $input = $(this);
				var tabs = $input.val();
				var name = $input.attr('name');
				var label = $input.attr('title');
				var id = uid++;

				$input.removeAttr('name').removeAttr('value');

				try {
					tabs = JSON.parse(tabs);
				} catch (e) {
					tabs = [];
				}

				tabs.forEach(function (tab, i) {
					tab.__active = i == 0;
					tab.__uid = i;
				});

				function getSelectedId () {
					for (var a = 0, b = tabs.length; a < b; ++a) {
						if (tabs[a].__active) {
							return a;
						}
					}
					return -1;
				}

				var $view = null;
				updateView();
				function updateData () {
					var form = $view.closest('form').serializeObject();
					var path = name.replace(/\]\[/g, '.').replace(/(\[)/, '.').replace(/\]$/, '') + '.';
					for (var a = 0, b = tabs.length; a < b; ++a) {
						var p = path + a;
						tabs[a] = _.merge({
							__active: tabs[a].__active,
							__uid: a
						}, _.get(form, p));
					}
				}
				function updateView () {
					if ($view) {
						$view.remove();
						$view = null;
					}
					$view = $($.parseHTML(templates.tabs.render({
						uid: id,
						name: name,
						label: label,
						tabs: tabs
					})));
					$input.after($view);

					$('body').trigger('refresh-fields');

					// Maintain UI active state and data
					$view.on('mouseup', '> nav .nav-item:not(.ui-sortable-placeholder, .ui-sortable-helper)', function (e) {
						var id = $(this).index();
						for (var a = 0, b = tabs.length; a < b; ++a) {
							tabs[a].__active = false;
						}
						tabs[id].__active = true;
					});

					// Sort tabs
					$view.find('> nav ul.nav').sortable({
						tolerance: 'pointer',
						axis: 'y',
						items: 'li',

						stop: function (e, ui) {
							var order = $view.find('> nav ul.nav').children().map(function () {
								return $(this).data('tabid');
							}).get();

							updateData();
							tabs = order.map(function (id, i) {
								tabs[id].__uid = i;
								return tabs[id];
							});
							updateView();
						}
					})

					// Paste tab
					$view.on('click', '> nav [role="paste"]', function (e) {
						e.preventDefault();

						showPasteModal(function (state) {
							if (state) {
								var tab;
								try {
									tab = JSON.parse(state.json);
								} catch (e) { }
								if (tab) {
									for (var a = 0, b = tabs.length; a < b; ++a) {
										tabs[a].__active = false;
									}
									updateData();
									tabs.push(_.merge(tab, {
										__active: true,
										__uid: tabs.length,
										handle: state.handle || (tab.handle + '_copy'),
										label: state.label || (tab.label + ' copy')
									}));
									updateView();
								}
							}
						});
					});

					// Copy tab
					$view.on('click', '> nav [role="copy"]', function (e) {
						e.preventDefault();

						var selected = getSelectedId();
						var form = $view.closest('form').serializeObject();
						var path = name.replace(/\]\[/g, '.').replace(/(\[)/, '.').replace(/\]$/, '') + '.' + selected;

						showCopyModal(_.get(form, path));
					});

					// Create tab
					$view.on('click', '> nav [role="create"]', function (e) {
						e.preventDefault();

						showFormModal('New tab', 'form-layout', {}, function (state) {
							if (state) {
								var tab = state;

								for (var a = 0, b = tabs.length; a < b; ++a) {
									tabs[a].__active = false;
								}
								updateData();
								tabs.push(_.merge(tab, {
									__active: true,
									__uid: tabs.length,
									fields: []
								}));
								updateView();
							}
						});
					});

					// Edit tab
					$view.on('click', '> nav [role="edit"]', function (e) {
						e.preventDefault();

						var selected = getSelectedId();
						var form = $view.closest('form').serializeObject();
						var path = name.replace(/\]\[/g, '.').replace(/(\[)/, '.').replace(/\]$/, '') + '.' + selected;
						var state = _.get(form, path);

						showFormModal('Edit tab', 'form-layout', state, function (state) {
							if (state) {
								updateData();
								tabs[selected] = _.merge(tabs[selected], state);
								updateView();
							}
						});
					});

					// Delete tab
					$view.on('click', '> nav [role="remove"]', function (e) {
						e.preventDefault();

						var selected = getSelectedId();
						sinaps.Modal.confirm('Are you sure you want to remove this tab?', 'Remove layout', function (state) {
							if (state) {
								updateData();
								tabs.splice(selected, 1);
								tabs.forEach(function (tab, i) {
									tab.__active = i == 0 ? true : false;
									tab.__uid = i;
								});
								updateView();
							}
						}, ['Remove', 'Cancel']);
					});
				}
			});

			$('[role="builder-fields"]:not([data-field-discovered])').attr('data-field-discovered', '').each(function () {
				var $input = $(this);
				var fields = $input.val();
				var name = $input.attr('name');
				var id = uid++;

				$input.removeAttr('name').removeAttr('value');

				try {
					fields = JSON.parse(fields);
				} catch (e) {
					fields = [];
				}

				fields.forEach(function (field, i) {
					field.__uid = i;
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
					$view = $($.parseHTML(templates.fields.render({
						uid: id,
						name: name,
						fields: fields.map(function (field) {
							return _.merge({
								flatten: _.paths(_.omit(field, '__uid'))
							}, field);
						})
					})));
					$input.after($view);

					$('body').trigger('refresh-fields');

					$('.table-structure', $view).tableStructure({
						handleColumn: 0,
						maxDepth: 0,
						onChange: function (e, data) {
							updateData();
							fields = data.sort(function (a, b) { return a.order - b.order; }).map(function (d, i) {
								fields[d.id - 1].__uid = i;
								return fields[d.id - 1];
							});
							updateView();
						}
					});

					// Paste field
					$view.on('click', '[role="paste"]', function (e) {
						e.preventDefault();

						showPasteModal(function (state) {
							if (state) {
								var field;
								try {
									field = JSON.parse(state.json);
								} catch (e) { }
								if (field) {
									updateData();
									fields.push(_.merge(field, {
										__uid: fields.length,
										handle: state.handle || (field.handle + '_copy'),
										label: state.label || (field.label + ' copy')
									}));
									updateView();
								}
							}
						});
					});

					// Copy field
					$view.on('click', '[role="copy"]', function (e) {
						e.preventDefault();

						var selected = $(this).data('fieldid');
						var form = $view.closest('form').serializeObject();
						var path = name.replace(/\]\[/g, '.').replace(/(\[)/, '.').replace(/\]$/, '') + '.' + selected;

						showCopyModal(_.get(form, path));
					});

					// Create field
					$view.on('click', '[role="create"]', function (e) {
						e.preventDefault();

						showFieldForm('New field', {}, function (state) {
							if (state) {
								var field = state;

								for (var a = 0, b = fields.length; a < b; ++a) {
									fields[a].__active = false;
								}
								updateData();
								fields.push(_.merge(field, {
									__uid: fields.length
								}));
								updateView();
							}
						});
					});

					// Edit field
					$view.on('click', '[role="edit"]', function (e) {
						e.preventDefault();

						var selected = $(this).data('fieldid');
						var form = $view.closest('form').serializeObject();
						var path = name.replace(/\]\[/g, '.').replace(/(\[)/, '.').replace(/\]$/, '') + '.' + selected;
						var state = _.get(form, path);

						//showFormModal('Edit tab', 'form-layout', state, function (state) {
						showFieldForm('Edit field', state, function (state) {
							if (state) {
								updateData();
								fields[selected] = _.merge(fields[selected], state);
								updateView();
							}
						});
					});

					// Delete field
					$view.on('click', '[role="remove"]', function (e) {
						e.preventDefault();

						var selected = $(this).data('fieldid');
						sinaps.Modal.confirm('Are you sure you want to remove this field?', 'Remove layout', function (state) {
							if (state) {
								updateData();
								fields.splice(selected, 1);
								fields.forEach(function (field, i) {
									field.__uid = i;
								});
								updateView();
							}
						}, ['Remove', 'Cancel']);
					});

					function showFieldForm (title, state, callback) {
						var id = formUID++;
						var form = false;
						var modal = sinaps.Modal.create({
							suicide: true,
							title: title,

							onClose: function (e) {
								if (typeof callback === 'function') {
									callback(form);
								}
							}
						});
						var $form;
						var $ok = $('<button class="btn btn-primary pull-right close-modal"><i class="fa fa-check"></i> Save</button>');
						var $cancel = $('<button class="btn btn-secondary close-modal">Cancel</button>');

						$ok.on('click', function (e) {
							form = _.merge({}, $form.serializeObject());
						});

						modal.$footer.append($ok);
						modal.$footer.append($cancel);

						updateView();
						function updateState () {
							state = _.merge({}, $form.serializeObject());
						}
						function updateView () {
							modal.$main.empty().append(templates['form-field'].render({
								__uid: id,
								__fieldTypes: sinaps.fieldTypes,
								field: state,
								settings: typeof sinaps.fieldTypes[state.input] === 'undefined' ? '' : sinaps.fieldTypes[state.input].templates.settings.render(state)
							}));

							$('body').trigger('refresh-fields');

							$form = modal.$main.find('form:first');
							modal.$modal.find('[name="input"]').on('change', function (e) {
								updateState();
								updateView();
							});
						}

						return modal.open();
					}
				}
			});
		}).trigger('refresh-fields');

		function showPasteModal (callback) {

			var form = false;
			var modal = sinaps.Modal.create({
				suicide: true,
				title: 'Paste JSON',

				onClose: function (e) {
					if (typeof callback === 'function') {
						callback(form);
					}
				}
			});

			modal.$main.append(templates['modal-paste'].render({

			}));

			var $form = modal.$main.find('form:first');

			var $ok = $('<button class="btn btn-primary pull-right close-modal"><i class="fa fa-paste"></i> Paste</button>');
			var $cancel = $('<button class="btn btn-secondary close-modal">Cancel</button>');

			$ok.on('click', function (e) {
				form = _.merge({}, $form.serializeObject());
			});

			modal.$footer.append($ok);
			modal.$footer.append($cancel);

			$('body').trigger('refresh-fields');

			return modal.open();
		}

		function showCopyModal (data) {
			var modal = sinaps.Modal.create({
				suicide: true,
				title: 'Copy'
			});

			modal.$main.append(templates['modal-copy'].render({
				data: data
			}));

			modal.$footer.append('<button class="btn btn-primary pull-right close-modal">Close</button>');

			$('body').trigger('refresh-fields');

			return modal.open();
		}

		function showFormModal (title, which, form, callback) {
			var id = formUID++;
			var modal = sinaps.Modal.create({
				suicide: true,
				title: title,

				onClose: function (e) {
					if (typeof callback === 'function') {
						callback(form);
					}
				}
			});

			modal.$main.append(templates[which].render(_.merge({
				formUID: id
			}, form)));

			form = false;

			var $form = modal.$main.find('form:first');

			var $ok = $('<button class="btn btn-primary pull-right close-modal"><i class="fa fa-check"></i> Save</button>');
			var $cancel = $('<button class="btn btn-secondary close-modal">Cancel</button>');

			$ok.on('click', function (e) {
				form = _.merge({}, $form.serializeObject());
			});

			modal.$footer.append($ok);
			modal.$footer.append($cancel);

			$('body').trigger('refresh-fields');

			return modal.open();
		}
	}
});
