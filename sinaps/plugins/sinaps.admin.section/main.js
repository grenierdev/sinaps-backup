var admin = sinaps.require('sinaps.admin');

module.exports = {

	// Order in which plugins are executed
	executionOrder: -400,

	// Main function that sinaps execute
	initialize: function () {

		var sections = admin.sidebar.navigation.addItem({
			weight: 0,
			title: 'Sections',
			href: '/admin/sections/',
			icon: 'icon-drawer'
		});


		sections.addItem({
			title: 'Blog',
			href: '/admin/sections/blog',
			icon: 'icon-doc'
		})

	}

}
