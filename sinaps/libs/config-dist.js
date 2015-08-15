var path = require('path');

module.exports = {
	workers: 1,
	path: path.join(__dirname, '..'),
	languages: ['en'],
	secret: 'keyboard cat',
	webserver: {
		host: '0.0.0.0',
		port: 80,
		static: '../public_html',
		maxAge: '1d',
		maxFiles: 10,
		maxFileSize: 10 * 1024 * 1024,
		maxFieldSize: 1 * 1024 * 1024, // 1Mb
		compression: 6
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
};
