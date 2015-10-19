var util = require('util');
var _ = require('lodash');
var mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate');

function Schema (options) {
	options = _.extend({
		handle: '',
		label: '',

		title: null,
		url: null,
		layouts: []
	}, options);

	this.handle = options.handle;
	this.label = options.label;
	this.layouts = [];

	this.methods = {};
	this._virtuals = {};
	this._pre = {};
	this._post = {};

	if (_.isArray(options.layouts)) {
		options.layouts.forEach(function (layout) {
			this.addLayout(layout.handle, layout.label || layout.handle, layout.tabs || []);
		}.bind(this));
	}
}

Schema.prototype.fields = function () {
	var fields = {};

	var blockField = function (block, paths) {
		paths.push(block.handle);
		_.each(block.fields, function (field) {
			var p = paths.concat();
			p.push(field.handle);
			fields[paths.join('.')] = field;
			if (field.input == 'matrix') {
				_.each(field.blocks, function (block) {
					blockField(block, p.concat());
				});
			}
		});
	};

	_.each(this.layouts, function (layout) {
		_.each(layout.tabs, function (tab) {
			_.each(tab.fields, function (field) {
				var paths = [layout.handle, tab.handle, field.handle];
				fields[paths.join('.')] = field;
				if (field.input == 'matrix') {
					_.each(field.blocks, function (block) {
						blockField(block, paths.concat());
					});
				}
			});
		});
	});

	return fields;
};

Schema.prototype.virtual = function (virtual, getter, setter) {
	this._virtuals[virtual] = {get: getter, set: setter};
};

Schema.prototype.pre = function (event, callback) {
	if (typeof this._pre[event] == 'undefined')
		this._pre[event] = [];
	this._pre[event].push(callback);
};

Schema.prototype.post = function (event, callback) {
	if (typeof this._post[event] == 'undefined')
		this._post[event] = [];
	this._post[event].push(callback);
};

Schema.prototype.addLayout = function (handle, label, tabs) {
	this.layouts.push(new Schema.Layout({
		handle: handle,
		label: label,
		tabs: tabs
	}));
};

Schema.prototype.getLayout = function (handle) {
	for (var i = this.layouts.length; --i >= 0;) {
		if (this.layouts[i].handle == handle)
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
		definitions[field.handle] = field.finalizedField();
	});

	this._finalizedSchema = mongoose.Schema(_.extend(definitions, {
		layout: {
			type: String,
			default: this.layouts[0].handle || '',
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

	this._finalizedSchema.plugin(autopopulate);

	return this._finalizedSchema;
};

Schema.Layout = function Layout (options) {
	options = _.extend({
		handle: '',
		label: '',

		tabs: []
	}, options);

	this.handle = options.handle;
	this.label = options.label;
	//this.options = _.omit(options, 'tabs');
	this.tabs = [];

	if (_.isArray(options.tabs)) {
		options.tabs.forEach(function (tab) {
			this.addTab(tab.handle, tab.label || tab.handle, tab.fields || []);
		}.bind(this));
	}
};

Schema.Layout.prototype.addTab = function (handle, label, fields) {
	this.tabs.push(new Schema.Tab({
		handle: handle,
		label: label,
		fields: fields
	}));
};

Schema.Layout.prototype.getTab = function (handle) {
	for (var i = this.tabs.length; --i >= 0;) {
		if (this.tabs[i].handle == handle)
			return this.tabs[i];
	}
	return null;
};

Schema.Tab = function Tab (options) {
	options = _.extend({
		handle: '',
		label: '',

		fields: []
	}, options);

	this.handle = options.handle;
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

Schema.Tab.prototype.getField = function (handle) {
	for (var i = this.fields.length; --i >= 0;) {
		if (this.fields[i].handle == handle)
			return this.fields[i];
	}
	return null;
};

Schema.Field = function Field (options) {
	options = _.extend({
		handle: '',
		label: '',
		instruction: '',
		type: '',
		default: undefined,
		input: '',

		lang: undefined,
		required: undefined,
		index: undefined,
		unique: undefined,
		getter: undefined,
		setter: undefined
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

Schema.Field.prototype.finalizedField = function (depth) {
	depth = parseInt(depth, 10) || 0;

	var definition = {
		type: String,
	};
	if (this.default)
		definition.default = this.default;
	if (this.index)
		definition.index = this.index;
	if (depth == 0 && this.required)
		definition.required = this.required;
	if (_.isFunction(this.getter))
		definition.get = this.getter;
	if (_.isFunction(this.setter))
		definition.set = this.setter;

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
			else {
				throw new Error("Unknown field type `" + this.type + "` for " + util.inspect(this));
			}
			break;
	}

	switch (type) {
		case 'string':			definition.type = String; break;
		case 'number':			definition.type = Number; break;
		case 'boolean':			definition.type = Boolean; break;
		case 'date':			definition.type = Date; break;
		case 'buffer':			definition.type = Buffer; break;
		case 'objectid':		definition.type = mongoose.Schema.Types.ObjectId; break;
		case 'array':			definition.type = []; break;//[new Schema.Field({type: this.array}).finalizedField(depth + 1)]; break;
		case 'object':
			definition = {};
			this.fields.forEach(function (field) {
				definition[field.handle] = field.finalizedField(depth + 1);
			});
			break;
		case 'blocks':
			definition = {
				type: {
					type: String,
					default: '',
					index: true
				}
			};
			this.blocks.forEach(function (block) {
				block.fields.forEach(function (field) {
					definition[field.handle] = field.finalizedField(depth + 1);
				});
			});

			definition = [definition];
			break;
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
