'use strict';

var _       = require('underscore');
var async   = require('async');

var DEFAULT_OPTIONS = {
    basePath: process.cwd()
};

module.exports = function(actions, env, options) {
    options = _.extend({}, DEFAULT_OPTIONS, options);
    actions = _.reduce(actions, function(memo, name) {
        memo[name] = compose(actions[name]);
    }, {});

    function _require(file) {
        file = require('path').resolve(options.basePath, file);
        return require(file);
    }

    function coerce(thing) {
        if('function' === typeof thing) { return thing; }
        if('string' === typeof thing) { return _require(thing); }

        throw new TypeError('only functions or strings are allowed.');
    }

    function normalize(action) {
        if(typeof action === 'string') {
            action = { handler: action };
        }

        _.each(['handler', 'observer', 'pre', 'post'], function(key) {
            action[key] = _.map(action[key], coerce);
        });

        action.handler = coerce(action.handler);

        return action;
    }

    function compose(action) {
        var chain, observer;

        action      = normalize(action);
        chain       = [action.pre, action.handler, action.post];
        observer    = [action.observer];

        chain       = async.compose(_.flatten(chain));
        observer    = async.compose(_.flatten(observer));

        return function(env, input, cb) {
            chain(env, input, function(err, output) {
                observer(env, input, output, err);
                cb(err, output);
            });
        };
    }

    function dispatch(name, input, cb) {
        var handler = actions[name];

        if(!handler) {
            throw new Error('dispatcher cannot find action named "' + name + '"');
        }

        handler(name, input, cb);
    }

    return dispatch;
};
