var _ = require('lodash');

module.exports = function (swig) {

	swig.setFilter('merge', function (input, obj) {
		if (_.isArray(input))
			return input.concat(obj);
		return _.extend({}, obj, input);
	});

	swig.setFilter('split', function (input, char) {
		return (input + '').split(char);
	});

}
