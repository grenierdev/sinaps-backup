var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var pluginAdmin = sinaps.require('sinaps.admin');
var Schema = sinaps.require('sinaps.core').Schema;
var SectionSchema = require('./schemas/Section');
var SectionModel;
var mongoose = require('mongoose');

module.exports = _.extend({}, EventEmitter.prototype, {

	// Schemas
	SectionSchema: SectionSchema,

	// Models
	SectionModel: SectionModel,

	// Sections collection
	sections: [],

	// Get schema by section handle
	schema: function (handle) {
		for (var i = this.sections.length; --i >= 0;) {
			if (this.sections[i].schema.handle == handle)
				return this.sections[i].schema;
		}
		return undefined;
	},

	// Get list of loaded schemas
	schemas: function () {
		return this.sections.map(function (section) {
			return section.schema;
		});
	},

	// Get model by section handle
	model: function (handle) {
		for (var i = this.sections.length; --i >= 0;) {
			if (this.sections[i].schema.handle == handle)
				return this.sections[i].model;
		}
		return undefined;
	},

	// Get list of loaded models
	models: function () {
		return this.sections.map(function (section) {
			return section.model;
		});
	},

	//
	addSchema: function (schema, model) {
		this.sections.push({
			model: model || null,
			schema: schema,
			entryModel: undefined,
			entrySchema: undefined
		});
	},

	// Order in which plugins are executed
	executionOrder: -400,

	// Main function that sinaps execute
	initialize: function () {

		sinaps.once('initialized', function () {

			// Setup user model based on schema
			this.SectionModel = mongoose.model('section', SectionSchema.finalizedSchema());

			// Load section from database
			this.SectionModel.find({}, function (err, models) {
				if (err)
					return;

				// Build schema, nav
				models.forEach(function (model) {

					this.addSchema(model.getLayoutSchema(), model);

				}.bind(this));

				// Let others extend sections
				this.emit('loaded');

				// Admin sidebar nav group
				var sectionNav = pluginAdmin.sidebar.navigation.addItem({
					weight: 0,
					title: 'Sections',
					href: '/admin/sections/',
					icon: 'icon-drawer'
				});

				// Build model after everyone messed with the schemas
				this.sections.forEach(function (section) {

					sectionNav.addItem({
						title: section.schema.label,
						href: '/admin/sections/' + section.schema.handle + '/',
						icon: 'icon-doc'
					});

					section.entrySchema = section.schema.finalizedSchema();
					section.entryModel = mongoose.model(section.schema.handle, section.entrySchema);
				});

				// Let others know models are ready
				this.emit('ready');

			}.bind(this));

		}.bind(this));

		// Initialize admin
		require('./admin-section.js')();
		require('./admin-model.js')();

		// All plugin have initalized
		sinaps.once('idle', function () {

			sinaps.app.use(function (req, res) {
				res.send('Is it a section url ?');
				/*res.status(404).render('404', {
					requested: req.originalUrl
				});*/
			});

		});

	}

});
