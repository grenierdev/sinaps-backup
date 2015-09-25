var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var chokidar = require('chokidar');
var nunjucks = require('nunjucks');

module.exports = nunjucks.Loader.extend({
	init: function(searchPaths, noWatch, noCache) {
		this.pathsToNames = {};
		this.watchers = {};
		this.noWatch = !!noWatch;
		this.noCache = !!noCache;
		this.searchPaths = searchPaths;

	},

	_watchPrefix: function (prefix) {
		if (this.noWatch || typeof this.watchers[prefix] != 'undefined') {
			return;
		}

		this.watchers[prefix] = chokidar.watch(this.searchPaths[prefix]);
		this.watchers[prefix].on('all', function (event, fullname) {
			fullname = path.resolve(fullname);
			if (event === 'change' && fullname in this.pathsToNames) {
				this.emit('update', this.pathsToNames[fullname]);
			}
		}.bind(this));
	},

	getSource: function(name) {
		var paths = path.normalize(name).split(path.sep);
		var prefix = paths.shift();
		var fullpath;

		if (typeof this.searchPaths[prefix] == 'undefined') {
			paths.unshift(prefix);
			prefix = 'public';
		}

		fullpath = path.join(this.searchPaths[prefix], paths.join(path.sep));

		// If fullpath went outside searchPaths root OR not exist
		if (fullpath.indexOf(this.searchPaths[prefix]) > 0 || fs.existsSync(fullpath) === false) {
			return null;
		}

		this.pathsToNames[fullpath] = name;

		this._watchPrefix(prefix);

		return { src: fs.readFileSync(fullpath, 'utf-8'),
				 path: fullpath,
				 noCache: this.noCache };
	}
});
