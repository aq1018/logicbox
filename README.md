logicbox.js
===========

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

var dispatch = require('logicbox')(env, config);

// in a hypothetical http server request
server.post('/users', function(req, res) {
  var user = request.params.user;

  dispatch('createUser', user, function(err, user) {
    if(err) { return response.error(err); }
    response.end(user);
  });
});

```

