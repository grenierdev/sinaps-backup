var _ = require('lodash');
var pluginAdmin = sinaps.require('sinaps.admin');
var FieldType = pluginAdmin.FieldType;

module.exports = function () {

	// Entry
	pluginAdmin.registerFieldType(new FieldType({
		handle: 'entry',
		label: 'Entry',
		type: 'objectid',
		settings: {

		}
	}));
};
