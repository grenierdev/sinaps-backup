var admin = sinaps.require('sinaps.admin');

module.exports = {

	executionOrder: -400,

	initialize: function () {

		admin.router.get('/', function (req, res) {

			res.render('sinaps.admin.dashboard/dashboard', {
				// vars
			});

		});

		admin.sidebar.navigation.addItem({
			weight: -1000,
			title: 'Dashboard',
			href: '/admin/',
			icon: 'icon-home'
		});


	}

}
