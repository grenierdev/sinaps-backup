var _ = require('lodash');
var util = require('util');

module.exports = function (env) {

	env.addFilter('merge', function (input, obj) {
		if (_.isArray(input))
			return input.concat(obj);
		return _.extend({}, obj, input);
	});

	env.addFilter('split', function (input, char) {
		return (input + '').split(char);
	});

	env.addFilter('json', function (input) {
		return JSON.stringify(input);
	});

	env.addFilter('inspect', function (input, depth) {
		if (input && typeof input.toJSON == 'function') {
			input = input.toJSON();
		}
		return util.inspect(input, {
			depth: parseInt(depth, 10) || 1
		});
	});


};
