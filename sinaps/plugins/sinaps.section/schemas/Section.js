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
						}
					]
				}
			]
		}
	]
});

// When a section is removed, try to drop collection first
/*Section.pre('remove', function (next) {
	sinaps.db.collections[this.name].drop(function (err) {
		next(err);
	});
});

// Restart server when a section changes
var restartServer = function () {
	// TODO interprocess event
	setTimeout(function () {
		process.exit();
	}, 1000);
}
Section.post('save', restartServer);
Section.post('remove', restartServer);*/

module.exports = Section;
