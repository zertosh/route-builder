# route-builder

`route-builder` is a simple path matcher and path maker based on [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) (same as [Express](https://github.com/strongloop/express)). It meant to serve as the foundation for a router.

`route-builder` is borrows on the work of [routr](https://github.com/yahoo/routr) and [reverend](https://github.com/krakenjs/reverend). 

## Usage

#### Adding routes

```js
  var RouteBuilder = require('route-builder');

  // via the constructor
  var router = RouteBuilder([
    ['home', '/'],
    ['post', '/post/:id', { a: 1, b: 2, c: 3 }],
    ['multi_media', '/:type/*anything/:id']
  ]);

  // via the `add` method
  router.add(['single_media', '/:type/single/:id', { x: true, y: false }]);
```

#### Matching

```js
  router.hasMatch('/post/123');
  //=> true

  router.hasMatch('/cats');
  //=> false
```

```js
  router.match('/post/123');
  //=> { name: 'post', meta: {a: 1, b: 2, c: 3}, params: {id: '123'}}

  router.match('/cats');
  //=> null
```

#### Make path


```js
  router.makePath('post', {id: '456'});
  //=> '/post/456'

  // missing required params
  router.makePath('post');
  //=> null

  // non-existing route
  router.makePath('cats');
  //=> null
```
