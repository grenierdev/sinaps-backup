var env = nunjucks.configure('views');
nunjucks._compile = nunjucks.compile;
nunjucks.compile = function (src) {
	return this._compile(src, env);
}

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
