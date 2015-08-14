var _ = require('lodash');
var fs = require('fs');
var path = require('path');

module.exports = {

    pathApp: function (app) {

        var view = app.get('view');
        var lookupProxy = view.prototype.lookup;

        view.prototype.lookup = function (name) {
            var roots = this.root;
            var paths = path.normalize(name).split(path.sep);
            var prefix = paths.shift();

            if (typeof roots[prefix] == 'undefined') {
                paths.unshift(prefix);
                prefix = 'public';
            }

            name = paths.join('/');

            this.root = roots[prefix];
            var match = lookupProxy.call(this, name);
            this.root = roots;

            return match;
        };

    },

    swigLoader: function (basepaths, encoding) {
        var ret = {};

        encoding = encoding || 'utf8';

        ret.resolve = function (to, from) {
            from = (from) ? path.dirname(from) : process.cwd();
            to = path.normalize(to);

            var tos = to.split(path.sep);
            var prefix = tos.shift();
            if (typeof basepaths[prefix] != 'undefined') {
                return path.join(basepaths[prefix], tos.join(path.sep));
            }

            return path.resolve(from, to);
        };

        ret.load = function (identifier, cb) {
            if (!fs || (cb && !fs.readFile) || !fs.readFileSync) {
                throw new Error('Unable to find file ' + identifier + ' because there is no filesystem to read from.');
            }

            identifier = ret.resolve(identifier);

            if (cb) {
                fs.readFile(identifier, encoding, cb);
                return;
            }
            return fs.readFileSync(identifier, encoding);
        };

        return ret;
    }
};
