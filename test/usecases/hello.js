'use strict';

module.exports = function(env, input, cb) {
    var output = "hello " + input;
    cb(null, output);
};
