var env = nunjucks.configure('views');
nunjucks._compile = nunjucks.compile;
nunjucks.compile = function (src) {
	return this._compile(src, env);
}

env.addGlobal('max', Math.max);
env.addGlobal('min', Math.min);
env.addGlobal('floor', Math.floor);
env.addGlobal('ceil', Math.ceil);
env.addGlobal('round', Math.round);

env.addFilter('merge', function (input, obj) {
	if (_.isArray(input))
		return input.concat(obj);
	return _.extend({}, obj, input);
});

env.addFilter('split', function (input, char) {
	return (input + '').split(char);
});

env.addFilter('json', function (input) {
	return JSON.stringify(input);
});

env.addFilter('date', function (input, format) {
	var m = moment(input)
	return m.isValid() ? m.format(format || 'YYYY-MM-DD') : '';
});

env.addFilter('format', function () {
	var args = Array.prototype.slice.call(arguments),
		input = args.shift();
	return input.replace(/%s/g, function () {
		return args.length > 0 ? args.shift() : '';
	});
});
