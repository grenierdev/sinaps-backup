var _ = require('lodash');
var pluginAdmin = sinaps.require('sinaps.admin');
var pluginSection = sinaps.require('sinaps.section');

module.exports = function () {

	pluginAdmin.router.get('/sections/:handle/', function (req, res) {

		res.send('Bleh');

	});
}
