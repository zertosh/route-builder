'use strict';

var pathToRegexp = require('path-to-regexp');

/**
 * @param {?Array} routes
 * @constructor
 */
function RouteBuilder(routes) {
  if (!(this instanceof RouteBuilder)) {
    return new RouteBuilder(routes);
  }
  this._routes = [];
  if (Array.isArray(routes)) {
    routes.forEach(this.add, this);
  }
}

/**
 * @param {String|Array} name name of the route or array of [name, path, meta]
 * @param {String} path pattern of the route
 * @param {*} [meta] additional data associated with the route
 * @return {RouteBuilder}
 */
RouteBuilder.prototype.add = function(name, path, meta) {
  if (Array.isArray(name)) {
    meta = name[2];
    path = name[1];
    name = name[0];
  }
  if (!name || !path) {
    throw new Error('"name" and "path" must be defined');
  }
  var keys = [];
  var regexp = pathToRegexp(path, keys);
  var route = {
    name: name,
    path: path,
    meta: meta,
    regexp: regexp,
    keys: keys
  };
  this._routes.push(route);
  return this;
};


/**
 * @param {String} path
 * @return {Boolean}
 */
RouteBuilder.prototype.hasMatch = function(path) {
  return this._routes.some(function(route) {
    return !!route.regexp.exec(path);
  });
};

/**
 * @param {String} path
 * @return {?Object}
 */
RouteBuilder.prototype.match = function(path) {
  var route = this._getRouteByPath(path);
  var found = null;
  if (route) {
    var matches = route.regexp.exec(path);
    found = {
      name: route.name,
      meta: route.meta,
      params: {}
    };
    route.keys.forEach(function(key, i) {
      found.params[key.name] = matches[i+1];
    });
  }
  return found;
};

/**
 * @param {String} path
 * @return {?Object}
 */
RouteBuilder.prototype._getRouteByPath = function(path) {
  var found = null;
  this._routes.some(function(route) {
    if (route.regexp.test(path)) {
      found = route;
      return true;
    }
  });
  return found;
};

/**
 * @param {String} name
 * @return {?Object}
 */
RouteBuilder.prototype._getRouteByName = function(name) {
  var found = null;
  this._routes.some(function(route) {
    if (route.name === name) {
      found = route;
      return true;
    }
  });
  return found;
};

/**
 * @param {String} name
 * @param {Object} [params]
 * @return {?String}
 */
// Mostly from: https://github.com/krakenjs/reverend/blob/ec4db33/index.js
RouteBuilder.prototype.makePath = function(name, params) {
  var route = this._getRouteByName(name);

  if (!route) {
    return null;
  }

  var path = route.path;

  var valid = route.keys.every(function(key) {

    // Enforce required keys having a value.
    if (!key.optional) {
      if (!params || params[key.name] === undefined) {
        return false;
      }
    }

    var value = params[key.name];

    // Pattern used in both unnamed (e.g., "/posts/(.*)") and custom match
    // parameters (e.g., "/posts/:id(\\d+)").
    var regex = '\\(((?:\\\\.|[^)])*)\\)';

    // A key's `name` will be a String for named parameters, and a Number
    // for unnamed parameters. This prefixes the base regexp pattern with
    // the name, and makes the custom-matching part optional (which follows
    // what path-to-regexp does.)
    if (typeof key.name === 'string') {
      regex = '\\:' + key.name + '(?:' + regex + ')?';
    }

    // Append suffix pattern.
    regex += '([+*?])?';

    if (key.optional && value === undefined) {
      // No value so remove potential trailing '/'
      // since the path segment is optional.
      value = '';
      regex += '\\/?';
    }

    value = encodeURIComponent(value);
    path = path.replace(new RegExp(regex), value);

    return true;
  });

  // Make sure the `path` produced will actually be matched by the `route`.
  if (!valid || !route.regexp.test(path)) {
    return null;
  }

  return path;
};

module.exports = RouteBuilder;
