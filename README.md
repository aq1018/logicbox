logicbox.js
===========

[![NPM version](https://badge.fury.io/js/logicbox.png)](http://badge.fury.io/js/logicbox)
[![Build Status](https://travis-ci.org/aq1018/logicbox.png?branch=master)](https://travis-ci.org/aq1018/logicbox)
[![Coverage Status](https://coveralls.io/repos/aq1018/logicbox/badge.png)](https://coveralls.io/r/aq1018/logicbox)

Logicbox is a utility to organize your application logic into managable components seprate from your transport layer. The concept of this module is inspired by [Architecture the Lost Years keynote](http://www.confreaks.com/videos/759-rubymidwest2011-keynote-architecture-the-lost-years) by [Robert Martin](http://en.wikipedia.org/wiki/Robert_Cecil_Martin) and the implementation is inspired by [substation](https://github.com/snusnu/substation).


Installation
------------

```
npm install logicbox --save
```

Quick Example
-------------

```javascript
var env = {
    logger: require('./logger'),
    utils:  require('./utils'),
    models: require('./models')
};

var createUser = function(env, input, cb) {
  env.models.User.create(input, function(err, user) {
    if(err) { return cb(err); }

    env.logger.log("user created!");
    cb(null, user);
  }
};

var errLogger = function(env, output, err) {
    if(err) { env.logger.log(err); }
}

var config = {
  options: {
    basePath: require('path').join(process.pwd(), 'usecases')
  },
  actions: {
    createUser: {
      handler: createUser,
      observer: errLogger
  }
};

// give logicbox an application environment and config, and you are good to go.
var dispatch = require('logicbox')(env, config);

server.post('/users', function(req, res) {
  var user = request.params.user;

  // dispatch 'createUser' action with user as the input
  dispatch('createUser', user, function(err, user) {
    if(err) { return response.error(err); }
    response.end(user);
  });
});

```

Actions
-------

An `action` encapsulates a peiece of business logic, or use case. It must contain at least one `handler`, and can optionally contain one or more `pre` / `post` processors and `observer`s. It is configured in `config.actions` object.

The simplest example:

```javascript
// config.js
module.exports = {
  actions: {
    createUser: 'usecases/user/create'
  }
}
```

This example creates an action named `createUser` and the handler is specified in `usecases/user/create`. The value of `actions` options can contain:

* String - Logicbox `requires` supplied string by appending `options.basePath`.
* Function - It is used directly. Signature: `function(env, input, cb){...}`.
* Object - See below.

Specifying an action with `action object`:

```javascript
// config.js
module.exports = {
  actions: {
    createPost: {
      handler: 'usecases/post/create',
      pre:  [
        'preprocessors/authenticate',
        'preprocessors/authorize'
      ],
      post: [
        'postprocessors/convert-to-api-objects',
        'postprocessors/add-hypermedia-links',
        'postprocessors/convert-to-json'
      ],
      observer: [
        'observers/log-event',
        'observers/send-email'
      ]
  }
}
```

The `action object` must have a `handler`, and can optionally specify `pre`, `post`, `observer` keys. `handler` can accept string or function. `pre`, `post`, `observer` can accept string, function or array.

Execution Order
---------------

The order is: `pre -> handler -> post`. Each processor / handler's output becomes the input of the next. If an error is returned in any part of the chain, the execution is halted, and the callback function will be run with the error. If the entire chain is completed, the callback is invoked with the output of the last handler / processor in the chain.

`observer`s will be invoked in parallel after the completion of the `pre -> handler -> post` chain. observers have the signature of `function(env, output, err);` and they do not have callbacks or return anything.


Signatures
----------

Pre / Post processors and handlers all have the following signature:

`function(env, input, callback)`

The `callback` is a standard node.js style callback, and has the following signature:

`function(error, output)`

Observers have the following signature:

`function(env, output, error)`

Example Handler
---------------

```javascript
module.exports = function(env, input, callback) {
  // hopefully the input is santized by a pre-processor
  // and is data-massaged into something usable when it reaches here.
  env.models.User.create(input, function(error, user) {
    // something went wrong, let Logicbox know.
    if(err) { return callback(error); }

    // everyting is peachy, continue down the chain.
    // maybe a post process will use `user` as their input,
    // or this could be the end of the chain, in that case
    // the dispatcher's callback will get the result.
    callback(null, user);
  });
}
```
