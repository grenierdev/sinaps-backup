var _ = require('lodash');
var path = require('path');
var express = require('express');
var passport = require('passport');
var EventEmitter = require('events').EventEmitter;
var Navigation = require('./libs/Navigation');
var FieldType = require('./libs/FieldType');

module.exports = _.extend({}, EventEmitter.prototype, {
	// FieldType
	FieldType: FieldType,

	// Admin router
	router: express.Router(),

	// Sidebar ? TODO wtf ?
	sidebar: {
		//top: new Navigation(),
		navigation: new Navigation()
	},

	// FieldTypes
	fieldTypes: {},

	registerFieldType: function (fieldtype) {
		//this.fieldTypes.push(fieldtype);
		this.fieldTypes[fieldtype.handle] = fieldtype;
		var keys = _.keys(this.fieldTypes), sorted = {};
		keys.sort();
		keys.forEach(function (key) { sorted[key] = this.fieldTypes[key]; }.bind(this));
		this.fieldTypes = sorted;
	},

	getFieldType: function (handle) {
		return this.fieldTypes[handle];
	},

	getFieldTypeFieldTemplates: function () {
		return _.mapValues(this.fieldTypes, function (field) { return field.getFieldTemplate(); });
	},

	getFieldTypeValueTemplates: function () {
		return _.mapValues(this.fieldTypes, function (field) { return field.getValueTemplate(); });
	},

	settings: {
		navigation: null,
		router: express.Router()
	},

	// Order in which plugins are executed
	executionOrder: -500,

	// Main function that sinaps execute
	initialize: function () {

		// Setup secure router
		{
			// Require user or send to login (white list login, resources)
			this.router.use(function (req, res, next) {
				if (req.user || req.url.match(/^\/(login|resources)/i)) {
					next();
				} else {
					res.redirect('/admin/login');
				}
			});

			// Show login page
			this.router.get('/login', function (req, res) {
				res.render('sinaps.admin/auth', {
					error: req.query.error || '',
					username: req.query.username || ''
				});
			});

			// Login
			this.router.post('/login', function (req, res, next) {
				// Use globaly storage to find user (using fields : username, password)
				passport.authenticate('local', function (err, user, info) {
					// Could not find user
					if (err || !user) {
						req.session.messages.push({type: 'warning', message: 'Credentials not found'});
						return res.redirect('/admin/login?username=' + req.body.username);
					}

					// Bind this request and the user found
					req.logIn(user, function (err) {
						if (err) {
							req.session.messages.push({type: 'warning', message: 'Something went wrong...'});
							return res.redirect('/admin/login');
						}
						return res.redirect(req.body.redirect || req.query.redirect || '/admin');
					});
				})(req, res, next);
			});

			// Logout
			this.router.get('/logout', function (req, res) {
				req.logout();
				res.redirect('/admin');
			});
		}

		// Load builtin fields
		require('./fields/text')();
		require('./fields/password')();
		require('./fields/number')();
		require('./fields/date')();
		require('./fields/time')();
		require('./fields/selectbox')();
		require('./fields/checkbox')();
		require('./fields/matrix')();
		require('./fields/dictionary')();

		this.settings.navigation = this.sidebar.navigation.addItem({
			weight: 10000,
			title: 'Settings',
			href: '#',
			icon: 'fa fa-cogs'
		});

		// Once everythign is done
		sinaps.once('idle', function () {

			// Settings router
			this.router.use('/settings', this.settings.router);

			// Resources accessible from the browser
			this.router.use('/resources', express.static(path.resolve(__dirname + '/resources'), {
				index: 'index.html',
				maxAge: sinaps.config.webserver.maxAge
			}));

			// Router is binded to /admin
			sinaps.app.use('/admin', this.router);

		}.bind(this));
	}

});
