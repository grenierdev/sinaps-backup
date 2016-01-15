var _ = require('lodash');
var async = require('async');
var mongoose = require('mongoose');
var pluginAdmin = sinaps.require('sinaps.admin');
var pluginSection = sinaps.require('sinaps.section');
var moment = require('moment');

function flattenObject (obj) {
	var getPaths = function (obj, path) {
		path = typeof path === 'undefined' ? '' : path;
		var paths = {};

		_.each(obj, function (v, k) {
			var p = path != '' ? path + '.' + k : k + '';
			if (_.isObject(v) || _.isArray(v)) {
				_.merge(paths, getPaths(v, p));
			} else {
				paths[p] = v;
			}
		});

		return paths;
	};

	return getPaths(obj);
};

module.exports = function () {

	var navigation = [];

	pluginSection.once('ready', function () {
		pluginSection.sections.forEach(function (section) {
			navigation.push({
				handle: section.schema.handle,
				label: section.schema.label
			});
		});
	});

	pluginAdmin.router.get('/sections/', function (req, res) {
		res.render(`sinaps.section/admin-frame`, {
			nav: navigation
		});
	});

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

	// List & search
	pluginAdmin.router.get('/sections/:handle', function (req, res) {
		var section = getSectionByHandle(req.params.handle);

		if (!section) {
			req.session.messages.push({type: 'danger', message: 'Could not find section'});
			res.status(404).redirect('/admin/sections/');
			return;
		}

		switch (section.model.layout) {
			case 'channel':
				var page = parseInt(req.query.page, 10) || 0;
				var perpage = 50;
				var query = {};
				var opts = {};
				var order = { postDate: -1 };

				// FIXME Ordering

				var search = req.query.search || {};
				var flatSearch = flattenObject(search);
				var hasSearch = _.values(flatSearch).join('') != '';
				var searchQuery = [];

				if (flatSearch['postDate.from'] || flatSearch['postDate.to']) {
					query['postDate'] = {};
					if (flatSearch['postDate.from']) {
						query['postDate']['$gte'] = moment(flatSearch['postDate.from']).toDate();
					}
					if (flatSearch['postDate.to']) {
						query['postDate']['$lte'] = moment(flatSearch['postDate.to']).toDate();
					}
				}
				if (flatSearch['expireDate.from'] || flatSearch['expireDate.to']) {
					query['expireDate'] = {};
					if (flatSearch['expireDate.from']) {
						query['expireDate']['$gte'] = moment(flatSearch['expireDate.from']).toDate();
					}
					if (flatSearch['expireDate.to']) {
						query['expireDate']['$lte'] = moment(flatSearch['expireDate.to']).toDate();
					}
				}

				if (flatSearch['term']) {
					query['$text'] = { $search: flatSearch['term'] };
					opts['score'] = { $meta: 'textScore' };
					order = { score: { $meta: 'textScore' } };
				}

				if (flatSearch['state']) {
					query['state'] = flatSearch['state'];
				}

				searchQuery = searchQuery.join('&');

				async.parallel({
					count: function (done) {
						section.entryModel.find(query, opts).count(function (err, count) {
							done(err, count);
						});
					},
					entries: function (done) {
						section.entryModel.find(query, opts).limit(perpage).skip(page * perpage).sort(order).exec(function (err, entries) {
							done(err, entries);
						});
					}
				}, function (err, result) {
					res.render(`sinaps.section/admin-channel`, {
						handle: section.schema.handle,
						section: section,
						nav: navigation,

						search: search,
						hasSearch: hasSearch,
						searchQuery: searchQuery,

						entries: result.entries,
						page: page,
						perpage: perpage,
						count: result.count
					});
				});
				break;
			case 'page':
				console.error('Page form');
				break;
			case 'structure':
				async.parallel({
					entries: function (done) {
						section.entryModel.find({}).limit(null).exec(function (err, entries) {
							done(err, entries);
						});
					}
				}, function (err, result) {
					res.render(`sinaps.section/admin-structure`, {
						handle: section.schema.handle,
						section: section,
						nav: navigation,

						entries: result.entries
					});
				});
				break;
		}

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

		model.set('layout', req.query.layout || model.layout);

		res.render('sinaps.section/admin-form', {
			handle: section.schema.handle,
			section: section,

			_action: 'create',
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
				req.session.messages.push({type: 'success', message: 'Entry saved'});
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

			model.set('layout', req.query.layout || model.layout);

			res.render('sinaps.section/admin-form', {
				handle: section.schema.handle,
				section: section,

				_action: 'edit',
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
					req.session.messages.push({type: 'success', message: 'Entry saved'});
					res.redirect(`/admin/sections/${req.params.handle}/`);
				}
			});
		});
	});

	// Delete
	pluginAdmin.router.get('/sections/:handle/delete', function (req, res) {
		var section = getSectionByHandle(req.params.handle);

		if (!section) {
			req.session.messages.push({type: 'danger', message: 'Could not find section'});
			res.status(404).redirect('/admin/sections/');
			return;
		}

		section.entryModel.find({
			_id: { $in: req.query.ids }
		}, function (err, models) {
			if (err) {
				res.status(400).end();
				return;
			}

			var tasks = [];

			models.forEach(function (model) {
				// Force delete or already trashed
				if (req.query.forceDelete || model.state == 'trashed') {
					tasks.push(model.remove);
				}

				// Put in trash
				else {
					model.state = 'trashed';
					tasks.push(model.save.bind(model, {
						validateBeforeSave: false
					}));
				}
			});

			async.parallel(tasks, function (err) {
				if (err) {
					req.session.messages.push({type: 'danger', message: 'Something wrong happened, try again'});
				} else {
					req.session.messages.push({type: 'success', message: 'Entry pulverized'});
				}
				res.redirect(`/admin/sections/${req.params.handle}/`);
			});
		});
	});

	// Restore to draft
	pluginAdmin.router.get('/sections/:handle/restore/:id', function (req, res) {
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

			model.state = 'draft';
			model.save(function (err) {
				if (err) {
					req.session.messages.push({type: 'danger', message: 'Could not restore this entry'});
					res.redirect(`/admin/sections/${req.params.handle}/trash`);
				} else {
					req.session.messages.push({type: 'success', message: 'Entry restored as draft'});
					res.redirect(`/admin/sections/${req.params.handle}/edit/${model.id}`);
				}
			});
		});
	});

	// Structure reording
	pluginAdmin.router.post('/sections/:handle/restruct', function (req, res) {
		var section = getSectionByHandle(req.params.handle);

		if (!section) {
			req.session.messages.push({type: 'danger', message: 'Could not find section'});
			res.status(404).redirect('/admin/sections/');
			return;
		}

		var struct = [];
		req.body.struct.forEach(function (pair) {
			struct[pair.id] = pair;
		});

		section.entryModel.find({
			_id: { $in: _.keys(struct) }
		}, function (err, models) {
			if (err) {
				res.status(400).end();
				return;
			}

			var tasks = [];

			models.forEach(function (model) {
				model.set('parentId', struct[model.id].parentid != 0 ? struct[model.id].parentid : null);
				model.set('order', struct[model.id].order);
				tasks.push(model.save.bind(model, {
					validateBeforeSave: false
				}));
			});

			async.parallel(tasks, function (err) {
				res.status(err ? 400 : 200).end();
			});
		});
	});
};
