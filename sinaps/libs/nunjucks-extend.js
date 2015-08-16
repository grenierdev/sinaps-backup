var _ = require('lodash');

module.exports = function (env) {

	env.addFilter('merge', function (input, obj) {
		if (_.isArray(input))
			return input.concat(obj);
		return _.extend({}, obj, input);
	});

	env.addFilter('split', function (input, char) {
		return (input + '').split(char);
	});

}
