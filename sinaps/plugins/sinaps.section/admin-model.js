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

	pluginAdmin.router.get('/sections/:handle/', function (req, res) {
		var section = getSectionByHandle(req.params.handle);

		if (!section) {
			req.session.messages.push({type: 'danger', message: 'Could not find section'});
			res.status(404).redirect('/admin/sections/');
			return;
		}

		var offset = parseInt(req.query.offset, 10) || 0;
		var limit = 50;
		var query = section.entryModel.find({});

		async.parallel({
			count: function (done) {
				query.count(function (err, count) {
					done(err, count);
				});
			},
			entries: function (done) {
				query.exec(function (err, entries) {
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

	pluginAdmin.router.get('/sections/:handle/create', function (req, res) {
		var section = getSectionByHandle(req.params.handle);

		if (!section) {
			req.session.messages.push({type: 'danger', message: 'Could not find section'});
			res.status(404).redirect('/admin/sections/');
			return;
		}

		var model = new section.entryModel();

		res.render('sinaps.section/model-form', {
			sectionSchema: section.schema,
			sectionModel: section.model,
			entrySchema: section.entrySchema,
			entryModel: section.entryModel,
			model: model
		});
	});
};
