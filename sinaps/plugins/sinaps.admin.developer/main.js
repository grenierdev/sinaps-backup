var pluginAdmin = sinaps.require('sinaps.admin');
var express = require('express');
var Navigation = pluginAdmin.Navigation;

module.exports = {

	executionOrder: -400,

	router: express.Router(),
	sidebar: new Navigation(),

	initialize: function () {

		pluginAdmin.sidebar.navigation.addItem({
			weight: 10000,
			title: 'Developer',
			href: '/admin/developer/',
			icon: 'fa fa-terminal'
		});

		this.sidebar.addItem({
			weight: 1000,
			title: 'Styles',
			href: '/admin/developer/styles/'
		});

		pluginAdmin.router.use('/developer', this.router);

		this.router.get('/', function (req, res) {
			res.render('sinaps.admin.developer/index', {

			});
		});

		this.router.get('/styles/', function (req, res) {
			res.render('sinaps.admin.developer/styles', {

			});
		}.bind(this));

	}

};
