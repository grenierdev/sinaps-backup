var _ = require('lodash');
var admin = sinaps.require('sinaps.admin');
var section = sinaps.require('sinaps.section');
var SectionModel;

module.exports = function () {

	section.once('ready', function () {
		SectionModel = section.SectionModel;
	});

	var assignDataToModel = function (model, data) {
		model.layouts = data.layouts;
		model.layout = data.layout;
		model.handle = data.handle;
		model.title = data.title;
		model.url = data.url;
		model.template = data.template;
		model.layouts = data.layouts;
	};

	admin.router.get('/sections/', function (req, res) {
		res.render('sinaps.section/section-list', {
			sections: section.sections
		});
	});

	admin.router.get('/sections/~create', function (req, res) {
		var sec = new SectionModel();

		if (req.session.data) {
			assignDataToModel(sec, req.session.data);
			delete req.session.data;
		}

		res.render('sinaps.section/section-form', {
			section: sec,
			schema: section.SectionSchema
		});
	});

	admin.router.post('/sections/~create', function (req, res) {

		var sec = new SectionModel();

		try {
			req.body.layouts = JSON.parse(req.body.layouts);
		} catch (e) {}

		assignDataToModel(sec, req.body);

		sec.save(function (err) {
			if (err) {
				console.log(err);
				req.session.messages.push({type: 'danger', message: 'Could not save section'});
				req.session.data = sec.toObject();
				res.redirect('/admin/sections/~create');
				return;
			}

			req.session.messages.push({type: 'success', message: 'Section saved'});
			res.redirect('/admin/sections/~restarting?redirect=/admin/sections/~edit/' + sec.get('handle'));
		});
	});

	var getSectionByHandle = function (handle) {
		var sec;
		for (var i = section.sections.length; --i >= 0;) {
			if (section.sections[i].schema.handle == handle && section.sections[i].model) {
				sec = section.sections[i];
				break;
			}
		}
		return sec;
	};

	admin.router.get('/sections/~edit/:handle', function (req, res) {
		var sec = getSectionByHandle(req.params.handle);

		if (!sec) {
			req.session.messages.push({type: 'danger', message: 'Could not find section'});
			res.redirect('/admin/sections/');
			return;
		}

		if (req.session.data) {
			assignDataToModel(sec.model, req.session.data);
			delete req.session.data;
		}

		res.render('sinaps.section/section-form', {
			section: sec.model,
			schema: section.SectionSchema
		});

	});

	admin.router.post('/sections/~edit/:handle', function (req, res) {
		var sec = getSectionByHandle(req.params.handle);

		if (!sec) {
			req.session.messages.push({type: 'danger', message: 'Could not find section'});
			res.redirect('/admin/sections/');
			return;
		}

		try {
			req.body.layouts = JSON.parse(req.body.layouts);
		} catch (e) {}

		assignDataToModel(sec.model, req.body);

		sec.model.save(function (err) {
			if (err) {
				req.session.messages.push({type: 'danger', message: 'Could not save section'});
				req.session.data = sec.model.toObject();
			} else {
				req.session.messages.push({type: 'success', message: 'Section saved'});
			}

			res.redirect('/admin/sections/~restarting?redirect=/admin/sections/~edit/' + sec.model.get('handle'));
		});
	});

	admin.router.post('/sections/~delete', function (req, res) {

		var handles = _.isArray(req.body.handle) ? req.body.handle : [req.body.handle];

		handles.forEach(function (handle) {
			var section = getSectionByHandle(handle);
			if (section) {
				section.model.remove(function (err) {
					//console.log(err);
				})
			}
		})

		//req.session.messages.push({type: 'info', message: 'Section(s) deleted'});
		res.redirect('/admin/sections/~restarting?redirect=/admin/sections/');
	});

	admin.router.get('/sections/~restarting', function (req, res) {
		res.render('sinaps.section/section-restart', {
			redirect: req.query.redirect
		});

		// TODO interprocess restart signal ?
		setTimeout(function () {
			process.exit();
		}, 500);
	});

	admin.router.get('/sections/:model/', function (req, res) {

		res.send('Bleh');

	});


};
