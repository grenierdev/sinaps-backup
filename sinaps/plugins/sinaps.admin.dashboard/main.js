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

		admin.sidebar.navigation.addGroup({
			name: 'features',
			title: 'Features'
		}).addItem({
			title: 'Test',
			icon: 'icon-check'
		}).addItem({
			title: 'Inception',
			icon: 'icon-eye'
		});

		admin.sidebar.navigation.group('features').addItem({
			title: 'Bleh !',
			icon: 'icon-question'
		});



	}

}
