var util = require('util');
var mongoose = require('mongoose');
var Schema = require('./libs/Schema');


module.exports = {
	executionOrder: -1000,
	initialize: function () {

		var UserSchema = new Schema({
			name: 'user',
			layouts: [
				{
					name: 'user',
					tabs: [
						{
							name: 'profile',
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
						},
						{
							name: 'custom',
							fields: [
								{
									name: 'picture',
									label: 'Picture',
									type: 'string'
								},
								{
									name: 'links',
									label: 'Links',
									type: 'blocks',
									blocks: [
										{
											name: 'website',
											fields: [
												{
													name: 'title',
													type: 'string'
												},
												{
													name: 'url',
													type: 'string'
												}
											]
										},
										{
											name: 'youtube',
											fields: [
												{
													name: 'title',
													type: 'string'
												},
												{
													name: 'url',
													type: 'string'
												}
											]
										}
									]
								}
							]
						}
					]
				}
			]
		});

		mongoose.model('User', UserSchema.finalizedSchema());

	},
	exports: {
		Schema: Schema
	}
}
