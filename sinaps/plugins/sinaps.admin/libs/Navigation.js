var _ = require('lodash');

function Navigation () {

	this.items = [];
	this.groups = [];

}

Navigation.Item = function Item (options) {
	options = item = _.extend({
		weight: 0,
		title: '',
		href: '',
		icon: '',
		label: '',
		labelColor: 'success',
		badge: '',
		badgeColor: 'danger',
		items: []
	}, options);

	_.extend(this, _.omit(options, options));

	this.items = [];

	options.items.forEach(function (item) {
		this.addItem(item);
	}.bind(this));
}

Navigation.Item.prototype.addItem = function (options) {
	var item = new Navigation.Item(options);

	this.items.push(item);
	this.items.sort(function (a, b) {
		if (a.weight == b.weight)
			return 0;
		return a.weight > b.weight ? 1 : -1;
	});

	return item;
}

Navigation.Group = function Group (options) {
	options = item = _.extend({
		weight: 0,
		name: '',
		title: '',
		items: []
	}, options);

	_.extend(this, _.omit(options, options));

	this.items = [];

	options.items.forEach(function (item) {
		this.addItem(item);
	}.bind(this));
}

Navigation.Group.prototype.addItem = Navigation.Item.prototype.addItem;

Navigation.prototype.addItem = Navigation.Item.prototype.addItem;

Navigation.prototype.addGroup = function (options) {
	var group = new Navigation.Group(options);

	this.groups.push(group);
	this.groups.sort(function (a, b) {
		if (a.weight == b.weight)
			return 0;
		return a.weight > b.weight ? 1 : -1;
	});

	return group;
}

Navigation.prototype.group = function (name) {
	for (var i = this.groups.length; --i >= 0;) {
		if (this.groups[i].name == name) {
			return this.groups[i];
		}
	}
	return undefined;
}

module.exports = Navigation;
