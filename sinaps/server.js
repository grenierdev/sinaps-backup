#!/usr/bin/env node

// Help file
{
	process.exitCode = 1; // gracefully/crashed
	function exit () {
		setTimeout(function() { process.exit(500); }, 1);
	}

	var optimist = require('optimist')
				.usage('Usage [options]')
				.alias('h', 'help')
				.describe('help', 'Display usage')
				.describe('loglevel', 'Log level : 1 = log, 2 = info, 3 = warn, 4 = error')

	// Get arguments
	var argv = optimist.argv;

	// Show helps
	if (argv.help) {
		optimist.showHelp();
		process.exit();
	}
}

// Requires
{
	var util = require('util');
	var colors = require('cli-color');
	var fs = require('fs');
	var path = require('path');
	var _ = require('lodash');
	var EventEmitter = require('events').EventEmitter;
	var http = require('http');
	var express = require('express');
	var mongoose = require('mongoose');
	var socketio = require('socket.io');
	var swig = require('swig');
	var grunt = require('grunt');

	// Hijack console
	var loglevel = 1;
	switch ((argv.loglevel || 'log').toLowerCase()) {
		case 'error': loglevel = 4; break;
		case 'warn': loglevel = 3; break;
		case 'info': loglevel = 2; break;
	}
	console.log = function () { if (loglevel <= 1) { process.stdout.write(new Date().toISOString() + " [LOG]   " + util.format.apply(this, arguments) + "\n"); } };
	console.info = function () { if (loglevel <= 2) { process.stdout.write(new Date().toISOString() + colors.cyan(" [INFO]  ") + util.format.apply(this, arguments) + "\n"); } };
	console.warn = function () { if (loglevel <= 3) { process.stdout.write(new Date().toISOString() + colors.yellow(" [WARN]  ") + util.format.apply(this, arguments) + "\n"); } };
	console.error = function () { if (loglevel <= 4) { process.stdout.write(new Date().toISOString() + colors.red(" [ERROR] ") + util.format.apply(this, arguments) + "\n"); } };

	process.on('uncaughtException', function (err) {
		console.error(err.stack);
	});

	var app = express();
	var server = http.Server(app);
	var layouts = {};
	sinaps = _.extend({}, EventEmitter.prototype, {
		config: null,
		plugins: [],
		app: app,
		router: express.Router(),
		db: mongoose,
		server: server,
		io: socketio(server),

		require: function (plugin) {
			for (var i = 0, l = this.plugins.length; i < l; ++i) {
				if (this.plugins[i].name == plugin) {
					return this.plugins[i];
				}
			}

			console.error("Could not find plugin `%s`", plugin);
			exit();
		}
	});
}

console.info('================================================');

// Read configuration file
{
	sinaps.config = _.merge({
		path: __dirname,
		secret: 'keyboard cat',
		webserver: {
			host: '0.0.0.0',
			port: 80,
			static: '../public_html',
			maxFiles: 10,
			maxFileSize: 10 * 1024 * 1024,
			maxFieldSize: 1 * 1024 * 1024, // 1Mb
		},
		session: {
			name: 'sinaps.sid',
			path: '/',
			httpOnly: true,
			secure: false,
			maxAge: 30 * 24 * 60 * 60 * 1000
		},
		mongodb: {
			host: 'localhost',
			port: 27017,
			db: 'test'
		},
		template: {
			path: './templates',
			cache: false
		}
	}, require('./config.js'));
	//console.info('Configuration : %s', JSON.stringify(sinaps.config));
}

// Startup server
{
	var wait = sinaps.config.mongodb === false ? 1 : 2; // express, mongodb
	sinaps.on('connected', function () {
		if (--wait > 0)
			return;

		// Finish up express app
		{
			sinaps.app.disable('x-powered-by'); // remove header
			sinaps.app.use(require('cookie-parser')()); // read cookie https://github.com/expressjs/cookie-parser#example
			sinaps.app.use(require('body-parser').urlencoded({ // read form https://github.com/expressjs/body-parser#examples
				extended: true
			}));
			var session = require('express-session');
			var MongoStore = require('connect-mongo')(session);
			sinaps.app.use(session({ // session using mongostore https://github.com/kcbanner/connect-mongo
				name: sinaps.config.session.name,
				cookie: {
					path: sinaps.config.session.path,
					httpOnly: sinaps.config.session.httpOnly,
					secure: sinaps.config.session.secure,
					maxAge: sinaps.config.session.maxAge
				},
				secret: sinaps.config.secret,
				resave: false,
				saveUninitialized: false,
				store: new MongoStore({
					mongooseConnection: sinaps.db.connection,
					collection: 'sessions',
					stringify: false
				})
			}));
			/*sinaps.app.use(require('connect-busboy')({ // read file https://www.npmjs.com/plugin/connect-busboy#example
				limits: {
					fieldSize: sinaps.config.webserver.maxFieldSize,
					fileSize: sinaps.config.webserver.maxFileSize,
					files: sinaps.config.webserver.maxFiles
				}
			}));*/
		}

		// Load plugins
		{
			console.info('Loading plugins');
			_.each(fs.readdirSync(path.resolve(__dirname + '/plugins')), function (name) {
				var plugin;
				try {
					plugin = require(path.resolve(__dirname + '/plugins/' + name + '/main.js'));
					plugin.name = name;
					plugin.executionOrder = parseInt(plugin.executionOrder, 10) || 0;
					sinaps.plugins.push(plugin);
					console.info("  `%s` loaded", name);
				} catch (e) {
					console.warn("  `%s` could not be loaded : %s", name, e.stack);
				}
			});

			sinaps.plugins.sort(function (a, b) {
				if (a.executionOrder == b.executionOrder)
					return 0;
				return a.executionOrder > b.executionOrder ? 1 : -1;
			});
		}

		// Configure template engine
		{
			var templates = { 'public': path.resolve(__dirname + '/' + sinaps.config.template.path) };
			_.each(sinaps.plugins, function (plugin) {
				templates[plugin.name] = path.resolve(__dirname + '/plugins/' + plugin.name + '/templates');
			});

			sinaps.app.set('views', templates);
			sinaps.app.set('view engine', 'html');
			sinaps.app.set('view cache', sinaps.config.template.cache);

			var expressmultiplepaths = require('./libs/express-multiple-paths');
			expressmultiplepaths.pathApp(sinaps.app); // enable multiple folder lookup

			sinaps.app.engine('html', swig.renderFile);
			sinaps.swig = swig;
			sinaps.swig.setDefaults({
				cache: sinaps.config.template.cache ? 'memory' : false,
				loader: expressmultiplepaths.swigLoader(templates)
			});
			sinaps.app.locals.sinaps = sinaps;
		}

		console.info('Initialize plugins');
		_.each(sinaps.plugins, function (plugin) {
			try {
				plugin.initialize();
			} catch (e) {
				console.warn("  `%s` could not be initialize : %s", plugin.name, e.stack);
			}
		});

		// Initialized
		sinaps.emit('initialized');

		// Use sinaps router
		sinaps.app.use('/', sinaps.router);

		console.info('Server initialized and serving');
		sinaps.emit('idle');

		// If didn't catch in route, might be a static file
		sinaps.app.use('/', express.static(path.resolve(__dirname + '/' + sinaps.config.webserver.static), {
			index: 'index.html',
			maxAge: '1d'
		}));

		// Still didn't catch any static files, throw 404
		sinaps.app.use(function (req, res, next) {
			res.status(404).render('404', {
				requested: req.originalUrl
			});
		});

		// Oupsy! throw 500
		sinaps.app.use(function (err, req, res, next) {
			console.error(err.stack);
			res.status(500).render('500', {
				error: err
			});
		});
	});


}

// Connect to mongodb
if (sinaps.config.mongodb !== false) {
	var mongodburi = util.format('mongodb://%s:%s/%s', sinaps.config.mongodb.host, sinaps.config.mongodb.port, sinaps.config.mongodb.db);//'mongodb://' + sinaps.config.mongodb.host + ':' + sinaps.config.mongodb.port + '/';
	console.info('Mongodb at %s', mongodburi);
	sinaps.db.connect(mongodburi, function (e) {
		if (e) {
			console.error(e.stack);
			exit();
			return;
		}
		console.info('Mongodb connected');
		sinaps.emit('connected');
	});
}

// Create webserver
{
	console.info('Webserver at http://%s:%s', sinaps.config.webserver.host, sinaps.config.webserver.port);
	sinaps.server.listen(
		sinaps.config.webserver.port,
		sinaps.config.webserver.host,
		function () {
			console.info('Webserver listening');
			sinaps.emit('connected');
		}
	);
	sinaps.server.on('error', function (e) {
		console.error(e.stack);
		exit();
		return;
	});
}
