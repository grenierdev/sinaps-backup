var admin = sinaps.require('sinaps.admin');
var section = sinaps.require('sinaps.section');

module.exports = function () {

	admin.router.get('/sections/', function (req, res) {

		res.render('sinaps.section/section-list', {
			sections: section.sections
		});

	});

	var getSectionByHandle = function (handle) {
		var sec;
		for (var i = section.sections.length; --i >= 0;) {
			if (section.sections[i].schema.handle == handle && section.sections[i].section) {
				sec = section.sections[i];
				break;
			}
		}
		return sec;
	}

	admin.router.get('/sections/~edit/:handle', function (req, res) {
		var sec = getSectionByHandle(req.params.handle);

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

	admin.router.post('/sections/~edit/:handle', function (req, res) {
		var sec = getSectionByHandle(req.params.handle);

		if (!sec) {
			// TODO Error message
			res.redirect('/admin/sections/');
			return;
		}

		try {
			req.body.layouts = JSON.parse(req.body.layouts);
		} catch (e) {}

		sec.section.layout = req.body.layout;
		sec.section.name = req.body.name;
		sec.section.title = req.body.title;
		sec.section.url = req.body.url;
		sec.section.template = req.body.template;
		sec.section.layouts = req.body.layouts;

		sec.section.save(function (err) {
			if (err) {
				// TODO error message...
				console.error(err);
			}

			res.redirect('/admin/sections/~edit/' + sec.section.name);
		})
	});

	admin.router.get('/sections/:model/', function (req, res) {

		res.send('Bleh');

	});


};
