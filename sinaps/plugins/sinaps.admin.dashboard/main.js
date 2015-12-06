var pluginAdmin = sinaps.require('sinaps.admin');

module.exports = {

	executionOrder: -400,

	initialize: function () {

		pluginAdmin.router.get('/', function (req, res) {

			res.render('sinaps.admin.dashboard/dashboard', {
				// vars
			});

		});

		pluginAdmin.sidebar.navigation.addItem({
			weight: -1000,
			title: 'Dashboard',
			href: '/admin/',
			icon: 'fa fa-home'
		});


	}

};
