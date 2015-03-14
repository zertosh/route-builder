'use strict';

var assert = require('assert');

describe('route-builder', function() {

  var RouteBuilder = require('../');

  var TestRoutes = [
    ['home', '/'],
    ['post', '/post/:id', { a: 1, b: 2, c: 3 }],
    ['single_media', '/:type/single/:id', { x: true, y: false }],
    ['multi_media', '/:type/*anything/:id']
  ];

  describe('#constructor', function() {
    it('should init correctly without routes', function() {
      var router = new RouteBuilder();
      assert.equal(Object.keys(router._routes).length, 0);
    });
    it('should init correctly with routes', function() {
      var router = new RouteBuilder(TestRoutes);
      assert.equal(Object.keys(router._routes).length, 4);
    });
  });

  describe('#add', function() {
    it('should add routes correctly', function() {
      var router = new RouteBuilder();
      router.add(TestRoutes[0]);
      router.add(TestRoutes[1]);
      assert.equal(Object.keys(router._routes).length, 2);
    });
  });

  describe('#hasMatch', function() {
    it('should match an existing route', function() {
      var router = new RouteBuilder(TestRoutes);
      assert.ok(router.hasMatch('/post/1232'));
    });
    it('should not match a non-existing route', function() {
      var router = new RouteBuilder(TestRoutes);
      assert.ok(!router.hasMatch('/post'));
    });
  });

  describe('#match', function() {
    it('should match an existing route', function() {
      var router = new RouteBuilder(TestRoutes);
      var match = router.match('/post/123');
      assert.deepEqual(match, {
        name: match.name,
        meta: match.meta,
        params: { id: '123' }
      });
    });
    it('should not match a non-existing route', function() {
      var router = new RouteBuilder(TestRoutes);
      var match = router.match('/post');
      assert.strictEqual(match, null);
    });
    it('should match in the correct order', function() {
      var testRoutes = [ ['catch-all', '/:anything*'] ].concat( TestRoutes );
      var router = new RouteBuilder(testRoutes);
      var match = router.match('/post');
      assert.strictEqual(match.name, 'catch-all');
    });
  });

  describe('#_getRouteByPath', function() {
    it('should match an existing route', function() {
      var router = new RouteBuilder(TestRoutes);
      var route = router._getRouteByPath('/post/123');
      assert.deepEqual(route, router._routes[1]);
    });
    it('should not match a non-existing route', function() {
      var router = new RouteBuilder(TestRoutes);
      var route = router._getRouteByPath('/posts');
      assert.equal(route, null);
    });
  });

  describe('#_getRouteByName', function() {
    it('should match an existing route', function() {
      var router = new RouteBuilder(TestRoutes);
      var route = router._getRouteByName('post');
      assert.deepEqual(route.meta, TestRoutes[1][2]);
    });
    it('should not match a non-existing route', function() {
      var router = new RouteBuilder(TestRoutes);
      var route = router._getRouteByName('posts');
      assert.equal(route, null);
    });
  });

  describe('#makePath', function() {
    it('should make a path without params', function() {
      var router = new RouteBuilder(TestRoutes);
      var path = router.makePath('home');
      assert.equal(path, '/');
    });
    it('should make a path with params', function() {
      var router = new RouteBuilder(TestRoutes);
      var path = router.makePath('post', { id: 123 });
      assert.equal(path, '/post/123');
    });
    it('should not make a path when missing params', function() {
      var router = new RouteBuilder(TestRoutes);
      var path = router.makePath('post');
      assert.equal(path, null);
    });
    it('should not make a path when path doesn\'t match', function() {
      var router = new RouteBuilder(TestRoutes);
      var path = router.makePath('posts');
      assert.equal(path, null);
    });
  });
});
