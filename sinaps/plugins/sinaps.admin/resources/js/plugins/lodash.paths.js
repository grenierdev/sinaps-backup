/**
 * Return list of paths for `obj`
 *
 * _.paths({a: {b: 'c'}, d: [1,2,3,{e: 'f'}]});
 * {
 *     'a.b': 'c',
 *     'd.0': 1,
 *     'd.1': 2,
 *     'd.2': 3,
 *     'd.3.e': 'f'
 * }
 *
 */
_.mixin({
	paths: function (obj) {
		var getPaths = function (obj, path) {
			path = typeof path === 'undefined' ? '' : path;
			var paths = {};

			_.each(obj, function (v, k) {
				var p = path != '' ? path + '.' + k : k + '';
				if (_.isObject(v) || _.isArray(v)) {
					_.merge(paths, getPaths(v, p));
				} else {
					paths[p] = v;
				}
			});

			return paths;
		};

		return getPaths(obj);
	}
});
