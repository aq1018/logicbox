'use strict';

module.exports = function(env, input, cb) {
    var output = [input, "hello"];
    cb(null, output);
};
