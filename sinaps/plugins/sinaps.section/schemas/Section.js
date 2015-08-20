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
							handle: 'name',
							label: 'Name',
							type: 'string',
							input: 'text',
							required: true,
							unique: true
						},
						{
							handle: 'title',
							label: 'Title',
							type: 'string',
							input: 'text',
						},
						{
							handle: 'url',
							label: 'URL',
							type: 'string',
							input: 'text',
							required: true,
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
Section.pre('remove', function (next) {
	sinaps.db.collections[this.name].drop(function (err) {
		next(err);
	});
});

// Restart server when a section changes
var restartServer = function () {
	// TODO interprocess event
	process.exit();
}
Section.post('save', restartServer);
Section.post('remove', restartServer)

module.exports = Section;
