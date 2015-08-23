var _ = require('lodash');
var pluginAdmin = sinaps.require('sinaps.admin');
var pluginSection = sinaps.require('sinaps.section');
var SectionModel;

module.exports = function () {

	pluginSection.once('ready', function () {
		SectionModel = pluginSection.SectionModel;
	});

	var assignDataToModel = function (model, data) {
		model.layouts = data.layouts;
		model.layout = data.layout;
		model.handle = data.handle;
		model.label = data.label;
		model.title = data.title;
		model.hasurls = data.hasurls;
		model.url = data.url;
		model.template = data.template;
		model.layouts = data.layouts;
	};

	pluginAdmin.router.get('/sections/', function (req, res) {
		res.render('sinaps.section/section-list', {
			sections: pluginSection.sections
		});
	});

	pluginAdmin.router.get('/sections/~create', function (req, res) {
		var sec = new SectionModel();

		if (req.session.data) {
			assignDataToModel(sec, req.session.data);
			delete req.session.data;
		}

		res.render('sinaps.section/section-form', {
			section: sec,
			schema: pluginSection.SectionSchema
		});
	});

	pluginAdmin.router.post('/sections/~create', function (req, res) {

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
		for (var i = pluginSection.sections.length; --i >= 0;) {
			if (pluginSection.sections[i].schema.handle == handle && pluginSection.sections[i].model) {
				sec = pluginSection.sections[i];
				break;
			}
		}
		return sec;
	};

	pluginAdmin.router.get('/sections/~edit/:handle', function (req, res) {
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
			schema: pluginSection.SectionSchema
		});

	});

	pluginAdmin.router.post('/sections/~edit/:handle', function (req, res) {
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

	pluginAdmin.router.post('/sections/~delete', function (req, res) {

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

	pluginAdmin.router.get('/sections/~restarting', function (req, res) {
		res.render('sinaps.section/section-restart', {
			redirect: req.query.redirect
		});

		// TODO just reload model ? http://stackoverflow.com/questions/19643126/how-do-you-remove-a-model-from-mongoose

		// TODO interprocess restart signal ?
		setTimeout(function () {
			process.exit();
		}, 500);
	});

};
