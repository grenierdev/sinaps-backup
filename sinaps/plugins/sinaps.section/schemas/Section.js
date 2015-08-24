var _ = require('lodash');
var pluginAdmin = sinaps.require('sinaps.admin');
var Schema = sinaps.require('sinaps.core').Schema;

var Section = new Schema({
	handle: 'section',
	label: 'Section',
	layouts: [
		{
			handle: 'channel',
			label: 'Channel',
			tabs: [
				{
					handle: 'info',
					label: 'Info',
					fields: [
						{
							handle: 'handle',
							label: 'Handle',
							type: 'string',
							input: 'text',
							required: true,
							unique: true
						},
						{
							handle: 'label',
							label: 'Label',
							type: 'string',
							input: 'text',
						},
						{
							handle: 'title',
							label: 'Title',
							type: 'string',
							input: 'text',
							required: true
						},
						{
							handle: 'hasurls',
							label: 'Entries in this section have their own URLs',
							type: 'boolean',
							input: 'checkbox',
							required: true
						},
						{
							handle: 'url',
							label: 'URL',
							type: 'string',
							input: 'text',
							lang: true
						},
						{
							handle: 'template',
							label: 'Template',
							type: 'string',
							input: 'text',
						},
						{
							handle: 'layouts',
							label: 'Layouts',
							type: 'object'
						},
						{
							handle: 'columns',
							label: 'Columns',
							type: 'object',
							array: 'string'
						}
					]
				}
			]
		}
	]
});

Section.methods.getLayoutSchema = function () {
	var convertInputToType = function (container) {
		container.fields = _.map(container.fields, function (field) {
			var fieldtype = pluginAdmin.getFieldType(field.input);
			field.type = fieldtype ? fieldtype.type : 'object';
			if (field.input == 'matrix') {
				field.blocks = _.map(field.blocks, function (block) {
					return convertInputToType(block);
				});
			}
			else if (field.input == 'object') {
				field = convertInputToType(field);
			}
			return field;
		});
		return container;
	};

	var layouts = _.map(this.get('layouts'), function (layout) {
		layout.tabs = _.map(layout.tabs, function (tab) {
			return convertInputToType(tab);
		});
		return layout;
	});

	return new Schema({
		handle: this.get('handle'),
		label: this.get('label'),
		layouts: layouts
	});;
};

module.exports = Section;
