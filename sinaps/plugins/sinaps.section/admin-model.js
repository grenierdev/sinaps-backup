var _ = require('lodash');
var async = require('async');
var pluginAdmin = sinaps.require('sinaps.admin');
var pluginSection = sinaps.require('sinaps.section');

module.exports = function () {

	var getSectionByHandle = function (handle) {
		var section;
		for (var i = pluginSection.sections.length; --i >= 0;) {
			if (pluginSection.sections[i].schema.handle == handle && pluginSection.sections[i].model) {
				section = pluginSection.sections[i];
				break;
			}
		}
		return section;
	};

	// List
	pluginAdmin.router.get('/sections/:handle/', function (req, res) {
		var section = getSectionByHandle(req.params.handle);

		if (!section) {
			req.session.messages.push({type: 'danger', message: 'Could not find section'});
			res.status(404).redirect('/admin/sections/');
			return;
		}

		var offset = parseInt(req.query.offset, 10) || 0;
		var limit = 50;
		var query = {};

		async.parallel({
			count: function (done) {
				section.entryModel.find(query).count(function (err, count) {
					done(err, count);
				});
			},
			entries: function (done) {
				section.entryModel.find(query).exec(function (err, entries) {
					done(err, entries);
				});
			}
		}, function (err, result) {

			var fields = section.schema.fields(),
				columns = {};

			section.model.columns.forEach(function (path) {
				_.map(fields, function (f, p) {
					if (p.split('.').slice(2).join('.') == path) {
						columns[path] = f;
					}
				});
			});

			res.render('sinaps.section/model-list', {
				section: section,
				columns: columns,
				entries: result.entries,
				offset: offset,
				limit: limit,
				count: result.count
			});
		});

	});

	// New form
	pluginAdmin.router.get('/sections/:handle/create', function (req, res) {
		var section = getSectionByHandle(req.params.handle);

		if (!section) {
			req.session.messages.push({type: 'danger', message: 'Could not find section'});
			res.status(404).redirect('/admin/sections/');
			return;
		}

		var model = new section.entryModel();

		if (req.session.data) {
			model.set(req.session.data);
			delete req.session.data;
		}

		res.render('sinaps.section/model-form', {
			sectionSchema: section.schema,
			sectionModel: section.model,
			entrySchema: section.entrySchema,
			entryModel: section.entryModel,
			model: model
		});
	});

	// Create logic
	pluginAdmin.router.post('/sections/:handle/create', function (req, res) {
		var section = getSectionByHandle(req.params.handle);

		if (!section) {
			req.session.messages.push({type: 'danger', message: 'Could not find section'});
			res.status(404).redirect('/admin/sections/');
			return;
		}

		var model = new section.entryModel(req.body);
		model.save(function (err) {
			if (err) {
				console.error(err);
				req.session.messages.push({type: 'danger', message: 'Could not save'});
				req.session.data = model.toObject();
				res.redirect(`/admin/sections/${req.params.handle}/create`);
			} else {
				req.session.messages.push({type: 'success', message: 'Section saved'});
				res.redirect(`/admin/sections/${req.params.handle}/`);
			}
		});
	});

	// Edit form
	pluginAdmin.router.get('/sections/:handle/edit/:id', function (req, res) {
		var section = getSectionByHandle(req.params.handle);

		if (!section) {
			req.session.messages.push({type: 'danger', message: 'Could not find section'});
			res.status(404).redirect('/admin/sections/');
			return;
		}

		section.entryModel.findById(req.params.id, function (err, model) {
			if (err) {
				req.session.messages.push({type: 'danger', message: 'Could not find entry'});
				res.status(404).redirect(`/admin/sections/${req.params.handle}/`);
				return;
			}

			if (req.session.data) {
				model.set(req.session.data);
				delete req.session.data;
			}

			res.render('sinaps.section/model-form', {
				sectionSchema: section.schema,
				sectionModel: section.model,
				entrySchema: section.entrySchema,
				entryModel: section.entryModel,
				model: model
			});
		});
	});

	// Update logic
	pluginAdmin.router.post('/sections/:handle/edit/:id', function (req, res) {
		var section = getSectionByHandle(req.params.handle);

		if (!section) {
			req.session.messages.push({type: 'danger', message: 'Could not find section'});
			res.status(404).redirect('/admin/sections/');
			return;
		}

		section.entryModel.findById(req.params.id, function (err, model) {
			if (err) {
				req.session.messages.push({type: 'danger', message: 'Could not find entry'});
				res.status(404).redirect(`/admin/sections/${req.params.handle}/`);
				return;
			}

			model.set(req.body);
			model.save(function (err) {
				if (err) {
					console.error(err);
					req.session.messages.push({type: 'danger', message: 'Could not save'});
					req.session.data = model.toObject();
					res.redirect(`/admin/sections/${req.params.handle}/edit/${model.id}`);
				} else {
					req.session.messages.push({type: 'success', message: 'Section saved'});
					res.redirect(`/admin/sections/${req.params.handle}/`);
				}
			});
		});
	});

	// TODO Delete logic

};
