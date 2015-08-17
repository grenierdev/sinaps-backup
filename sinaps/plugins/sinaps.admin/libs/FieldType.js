var _ = require('lodash');


function FieldType (options) {
	options = _.merge({
		name: '',
		label: '',
	}, options);
}


module.exports = FieldType;
