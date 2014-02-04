(function (root, factory) {
    'use strict';

    if (typeof exports === 'object') {
        // CommonJS
        var _           = require('underscore');
        var async       = require('async');
        module.exports  = factory(_, async);
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['underscore', 'async'], factory);
    } else {
        // Global Variables
        root.logicbox = factory(root._, root.async);
    }
}(this, function (_, async) {
    'use strict';

    var DEFAULT_OPTIONS = {
        basePath: process.cwd()
    };

    return function(env, config) {
        var actions = config.actions;
        var global  = config.global || {};
        var options = _.extend({}, DEFAULT_OPTIONS, config.options);

        function _require(file) {
            file = require('path').resolve(options.basePath, file);
            return require(file);
        }

        function normalizeFn(thing) {
            if('function' === typeof thing) { return thing; }
            if('string' === typeof thing) { return _require(thing); }
            if(_.isArray(thing)) { return _.map(thing, normalizeFn); }

            throw new TypeError('only functions or strings are allowed.');
        }

        function normalizeArray() {
            return _.chain(arguments).flatten().compact().value();
        }

        function normalizeProcessors(action) {
            return _.reduce(['handler', 'observer', 'pre', 'post'], function(memo, key) {
                memo[key] = normalizeFn(normalizeArray(action[key]));
                return memo;
            }, {});
        }

        function normalize(action) {
            if(_.isString(action)) {
                action = _require(action);
            }

            if(_.isFunction(action) || _.isArray(action)) {
                action = { handler: action };
            }

            return normalizeProcessors(action);
        }

        function compose(action) {
            var chain, observers;

            action = normalize(action);

            chain  = normalizeArray(
                global.pre,
                action.pre,
                action.handler,
                action.post,
                global.post
            );

            observers = normalizeArray(
                action.observer,
                global.observer
            );

            var iterator = function(input, fn, cb) { fn(env, input, cb); };

            return function(input, cb) {
                async.reduce(chain, input, iterator, function(err, output) {
                    observers.forEach(function(observer) {
                        observer(env, output, err);
                    });
                    cb(err, output);
                });

            };
        }

        global = normalizeProcessors(global);

        actions = _.reduce(config.actions, function(memo, action, name) {
            memo[name] = compose(action);
            return memo;
        }, {});

        return function dispatch(name, input, cb) {
            var handler = actions[name];

            if(!handler) {
                throw new Error('dispatcher cannot find action named "' + name + '"');
            }

            handler(input, cb);
        };
    };

}));
