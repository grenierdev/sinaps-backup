var _ = require('lodash');
var path = require('path');
var express = require('express');
var passport = require('passport');
var EventEmitter = require('events').EventEmitter;

module.exports = _.extend({}, EventEmitter.prototype, {

	// Admin router
	router: express.Router(),

	// Order in which plugins are executed
	executionOrder: -500,

	// Main function that sinaps execute
	initialize: function () {

		// Setup secure router
		{
			// Require user or send to login (white list login, resources)
			this.router.use(function (req, res, next) {
				if (req.user || req.url.match(/^\/(login|resources)/i)) {
					//sinaps.nunjuck.addGlobal('user', req.user);
					sinaps.swig.setDefaults({ user: req.user });
					next();
				} else {
					res.redirect('/admin/login');
				}
			});

			// Show login page
			this.router.get('/login', function (req, res) {
				res.render('js.sinaps.admin/auth', {
					error: req.query.error || '',
					username: req.query.username || ''
				});
			});

			// Login
			this.router.post('/login', function (req, res, next) {
				// Use globaly storage to find user (using fields : username, password)
				passport.authenticate('local', function (err, user, info) {
					// Could not find user
					if (err || !user)
						return res.redirect('/admin/login?error=&username=' + req.body.username);

					// Bind this request and the user found
					req.logIn(user, function (err) {
						if (err)
							return res.redirect('/admin/login?error=');
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

		// Once everythign is done
		sinaps.once('idle', function () {

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
