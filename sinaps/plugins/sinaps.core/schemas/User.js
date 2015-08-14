var Schema = require('../libs/Schema');
var crypto = require('crypto');

var UserSchema = new Schema({
	name: 'user',
	label: 'User',
	layouts: [
		{
			name: 'user',
			label: 'User',
			tabs: [
				{
					name: 'profile',
					label: 'Profile',
					fields: [
						{
							name: 'display',
							label: 'Display',
							type: 'string'
						},
						{
							name: 'email',
							label: 'Email',
							type: 'string',
							required: true,
							index: true
						},
						{
							name: 'password',
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
