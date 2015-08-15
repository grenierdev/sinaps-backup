var admin = sinaps.require('sinaps.admin');
var section = sinaps.require('sinaps.section');

module.exports = function () {

	admin.router.get('/sections/', function (req, res) {

		res.render('sinaps.section/section-list', {
			sections: section.schemas()
		});

	});

	admin.router.get('/sections/:model/', function (req, res) {

		res.send('Bleh');

	});


};
