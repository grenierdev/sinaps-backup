var UserSchema = require('./schemas/User');
//var mongoose = require('mongoose');


module.exports = {
	executionOrder: -1000,
	UserSchema: UserSchema,
	initialize: function () {

		UserSchema.finalizedSchema();
		//mongoose.model('User', UserSchema.finalizedSchema());

	}
}
