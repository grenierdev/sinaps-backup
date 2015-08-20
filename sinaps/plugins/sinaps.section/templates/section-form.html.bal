{% extends "sinaps.admin/_frame.html" %}

{% set title = 'Sections' %}
{% set subtitle = '' %}
{% set breadcrumbs = [{
	href: '/admin/sections/',
	title: 'Sections'
},{
	href: '/admin/sections/~edit/' + section.name,
	title: 'Edit ' + section.name
}] %}

{% import 'sinaps.admin/components/schema.html' as schemaForm %}
{% import 'sinaps.admin/components/fields.html' as fields %}

{% block content %}

	<form method="post">
		<div class="row">
			<div class="col-md-9">
				<div class="portlet light">
					<div class="portlet-body form">
						<div class="form-body">

							{{ fields.field({
								type: 'text',
								name: 'handle',
								label: 'Handle',
								instructions: 'Used as a reference key',
								value: section.get('handle'),
								required: true,
								autofocus: true
							}) }}

							{{ fields.field({
								type: 'text',
								name: 'title',
								label: 'Title',
								instructions: 'Only used as the title in the administration panel',
								value: section.title,
								required: true
							}) }}

							{% for lang in sinaps.config.languages %}
								{{ fields.field({
									type: 'text',
									name: 'url[' + lang + ']',
									label: 'URL (' + lang|upper + ')',
									instructions: 'Optional, Nunjucks syntax allowed',
									value: section.get('url.' + lang)
								}) }}
							{% endfor %}

							{{ fields.field({
								type: 'text',
								name: 'template',
								label: 'Template',
								instructions: 'When URL is requested, this template will be used to render the content',
								value: section.template
							}) }}

							<input type="hidden" name="layouts" value="{{ section.layouts|json|escape }}" />
						</div>
					</div>
				</div>
			</div>
			<div class="col-md-3">
				<div class="portlet light">
					<div class="portlet-body form">
						<div class="form-body">
							{{ schemaForm.langSwitcher() }}

							{{ schemaForm.layoutSwitcher(schema) }}
						</div>
						<div class="form-actions">
							<div class="row">
								<div class="col-md-offset-3 col-md-9">
									<button type="submit" class="btn btn-sm green">
										<i class="fa fa-check"></i>
										Save
									</button>
									<button type="reset" class="btn btn-sm default">Cancel</button>
								</div>
							</div>
						</div>
					</div>
				</div>

			</div>
		</div>
		<div class="row">
			<div class="col-md-9">

				<div class="portlet light">
					<div class="portlet-title">
						<div class="caption">
							Layouts &amp; Tabs &amp; Fields
						</div>
						<div class="actions">
							<div class="btn-toolbar">
								<div class="btn-group btn-group-sm btn-group-solid">
									<a class="btn default blue" href="#createlayout">
										<i class="fa fa-plus"></i>
									</a>
									<a class="btn default blue" href="#pastelayout">
										<i class="fa fa-paste"></i>
									</a>
									<a class="btn default blue disabled" href="#copylayout">
										<i class="fa fa-copy"></i>
									</a>
									<a class="btn default blue disabled" href="#editlayout">
										<i class="fa fa-edit"></i>
									</a>
									<a class="btn default blue disabled" href="#deletelayout">
										<i class="fa fa-trash-o"></i>
									</a>
								</div>
							</div>

						</div>
					</div>
					<div class="portlet-body" id="layouts">

					</div>
				</div>
			</div>
		</div>
	</form>

{% endblock %}

{% block footJS %}
	<link href="/admin/resources/plugins/jquery-ui/jquery-ui.min.css" rel="stylesheet" type="text/css"/>
	<script src="/admin/resources/plugins/jquery-ui/jquery-ui.min.js" type="text/javascript"></script>



	<script type="text/x-template" name="layoutsForm">
		{% raw %}
			<div class="tabbable-line">
				<ul class="nav nav-tabs">
					<li>
						<a>
							Layouts
						</a>
					</li>
					{% for layout in layouts %}
						<li {% if layout.active %}class="active"{% endif %}>
							<a href="#tab_{{ layout.handle }}" data-toggle="tab" aria-expanded="true" data-layout="{{ layout.handle }}">
								{{layout.label}}
							</a>
						</li>
					{% endfor %}
				</ul>
				<div class="tab-content">
					{% for layout in layouts %}
						<div id="tab_{{ layout.handle }}" class="tab-pane {% if layout.active %}active{% endif %}">
							<div class="row">
								<div class="col-xs-3">
									<ul class="nav nav-tabs tabs-left">
										<li>
											<a>
												Tabs
											</a>
										</li>
										{% for tab in layout.tabs %}
											<li {% if tab.active %}class="active"{% endif %}>
												<a href="#tab_{{ layout.handle }}_{{ tab.handle }}" data-toggle="tab" aria-expanded="true" data-layout="{{ layout.handle }}" data-tab="{{ tab.handle }}">
													{{tab.label}}
												</a>
											</li>
										{% endfor %}
									</ul>

									<div class="btn-toolbar">
										<div class="btn-group btn-group-sm btn-group-solid">
											<a class="btn default purple" href="#createtab" data-layout="{{ layout.handle }}">
												<i class="fa fa-plus"></i>
											</a>
											<a class="btn default purple" href="#pastetab" data-layout="{{ layout.handle }}">
												<i class="fa fa-paste"></i>
											</a>
											<a class="btn default purple {% if layout.tabs.length == 0 %}disabled{% endif %}" href="#copytab" data-layout="{{ layout.handle }}">
												<i class="fa fa-copy"></i>
											</a>
											<a class="btn default purple {% if layout.tabs.length == 0 %}disabled{% endif %}" href="#edittab" data-layout="{{ layout.handle }}">
												<i class="fa fa-edit"></i>
											</a>
											<a class="btn default purple {% if layout.tabs.length == 0 %}disabled{% endif %}" href="#deletetab" data-layout="{{ layout.handle }}">
												<i class="fa fa-trash-o"></i>
											</a>
										</div>
									</div>
								</div>
								<div class="col-xs-9">
									<div class="tab-content">
										{% for tab in layout.tabs %}
											<div id="tab_{{ layout.handle }}_{{ tab.handle }}" class="tab-pane {% if tab.active %}active{% endif %}">
												<table class="table table-hover">
													<thead>
														<tr>
															<th width="1"></th>
															<th>Title</th>
															<th>Type</th>
															<th></th>
														</tr>
													</thead>
													<tbody>
														{% for field in tab.fields %}
															<tr>
																<td><i class="fa fa-reorder"></i></td>
																<td>{{ field.label }} ({{ field.handle }})</td>
																<td>{{ field.input }}</td>
																<td class="text-nowrap text-right">
																	<div class="btn-group btn-group-xs btn-group-solid">
																		<a class="btn btn-xs default yellow" href="#copyfield" data-layout="{{ layout.handle }}" data-tab="{{ tab.handle }}" data-field="{{ field.handle }}">
																			<i class="fa fa-copy"></i>
																		</a>
																		<a class="btn btn-xs default yellow" href="#editfield" data-action="edit" data-layout="{{ layout.handle }}" data-tab="{{ tab.handle }}" data-field="{{ field.handle }}">
																			<i class="fa fa-edit"></i>
																		</a>
																		<a class="btn btn-xs default yellow" href="#deletefield" data-layout="{{ layout.handle }}" data-tab="{{ tab.handle }}" data-field="{{ field.handle }}">
																			<i class="fa fa-trash-o"></i>
																		</a>

																	</div>
																</td>
															</tr>
														{% endfor %}
													</tbody>
												</table>

												<div class="btn-group btn-group-sm btn-group-solid">
													<a class="btn default yellow" href="#createfield" data-action="create" data-layout="{{ layout.handle }}" data-tab="{{ tab.handle }}">
														<i class="fa fa-plus"></i>
													</a>
													<a class="btn default yellow" href="#pastefield" data-layout="{{ layout.handle }}" data-tab="{{ tab.handle }}">
														<i class="fa fa-paste"></i>
													</a>
												</div>
											</div>
										{% endfor %}
									</div>
								</div>
							</div>
						</div>
					{% endfor %}
				</div>
			</div>
		{% endraw %}
	</script>

	<script type="text/x-template" name="copyModal">
		<div class="modal-dialog">
			<div class="modal-content">
				<form>
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
						<h4 class="modal-title">Copy</h4>
					</div>
					<div class="modal-body">
						{{ fields.textareaField({
							name: 'json',
							label: 'JSON data',
							instructions: 'Raw data',
							value: '{{ json|escape }}',
							rows: 10,
							autofocus: true
						}) }}
					</div>
					<div class="modal-footer">
						<button type="button" class="btn default" data-dismiss="modal">Close</button>
					</div>
				</form>
			</div>
		</div>
	</script>

	<script type="text/x-template" name="pasteModal">
		<div class="modal-dialog">
			<div class="modal-content">
				<form>
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
						<h4 class="modal-title">Paste layout</h4>
					</div>
					<div class="modal-body">
						{{ fields.textareaField({
							name: 'json',
							label: 'JSON data',
							instructions: 'Raw data',
							rows: 10,
							required: true,
							autofocus: true
						}) }}

						{{ fields.textField({
							name: 'handle',
							label: 'Paste as new handle',
							instructions: 'This is the new refenrece key',
							required: true
						}) }}

						{{ fields.textField({
							name: 'label',
							label: 'Paste as new label',
							instructions: 'Only used as the title in the administration panel'
						}) }}

					</div>
					<div class="modal-footer">
						<button type="button" class="btn default" data-dismiss="modal">Close</button>
						<button type="submit" class="btn blue">
							Paste
						</button>
					</div>
				</form>
			</div>
		</div>
	</script>

	<script type="text/x-template" name="deleteModal">
		<div class="modal-dialog">
			<div class="modal-content">
				<form>
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
						<h4 class="modal-title">Remove</h4>
					</div>
					<div class="modal-body">
						Are you sure you want to remove this item?
					</div>
					<div class="modal-footer">
						<button type="button" class="btn default" data-dismiss="modal">Cancel</button>
						<button type="submit" class="btn red">Remove</button>
					</div>
				</form>
			</div>
		</div>
	</script>

	<script type="text/x-template" name="layoutModal">
		<div class="modal-dialog">
			<div class="modal-content">
				<form>
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
						<h4 class="modal-title">{% raw %}{% if __action == 'add' %}New layout{% else %}Edit layout{% endif %}{% endraw %}</h4>
					</div>
					<div class="modal-body">
						{{ fields.textField({
							name: 'handle',
							label: 'Handle',
							instructions: 'Used as a reference key',
							value: '{{ handle|escape }}',
							required: true,
							autofocus: true
						}) }}

						{{ fields.textField({
							name: 'label',
							label: 'Label',
							instructions: 'Only used as the title in the administration panel',
							value: '{{ label|escape }}',
							required: true
						}) }}
					</div>
					<div class="modal-footer">
						<button type="button" class="btn default" data-dismiss="modal">Cancel</button>
						<button type="submit" class="btn blue">
							{% raw %}{% if __action == 'add' %}Add{% else %}Save{% endif %}{% endraw %}
						</button>
					</div>
				</form>
			</div>
		</div>
	</script>

	<script type="text/x-template" name="tabModal">
		<div class="modal-dialog">
			<div class="modal-content">
				<form>
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
						<h4 class="modal-title">{% raw %}{% if __action == 'add' %}New tab{% else %}Edit tab{% endif %}{% endraw %}</h4>
					</div>
					<div class="modal-body">

						{{ fields.textField({
							name: 'handle',
							label: 'Handle',
							instructions: 'Used as a reference key',
							value: '{{ handle|escape }}',
							required: true,
							autofocus: true
						}) }}

						{{ fields.textField({
							name: 'label',
							label: 'Label',
							instructions: 'Only used as the title in the administration panel',
							value: '{{ label|escape }}',
							required: true
						}) }}
					</div>
					<div class="modal-footer">
						<button type="button" class="btn default" data-dismiss="modal">Cancel</button>
						<button type="submit" class="btn blue">
							{% raw %}{% if __action == 'add' %}Add{% else %}Save{% endif %}{% endraw %}
						</button>
					</div>
				</form>
			</div>
		</div>
	</script>

	<script type="text/x-template" name="fieldModal">
		<div class="modal-dialog">
			<div class="modal-content">
				<form>
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
						<h4 class="modal-title">{% raw %}{% if __action == 'add' %}New field{% else %}Edit field{% endif %}{% endraw %}</h4>
					</div>
					<div class="modal-body">

						{{ fields.textField({
							name: 'handle',
							label: 'Handle',
							instructions: 'Used as a reference key',
							value: '{{ handle|escape }}',
							autofocus: true,
							required: true
						}) }}

						{{ fields.textField({
							name: 'label',
							label: 'Label',
							instructions: 'Only used as the title in the administration panel',
							value: '{{ label|escape }}',
							required: true
						}) }}

						{{ fields.textField({
							name: 'instructions',
							label: 'Instructions',
							instructions: 'Shown under the field (like this)',
							value: '{{ instructions|escape }}'
						}) }}

					{% raw %}
						<div class="form-group form-sm-line-input">
							<div class="md-checkbox inline">
								<input type="checkbox" class="md-check" id="required" name="required" {% if required %}checked{% endif %} />
								<label for="required">
									<span></span>
									<span class="check"></span>
									<span class="box"></span>
								</label>
							</div>
							<label for="required">This field is required</label>
						</div>

						<div class="form-group form-sm-line-input">
							<div class="md-checkbox inline">
								<input type="checkbox" class="md-check" id="index" name="index" {% if index %}checked{% endif %} />
								<label for="index{{ __uid }}">
									<span></span>
									<span class="check"></span>
									<span class="box"></span>
								</label>
							</div>
							<label for="index">This field is indexed</label>
						</div>

						<div class="form-group form-sm-line-input">
							<div class="md-checkbox inline">
								<input type="checkbox" class="md-check" id="lang" name="lang" {% if lang %}checked{% endif %} />
								<label for="lang">
									<span></span>
									<span class="check"></span>
									<span class="box"></span>
								</label>
							</div>
							<label for="lang">This field is translatable</label>
						</div>

						{% set input = input|default("text") %}

					{% endraw %}
						<div class="form-group form-md-line-input">
							<select class="bs-select form-control" id="input" name="input" required>
								{% for fieldtype in sinaps.require('sinaps.admin').fieldTypes %}
									<option value="{{ fieldtype.handle }}" {{ '{% if input == "' + fieldtype.handle + '" %}selected{% endif %}' }}>{{ fieldtype.label }}</option>
								{% endfor %}
							</select>
							<label for="input">Field type</label>
							<span class="help-block">Changing this may result in data lost</span>
						</div>

						{% for handle, fieldType in sinaps.require('sinaps.admin').fieldTypes %}
							{{ '{% if input == "' + fieldType.handle + '" %}' }}
								{{ fieldType.getSettingTemplate() }}
							{{ '{% endif %}' }}
						{% endfor %}
					</div>
					<div class="modal-footer">
						<button type="button" class="btn default" data-dismiss="modal">Cancel</button>
						<button type="submit" class="btn blue">
							{% raw %}{% if __action == 'add' %}Add{% else %}Save{% endif %}{% endraw %}
						</button>
					</div>
				</form>
			</div>
		</div>
	</script>

	<script type="text/x-template" name="blockForm">
		{% raw %}
			<div class="form-group">
				<div class="row">
					<div class="col-xs-3">
						<ul class="nav nav-tabs tabs-left">
							<li>
								<a>
									Blocks
								</a>
							</li>
							{% for block in blocks %}
								<li {% if block.active %}class="active"{% endif %}>
									<a href="#block_{{ __uid }}_{{ block.handle }}" data-toggle="tab" aria-expanded="true" data-block="{{ block.handle }}">
										{{ block.label }}
									</a>
								</li>
							{% endfor %}
						</ul>

						<div class="btn-toolbar">
							<div class="btn-group btn-group-sm btn-group-solid">
								<a class="btn default purple" href="#createblock">
									<i class="fa fa-plus"></i>
								</a>
								<a class="btn default purple" href="#pasteblock">
									<i class="fa fa-paste"></i>
								</a>
								<a class="btn default purple {% if blocks.length == 0 %}disabled{% endif %}" href="#copyblock">
									<i class="fa fa-copy"></i>
								</a>
								<a class="btn default purple {% if blocks.length == 0 %}disabled{% endif %}" href="#editblock">
									<i class="fa fa-edit"></i>
								</a>
								<a class="btn default purple {% if blocks.length == 0 %}disabled{% endif %}" href="#deleteblock">
									<i class="fa fa-trash-o"></i>
								</a>
							</div>
						</div>
					</div>
					<div class="col-xs-9">
						<div class="tab-content">
							{% for block in blocks %}
								<div id="block_{{ __uid }}_{{ block.handle }}" class="tab-pane {% if block.active %}active{% endif %}">
									<table class="table table-hover">
										<thead>
											<tr>
												<th width="1"></th>
												<th>Title</th>
												<th>Type</th>
												<th></th>
											</tr>
										</thead>
										<tbody>
											{% for field in block.fields %}
												<tr>
													<td><i class="fa fa-reorder"></i></td>
													<td>{{ field.label }} ({{ field.handle }})</td>
													<td>{{ field.input }}</td>
													<td class="text-nowrap text-right">
														<div class="btn-group btn-group-xs btn-group-solid">
															<a class="btn btn-xs default yellow" href="#copyfield" data-block="{{ block.handle }}" data-field="{{ field.handle }}">
																<i class="fa fa-copy"></i>
															</a>
															<a class="btn btn-xs default yellow" href="#editfield" data-action="edit" data-block="{{ block.handle }}" data-field="{{ field.handle }}">
																<i class="fa fa-edit"></i>
															</a>
															<a class="btn btn-xs default yellow" href="#deletefield" data-block="{{ block.handle }}" data-field="{{ field.handle }}">
																<i class="fa fa-trash-o"></i>
															</a>

														</div>
													</td>
												</tr>
											{% endfor %}
										</tbody>
									</table>

									<div class="btn-group btn-group-sm btn-group-solid">
										<a class="btn default yellow" href="#createfield" data-action="create" data-block="{{ layout.handle }}">
											<i class="fa fa-plus"></i>
										</a>
										<a class="btn default yellow" href="#pastefield" data-block="{{ layout.handle }}">
											<i class="fa fa-paste"></i>
										</a>
									</div>
								</div>
							{% endfor %}
						</div>
					</div>
				</div>
			</div>
		{% endraw %}
	</script>

	<script type="text/x-template" name="blockModal">
		<div class="modal-dialog">
			<div class="modal-content">
				<form>
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>
						<h4 class="modal-title">{% raw %}{% if __action == 'add' %}New block{% else %}Edit block{% endif %}{% endraw %}</h4>
					</div>
					<div class="modal-body">

						{{ fields.textField({
							name: 'handle',
							label: 'Handle',
							instructions: 'Used as a reference key',
							value: '{{ handle|escape }}',
							required: true,
							autofocus: true
						}) }}

						{{ fields.textField({
							name: 'label',
							label: 'Label',
							instructions: 'Only used as the title in the administration panel',
							value: '{{ label|escape }}',
							required: true
						}) }}
					</div>
					<div class="modal-footer">
						<button type="button" class="btn default" data-dismiss="modal">Cancel</button>
						<button type="submit" class="btn blue">
							{% raw %}{% if __action == 'add' %}Add{% else %}Save{% endif %}{% endraw %}
						</button>
					</div>
				</form>
			</div>
		</div>
	</script>

	<script>
		$(function () {

			var layoutsState = {{ section.layouts|json }},
				$layoutsInput = $(':input[name="layouts"]'),
				$layoutsContainer = $('#layouts');

			var templates = {
				layouts: nunjucks.compile($('script[name="layoutsForm"]').html()),
				copy: nunjucks.compile($('script[name="copyModal"]').html()),
				paste: nunjucks.compile($('script[name="pasteModal"]').html()),
				delete: nunjucks.compile($('script[name="deleteModal"]').html()),
				layout: nunjucks.compile($('script[name="layoutModal"]').html()),
				tab: nunjucks.compile($('script[name="tabModal"]').html()),
				field: nunjucks.compile($('script[name="fieldModal"]').html()),
				blocks: nunjucks.compile($('script[name="blockForm"]').html()),
				block: nunjucks.compile($('script[name="blockModal"]').html()),
			};

			// Initial state
			for (var a = 0, b = layoutsState.length; a < b; ++a) {
				layoutsState[a].active = a == 0;

				for (var c = 0, d = layoutsState[a].tabs.length; c < d; ++c) {
					layoutsState[a].tabs[c].active = c == 0;
				}
			}

			var uid = 0;

			// Refresh layouts form
			var updateLayouts = function () {

				// Render
				$layoutsContainer.empty().html(templates.layouts.render({
					layouts: layoutsState
				}));

				// Maintain active state
				$layoutsContainer.find('> .tabbable-line > .nav-tabs > li:not(:first) > a').on('click', function (e) {
					var id = $(this).attr('href').substr(1).split('_').slice(1);
					for (var a = 0, b = layoutsState.length; a < b; ++a) {
						layoutsState[a].active = layoutsState[a].handle == id[0];
					}
				});
				$layoutsContainer.find('> .tabbable-line > .tab-content .nav-tabs > li:not(:first) > a').on('click', function (e) {
					var id = $(this).attr('href').substr(1).split('_').slice(1);
					for (var a = 0, b = layoutsState.length; a < b; ++a) {
						if (layoutsState[a].handle == id[0]) {
							for (var c = 0, d = layoutsState[a].tabs.length; c < d; ++c) {
								layoutsState[a].tabs[c].active = layoutsState[a].tabs[c].handle == id[1];
							}
						}
					}
				});

				// Reorder tabs & fields
				// TODO change order in state
				$layoutsContainer.find('.nav-tabs').sortable({
					items: 'li:not(:first)'
				});
				$layoutsContainer.find('.tab-pane tbody').sortable({
					handle: '.fa-reorder',
					axis: 'y',
					helper: function (e, $tr) {
						var widths = $tr.children('td').map(function () { return $(this).width(); }).get(),
							$clone = $tr.clone(false, false);
						$clone.children('td').each(function (i) {
							$(this).width(widths[i]);
						});
						return $clone;
					}
				});

				// Disable edit/delete if no items
				$('[href="#copylayout"], [href="#editlayout"], [href="#deletelayout"]').toggleClass('disabled', layoutsState.length == 0);

				// Update input with current state
				var save = _.map(layoutsState, function (layout) {
					return _.extend(
						_.omit(layout, 'active', 'tabs'),
						{
							tabs: _.map(layout.tabs, function (tab) {
								return _.omit(tab, 'active');
							})
						}
					)
				});
				$layoutsInput.val(JSON.stringify(save));
			};
			updateLayouts();

			// Get Active layout
			var getActiveLayout = function () {
				for (var a = 0, b = layoutsState.length; a < b; ++a) {
					if (layoutsState[a].active == true) {
						return layoutsState[a];
					}
				}
				return null;
			};

			// Get Active tab
			var getActiveTab = function () {
				var activeLayout = getActiveLayout();
				for (var a = 0, b = activeLayout.tabs.length; a < b; ++a) {
					if (activeLayout.tabs[a].active == true) {
						return activeLayout.tabs[a];
					}
				}
				return null;
			};

			// Get Field by layout-tag-field handle
			var getField = function (layout, tab, field) {
				for (var a = 0, b = layoutsState.length; a < b; ++a) {
					if (layoutsState[a].handle == layout) {
						for (var c = 0, d = layoutsState[a].tabs.length; c < d; ++c) {
							if (layoutsState[a].tabs[c].handle == tab) {
								for (var e = 0, f = layoutsState[a].tabs[c].fields.length; e < f; ++e) {
									if (layoutsState[a].tabs[c].fields[e].handle == field) {
										return layoutsState[a].tabs[c].fields[e];
									}
								}
								break;
							}
						}
						break;
					}
				}
				return null;
			};

			// Create modal and listen for close event
			var showModal = function (renderer, state, onClose) {
				state.__uid = ++uid;

				var $modal = $('<div class="modal fade" tabindex="-1" data-backdrop="static" aria-hidden="true"></div>').appendTo('body'),
					$form,
					saveState;

				var updateContent = function () {
					$modal.empty().html(renderer.render(state));
					$form = $modal.find('form');

					$form.on('submit', function (e) {
						e.preventDefault();

						updateState();
						saveState = _.merge({}, _.omit(state, '__uid'));
						$modal.modal('hide');
					});

					$modal.find('.md-checkbox').each(function () {
						$(this)
							.find('.md-check').attr('id', function (i, val) {
								return val + state.__uid;
							}).end()
							.find('[for]').attr('for', function (i, val) {
								return val + state.__uid;
							}).end()
							.siblings('[for]').attr('for', function (i, val) {
								return val + state.__uid;
							})
					});

					// Pretty stuff
					$modal.find('.bs-select').selectpicker({
						iconBase: 'fa',
						tickIcon: 'fa-check'
					});
				}
				var updateState = function () {
					_.keys(_.omit(state, '__action', '__uid')).forEach(function (key) { delete state[key]; });
					_.merge(state, $form.serializeObject());
				}
				updateContent();

				// Modal closed, do the callback
				$modal.on('hide.bs.modal', function (e) {
					if (typeof onClose == 'function') {
						onClose(saveState, state);
					}
				});
				$modal.on('shown.bs.modal', function (e) {
					$modal.find(':input[autofocus]:first').focus();
				})

				$modal.modal('show');

				return {
					updateContent: updateContent,
					updateState: updateState,
					$modal: $modal
				}
			};

			// Events
			{
				// TODO name must be unique across layouts, tabs, fields, blocks

				// Add Layout
				$('[href="#createlayout"]').on('click', function (e) {
					e.preventDefault();

					showModal(templates.layout, {__action: 'add'}, function (state) {
						if (state) {
							for (var a = 0, b = layoutsState.length; a < b; ++a) {
								layoutsState[a].active = false;
							}

							layoutsState.push(_.merge(_.omit(state, '__action'), {
								active: true,
								tabs: []
							}));

							updateLayouts();
						}

					});
				});

				// Edit Layout
				$('[href="#editlayout"]').on('click', function (e) {
					e.preventDefault();

					var layout = getActiveLayout();
					if (layout) {
						showModal(templates.layout, _.merge({__action: 'edit'}, layout), function (state) {
							if (state) {
								_.merge(layout, _.omit(state, '__action'));

								updateLayouts();
							}

						});
					}

				});

				// Copy Layout
				$('[href="#copylayout"]').on('click', function (e) {
					e.preventDefault();

					var layout = getActiveLayout();
					if (layout) {
						showModal(templates.copy, {json: JSON.stringify(
							_.extend(
								_.omit(layout, 'active', 'tabs'),
								{
									tabs: _.map(layout.tabs, function (tab) {
										return _.omit(tab, 'active');
									})
								}
							)
						)});
					}
				});

				// Paste Layout
				$('[href="#pastelayout"]').on('click', function (e) {
					e.preventDefault();

					showModal(templates.paste, {}, function (state) {
						if (state) {
							var layout;
							try {
								layout = JSON.parse(state.json);
							} catch (e) {}

							if (layout) {
								for (var a = 0, b = layoutsState.length; a < b; ++a) {
									layoutsState[a].active = false;
								}

								if (layout.tabs.length > 0)
									layout.tabs[0].active = true;

								layoutsState.push(_.merge(layout, {
									active: true,
									name: state.name,
									label: state.label || (layout.label + ' copy')
								}));

								updateLayouts();
							}
						}

					});
				});

				// Delete layout
				$('[href="#deletelayout"]').on('click', function (e) {
					e.preventDefault();

					var layout = getActiveLayout();
					if (layout) {
						showModal(templates.delete, {}, function (state) {
							if (state) {
								var i = layoutsState.indexOf(layout);
								if (i > -1) {
									layoutsState.splice(i, 1);
									if (layoutsState.length) {
										layoutsState[0].active = true;
									}
									updateLayouts();
								}
							}

						});
					}
				});

				// Add Tab
				$layoutsContainer.on('click', '[href="#createtab"]', function (e) {
					e.preventDefault();

					var layout = getActiveLayout();
					if (layout) {
						showModal(templates.tab, {__action: 'add'}, function (state) {
							if (state) {
								for (var a = 0, b = layout.tabs.length; a < b; ++a) {
									layout.tabs[a].active = false;
								}

								layout.tabs.push(_.merge(_.omit(state, '__action'), {
									active: true,
									fields: []
								}));

								updateLayouts();
							}

						});
					}
				});

				// Edit Tab
				$layoutsContainer.on('click', '[href="#edittab"]', function (e) {
					e.preventDefault();

					var tab = getActiveTab();
					if (tab) {
						showModal(templates.tab, _.merge({__action: 'edit'}, tab), function (state) {
							if (state) {
								_.merge(tab, _.omit(state, '__action'));

								updateLayouts();
							}

						});
					}
				});

				// Copy Tab
				$layoutsContainer.on('click', '[href="#copytab"]', function (e) {
					e.preventDefault();

					var tab = getActiveTab();
					if (tab) {
						showModal(templates.copy, {json: JSON.stringify(_.omit(tab, 'active'))});
					}
				});

				// Paste Tab
				$layoutsContainer.on('click', '[href="#pastetab"]', function (e) {
					e.preventDefault();

					var layout = getActiveLayout();
					if (layout) {
						showModal(templates.paste, {}, function (state) {
							if (state) {
								var tab;
								try {
									tab = JSON.parse(state.json);
								} catch (e) {}

								if (tab) {
									for (var a = 0, b = layout.tabs.length; a < b; ++a) {
										layout.tabs[a].active = false;
									}

									layout.tabs.push(_.merge(tab, {
										active: true,
										name: state.name,
										label: state.label || (tab.label + ' copy')
									}));

									updateLayouts();
								}
							}

						});
					}
				});

				// Delete Tab
				$layoutsContainer.on('click', '[href="#deletetab"]', function (e) {
					e.preventDefault();

					var tab = getActiveTab();
					if (tab) {
						var layout = getActiveLayout();
						showModal(templates.delete, {}, function (state) {
							if (state) {
								var i = layout.tabs.indexOf(tab);
								if (i > -1) {
									var i = layout.tabs.splice(i, 1);
									if (layout.tabs.length) {
										layout.tabs[0].active = true;
									}
									updateLayouts();
								}
							}

						});
					}
				});

				// Copy Field
				$layoutsContainer.on('click', '[href="#copyfield"]', function (e) {
					e.preventDefault();

					var $btn = $(this),
						field = getField($btn.data('layout'), $btn.data('tab'), $btn.data('field'));
					if (field) {
						showModal(templates.copy, {json: JSON.stringify(field)});
					}
				});

				// Paste Field
				$layoutsContainer.on('click', '[href="#pastefield"]', function (e) {
					e.preventDefault();

					var tab = getActiveTab();
					if (tab) {
						showModal(templates.paste, {}, function (state) {
							if (state) {
								var field;
								try {
									field = JSON.parse(state.json);
								} catch (e) {}

								if (field) {
									tab.fields.push(_.merge(field, {
										name: state.name,
										label: state.label || (field.label + ' copy')
									}));

									updateLayouts();
								}
							}

						});
					}
				});

				// Delete Field
				$layoutsContainer.on('click', '[href="#deletefield"]', function (e) {
					e.preventDefault();

					var $btn = $(this),
						field = getField($btn.data('layout'), $btn.data('tab'), $btn.data('field'));
					if (field) {
						var tab = getActiveTab();
						showModal(templates.delete, {}, function (state) {
							if (state) {
								var i = tab.fields.indexOf(field);
								if (i > -1) {
									var i = tab.fields.splice(i, 1);
									updateLayouts();
								}
							}

						});
					}
				});

				var showFieldModal = function (fieldState, onClose) {
					var blocks = fieldState.blocks || [];
					for (var a = 0, b = blocks.length; a < b; ++a) {
						blocks[a].active = a == 0;
					}

					var modal = showModal(templates.field, fieldState, function (state) {
						if (state && state.input == 'matrix') {
							state.blocks = blocks;
						}
						onClose(state);
					});
					var updateContent = function () {
						modal.$modal.addClass('bs-modal-lg').children('.modal-dialog').addClass('modal-lg');
						modal.$modal.find('[name="input"]').on('change', function (e) {
							modal.updateState();
							modal.updateContent();
							updateContent();
						});
						if (fieldState.input == 'matrix') {

							_.extend(fieldState, {blocks: blocks});

							var $blocks = $(templates.blocks.render(fieldState));
							modal.$modal.find('[name="maximum"]:last').parent().before($blocks);

							// Maintain active state
							$blocks.find('.nav-tabs > li:not(:first) > a').on('click', function (e) {
								var id = $(this).attr('href').substr(1).split('_').slice(2);
								for (var a = 0, b = blocks.length; a < b; ++a) {
									blocks[a].active = blocks[a].handle == id[0];
								}
							});

							// Reorder tabs & fields
							// TODO change order in state
							$blocks.find('.nav-tabs').sortable({
								items: 'li:not(:first)'
							});
							$blocks.find('.tab-pane tbody').sortable({
								handle: '.fa-reorder',
								axis: 'y',
								helper: function (e, $tr) {
									var widths = $tr.children('td').map(function () { return $(this).width(); }).get(),
										$clone = $tr.clone(false, false);
									$clone.children('td').each(function (i) {
										$(this).width(widths[i]);
									});
									return $clone;
								}
							});

							// Get Active block
							var getActiveBlock = function () {
								for (var a = 0, b = blocks.length; a < b; ++a) {
									if (blocks[a].active == true) {
										return blocks[a];
									}
								}
								return null;
							};

							// Get Field
							var getField = function (block, field) {
								for (var c = 0, d = blocks.length; c < d; ++c) {
									if (blocks[c].handle == block) {
										for (var e = 0, f = blocks[c].fields.length; e < f; ++e) {
											if (blocks[c].fields[e].handle == field) {
												return blocks[c].fields[e];
											}
										}
										break;
									}
								}
								return null;
							}

							// Events
							{
								// Add Block
								$blocks.on('click', '[href="#createblock"]', function (e) {
									e.preventDefault();

									showModal(templates.block, {__action: 'add'}, function (state) {
										if (state) {
											for (var a = 0, b = blocks.length; a < b; ++a) {
												blocks[a].active = false;
											}

											blocks.push(_.merge(_.omit(state, '__action'), {
												active: true,
												fields: []
											}));

											modal.updateContent();
											updateContent();
										}
									});
								});

								// Edit Block
								$blocks.on('click', '[href="#editblock"]', function (e) {
									e.preventDefault();

									var block = getActiveBlock();
									if (block) {
										showModal(templates.block, _.merge({__action: 'edit'}, block), function (state) {
											if (state) {
												_.merge(block, _.omit(state, '__action'));
												modal.updateContent();
												updateContent();
											}
										});
									}
								});

								// Copy Block
								$blocks.on('click', '[href="#copyblock"]', function (e) {
									e.preventDefault();

									var block = getActiveBlock();
									if (block) {
										showModal(templates.copy, {json: JSON.stringify(_.omit(block, 'active'))});
									}
								});

								// Paste Block
								$blocks.on('click', '[href="#pasteblock"]', function (e) {
									e.preventDefault();

									showModal(templates.paste, {}, function (state) {
										if (state) {
											var block;
											try {
												block = JSON.parse(state.json);
											} catch (e) {}

											if (block) {
												for (var a = 0, b = blocks.length; a < b; ++a) {
													blocks[a].active = false;
												}

												blocks.push(_.merge(block, {
													active: true,
													handle: state.handle,
													label: state.label || (block.label + ' copy')
												}));

												modal.updateContent();
												updateContent();
											}
										}

									});
								});

								// Delete Block
								$blocks.on('click', '[href="#deleteblock"]', function (e) {
									e.preventDefault();

									var block = getActiveBlock();
									if (block) {
										showModal(templates.delete, {}, function (state) {
											if (state) {
												var i = blocks.indexOf(block);
												if (i > -1) {
													var i = blocks.splice(i, 1);
													if (blocks.length) {
														blocks[0].active = true;
													}
													modal.updateContent();
													updateContent();
												}
											}

										});
									}
								});

								// Add Field
								$blocks.on('click', '[href="#createfield"]', function (e) {
									e.preventDefault();

									var block = getActiveBlock();
									if (block) {
										showFieldModal({__action: 'add'}, function (state) {
											if (state) {
												block.fields.push(_.omit(state, '__action', '__uid'));
												modal.updateState();
												modal.updateContent();
												updateContent();
											}
										});
									}
								});

								// Edit Field
								$blocks.on('click', '[href="#editfield"]', function (e) {
									e.preventDefault();

									var $btn = $(this),
										field = getField($btn.data('block'), $btn.data('field'));

									if (field) {
										showFieldModal(_.merge({__action: 'edit'}, field), function (state) {
											if (state) {
												// Remove all keys from field
												_.keys(field).forEach(function (key) { delete field[key]; });
												// Update field state
												_.merge(field, _.omit(state, '__action', '__uid'));
												modal.updateState();
												modal.updateContent();
												updateContent();
											}
										});
									}

								});

								// Copy Field
								$blocks.on('click', '[href="#copyfield"]', function (e) {
									e.preventDefault();

									var $btn = $(this),
										field = getField($btn.data('block'), $btn.data('field'));

									if (field) {
										showModal(templates.copy, {json: JSON.stringify(field)});
									}
								});

								// Paste Field
								$blocks.on('click', '[href="#pastefield"]', function (e) {
									e.preventDefault();

									var block = getActiveBlock();
									if (block) {
										showModal(templates.paste, {}, function (state) {
											if (state) {
												var field;
												try {
													field = JSON.parse(state.json);
												} catch (e) {}

												if (field) {
													block.fields.push(_.merge(field, {
														handle: state.handle,
														label: state.label || (field.label + ' copy')
													}));

													modal.updateState();
													modal.updateContent();
													updateContent();
												}
											}

										});
									}
								});

								// Delete Field
								$blocks.on('click', '[href="#deletefield"]', function (e) {
									e.preventDefault();

									var $btn = $(this),
										field = getField($btn.data('block'), $btn.data('field'));

									if (field) {
										var block = getActiveBlock();
										showModal(templates.delete, {}, function (state) {
											if (state) {
												var i = block.fields.indexOf(field);
												if (i > -1) {
													var i = block.fields.splice(i, 1);
													modal.updateState();
													modal.updateContent();
													updateContent();
												}
											}

										});
									}
								});
							}
						}
					}
					updateContent();
				};

				// Add Field
				$layoutsContainer.on('click', '[href="#createfield"]', function (e) {
					e.preventDefault();

					var tab = getActiveTab();
					if (tab) {
						showFieldModal({__action: 'add'}, function (state) {
							if (state) {
								tab.fields.push(_.omit(state, '__action', '__uid'));
								updateLayouts();
							}
						});
					}
				});

				// Edit Field
				$layoutsContainer.on('click', '[href="#editfield"]', function (e) {
					e.preventDefault();

					var $btn = $(this),
						field = getField($btn.data('layout'), $btn.data('tab'), $btn.data('field'));

					if (field) {
						showFieldModal(_.merge({__action: 'edit'}, field), function (state) {
							if (state) {
								// Remove all keys from field
								_.keys(field).forEach(function (key) { delete field[key]; });
								// Update field state
								_.merge(field, _.omit(state, '__action', '__uid'));
								updateLayouts();
							}
						});
					}

				});
			}

		});
	</script>
{% endblock %}
