var admin = sinaps.require('sinaps.admin');
var section = sinaps.require('sinaps.section');

module.exports = function () {

	admin.router.get('/sections/', function (req, res) {

		res.render('sinaps.section/section-list', {
			sections: section.sections
		});

	});

	admin.router.get('/sections/~edit/:section', function (req, res) {
		var sec;
		for (var i = section.sections.length; --i >= 0;) {
			if (section.sections[i].schema.name == req.params.section && section.sections[i].section) {
				sec = section.sections[i];
				break;
			}
		}

		if (!sec) {
			// TODO Error message
			res.redirect('/admin/sections/');
			return;
		}

		res.render('sinaps.section/section-form', {
			section: sec.section,
			schema: section.SectionSchema
		});

	});

	admin.router.get('/sections/:model/', function (req, res) {

		res.send('Bleh');

	});


};
