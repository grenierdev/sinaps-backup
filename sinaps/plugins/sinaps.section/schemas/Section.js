var Schema = sinaps.require('sinaps.core').Schema;

var Section = new Schema({
	name: 'section',
	label: 'Section',
	layouts: [
		{
			name: 'channel',
			label: 'Channel',
			tabs: [
				{
					name: 'channel',
					label: 'Channel',
					fields: [
						{
							name: 'name',
							label: 'Name',
							type: 'string',
							required: true,
							index: true
						},
						{
							name: 'title',
							label: 'Title',
							type: 'string'
						},
						{
							name: 'definition',
							label: 'Definition',
							type: 'object'
						}
					]
				}
			]
		}
	]
});

module.exports = Section;
