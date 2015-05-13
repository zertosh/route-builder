'use strict';

var pathToRegexp = require('path-to-regexp');

/**
 * @param {?Array} routes
 * @constructor
 */
function RouteBuilder(routes) {
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
    keys: keys,
    compiler: null
  };
  this._routes.push(route);
  return this;
};

/**
 * @param {String|Array} name name(s) of route(s) to remove
 */
RouteBuilder.prototype.remove = function (name) {
  if (typeof name === 'string') {
    name = [name];
  } else if (!Array.isArray(name)) {
    throw new Error('"name" must be specified');
  }

  this._routes = this._routes.filter(function (route) {
    return name.indexOf(route.name) === -1;
  });
}

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
RouteBuilder.prototype.makePath = function(name, params) {
  var route = this._getRouteByName(name);
  if (!route) return null;
  if (!route.compiler) {
    route.compiler = pathToRegexp.compile(route.path);
  }
  try {
    return route.compiler(params);
  } catch (err) {
    return null;
  }
};

module.exports = RouteBuilder;
