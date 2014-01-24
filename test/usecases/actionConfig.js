'use strict';

module.exports = {
    handler: function(env, input, cb) {
        var output = [input, "hello"];
        cb(null, output);
    },

    pre: function(env, input, cb) {
        var output = [input, "pre"];
        cb(null, output);
    }
};
