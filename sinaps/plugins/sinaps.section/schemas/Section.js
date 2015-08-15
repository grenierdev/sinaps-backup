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
							unique: true
						},
						{
							name: 'title',
							label: 'Title',
							type: 'string'
						},
						{
							name: 'url',
							label: 'URL',
							type: 'string',
							required: true,
							lang: true
						},
						{
							name: 'layouts',
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
