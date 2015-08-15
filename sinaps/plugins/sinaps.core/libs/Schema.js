var mongoose = require('mongoose');
var _ = require('lodash');

function Schema (options) {
	options = _.extend({
		name: '',
		label: '',

		title: null,
		url: null,
		layouts: []
	}, options);

	this.name = options.name;
	this.label = options.label;
	//this.options = _.omit(options, 'layouts');
	this.layouts = [];
	this.methods = {};
	this._virtuals = {};
	this._pre = {};
	this._post = {};

	if (_.isArray(options.layouts)) {
		options.layouts.forEach(function (layout) {
			this.addLayout(layout.name, layout.label || layout.name, layout.tabs || []);
		}.bind(this));
	}
}

Schema.prototype.virtual = function (virtual, getter, setter) {
	this._virtuals[virtual] = {get: getter, set: setter};
}

Schema.prototype.pre = function (event, callback) {
	if (typeof this._pre[event] == 'undefined')
		this._pre[event] = [];
	this._pre[event].push(callback);
}

Schema.prototype.post = function (event, callback) {
	if (typeof this._post[event] == 'undefined')
		this._post[event] = [];
	this._post[event].push(callback);
}

Schema.prototype.addLayout = function (name, label, tabs) {
	this.layouts.push(new Schema.Layout({
		name: name,
		label: label,
		tabs: tabs
	}));
};

Schema.prototype.getLayout = function (name) {
	for (var i = this.layouts.length; --i >= 0;) {
		if (this.layouts[i].name == name)
			return this.layouts[i];
	}
	return null;
};

Schema.prototype.finalizedSchema = function () {
	if (typeof this._finalizedSchema != 'undefined') {
		return this._finalizedSchema;
	}

	var fields = [];

	this.layouts.forEach(function (layout) {
		layout.tabs.forEach(function (tab) {
			fields.push.apply(fields, tab.fields);
		});
	});

	var definitions = {};
	fields.forEach(function (field) {
		definitions[field.name] = field.finalizedField();
	});

	this._finalizedSchema = mongoose.Schema(_.extend(definitions, {
		layout: {
			type: String,
			default: this.layouts[0].name || '',
			required: true,
			index: true
		}
	}));

	_.forEach(this.methods, function (fn, name) {
		this._finalizedSchema.methods[name] = fn;
	}.bind(this));

	_.forEach(this._virtuals, function (obj, name) {
		var get = obj && obj.get || function () {};
		var set = obj && obj.set || function () {};
		this._finalizedSchema.virtual(name).get(get).set(set);
	}.bind(this));

	_.forEach(this._pre, function (callbacks, name) {
		_.forEach(callbacks, function (callback) {
			this._finalizedSchema.pre(name, callback);
		}.bind(this));
	}.bind(this));

	_.forEach(this._post, function (callbacks, name) {
		_.forEach(callbacks, function (callback) {
			this._finalizedSchema.post(name, callback);
		}.bind(this));
	}.bind(this));

	return this._finalizedSchema;
};

Schema.Layout = function Layout (options) {
	options = _.extend({
		name: '',
		label: '',

		tabs: []
	}, options);

	this.name = options.name;
	this.label = options.label;
	//this.options = _.omit(options, 'tabs');
	this.tabs = [];

	if (_.isArray(options.tabs)) {
		options.tabs.forEach(function (tab) {
			this.addTab(tab.name, tab.label || tab.name, tab.fields || []);
		}.bind(this));
	}
};

Schema.Layout.prototype.addTab = function (name, label, fields) {
	this.tabs.push(new Schema.Tab({
		name: name,
		label: label,
		fields: fields
	}));
};

Schema.Layout.prototype.getTab = function (name) {
	for (var i = this.tabs.length; --i >= 0;) {
		if (this.tabs[i].name == name)
			return this.tabs[i];
	}
	return null;
};

Schema.Tab = function Tab (options) {
	options = _.extend({
		name: '',
		label: '',

		fields: []
	}, options);

	this.name = options.name;
	this.label = options.label;
	//this.options = _.omit(options, 'fields');
	this.fields = [];

	if (_.isArray(options.fields)) {
		options.fields.forEach(function (field) {
			this.addField(field);
		}.bind(this));
	}
};

Schema.Tab.prototype.addField = function (options) {
	this.fields.push(new Schema.Field(options));
};

Schema.Tab.prototype.getField = function (name) {
	for (var i = this.fields.length; --i >= 0;) {
		if (this.fields[i].name == name)
			return this.fields[i];
	}
	return null;
};

Schema.Field = function Field (options) {
	options = _.extend({
		name: '',
		label: '',
		instruction: '',
		type: '',
		default: undefined,

		lang: undefined,
		required: undefined,
		index: undefined,
		unique: undefined
	}, options);


	switch (options.type) {
		case 'object':
			options.fields = (options.fields || []).map(function (field) {
				return new Schema.Field(field);
			});
			break;
		case 'blocks':
			options.blocks = (options.blocks || []).map(function (block) {
				return new Schema.Tab(block);
			});
			break;
	}

	_.extend(this, options);
};

Schema.Field.prototype.finalizedField = function () {
	var definition = {
		type: String,
		default: this.default || undefined,
		required: this.required,
		index: this.index
	};
	var type = null;

	switch (typeof this.type) {
		case 'string': type = this.type; break;
		default:
			if (this.type == String)								type = 'string';
			else if (this.type == Number)							type = 'number';
			else if (this.type == Boolean)							type = 'boolean';
			else if (this.type == Date)								type = 'date';
			else if (this.type == Buffer)							type = 'buffer';
			else if (this.type == mongoose.Schema.Types.ObjectId)	type = 'objectid';
			else if (this.type == mongoose.Schema.Types.Mixed)		type = 'object';
			break;
	}

	switch (type) {
		case 'string':			definition.type = String; break;
		case 'number':			definition.type = Number; break;
		case 'boolean':			definition.type = Boolean; break;
		case 'date':			definition.type = Date; break;
		case 'buffer':			definition.type = Buffer; break;
		case 'objectid':		definition.type = mongoose.Schema.Types.ObjectId; break;
		case 'array':			definition.type = [this.array]; break;
		case 'object':
			definition = {};
			this.fields.forEach(function (field) {
				definition[field.name] = field.finalizedField();
			});
			break;
		case 'blocks':
			definition = {};
			this.blocks.forEach(function (block) {
				block.fields.forEach(function (field) {
					definition[field.name] = field.finalizedField();
				});
			});
			definition.layout = {
				type: String,
				required: true,
				index: true
			};
			definition = [definition];
			break;

		default:
			throw new Error("Unknown field type !");
	}

	if (this.lang) {
		var d = definition;
		definition = {};
		for (var i = sinaps.config.languages.length; --i >= 0;) {
			definition[sinaps.config.languages[i]] = d;
		}
	}

	return definition;
};

module.exports = Schema;
