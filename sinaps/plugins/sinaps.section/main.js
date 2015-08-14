var admin = sinaps.require('sinaps.admin');
var SectionSchema = require('./schemas/Section');
var SectionModel;
var mongoose = require('mongoose');

module.exports = {

	// Schemas
	SectionSchema: SectionSchema,

	// Models
	SectionModel: SectionModel,

	// Order in which plugins are executed
	executionOrder: -400,

	// Main function that sinaps execute
	initialize: function () {

		sinaps.once('initialized', function () {

			// Setup user model based on schema
			SectionModel = mongoose.model('Section', SectionSchema.finalizedSchema());


			/*var sections = admin.sidebar.navigation.addItem({
				weight: 0,
				title: 'Sections',
				href: '/admin/sections/',
				icon: 'icon-drawer'
			});


			sections.addItem({
				title: 'Blog',
				href: '/admin/sections/blog',
				icon: 'icon-doc'
			});*/

		});

	}

}
