var _ = require('lodash');
var util = require('util');
var moment = require('moment');

module.exports = function (env) {

	env.addGlobal('max', Math.max);
	env.addGlobal('min', Math.min);
	env.addGlobal('floor', Math.floor);
	env.addGlobal('ceil', Math.ceil);
	env.addGlobal('round', Math.round);

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

	env.addFilter('date', function (input, format) {
		var m = moment(input)
		return m.isValid() ? m.format(format || 'YYYY-MM-DD') : '';
	});
};
