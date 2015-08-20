var Schema = require('../libs/Schema');
var crypto = require('crypto');

var UserSchema = new Schema({
	handle: 'user',
	label: 'User',
	layouts: [
		{
			handle: 'user',
			label: 'User',
			tabs: [
				{
					handle: 'profile',
					label: 'Profile',
					fields: [
						{
							handle: 'display',
							label: 'Display',
							type: 'string'
						},
						{
							handle: 'email',
							label: 'Email',
							type: 'string',
							required: true,
							index: true
						},
						{
							handle: 'password',
							label: 'Password',
							type: 'string',
							require: true
						}
					]
				}
			]
		}
	]
});

UserSchema.methods.setPassword = function (password) {
	this.password = crypto.createHash('sha256').update(password).digest('base64');
};

UserSchema.methods.verifyPassword = function (password) {
	return this.password == crypto.createHash('sha256').update(password).digest('base64');
};

module.exports = UserSchema;
