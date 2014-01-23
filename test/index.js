/* jshint expr:true */

'use strict';

var logicbox    = require('../');
var expect      = require('chai').expect;

var logs = [];

var env = {
    logger: {
        log: function(message) {
            logs.push(message.toString());
        }
    }
};

var hello = function(env, input, cb) {
    var output = "hello " + input;
    cb(null, output);
};

var world = function(env, input, cb) {
    var output = input + " world";
    cb(null, output);
};

var fail = function(env, input, cb) {
    cb(new Error('oops'));
};

var observer = function(env, output, err) {
    if(err) {
        env.logger.log(err);
    } else {
        env.logger.log(output);
    }
};

var config = {
    testHandler: hello,

    testObserver: {
        handler: hello,
        observer: observer
    },
    hello3: {
        handler: hello,
        pre: [ hello ],
        post: [ world ],
        observer: observer
    },
    hello4: {
        handler: fail,
        pre: [ hello ],
        post: [ world ],
        observer: observer
    }
};

var dispatch = logicbox(env, config);


describe("logicbox", function() {
    beforeEach(function() {
        logs = [];
    });

    describe("handler", function() {
        it("calls the handler", function() {
            dispatch('testHandler', 'world', function(err, output) {
                expect(output).to.eql('hello world');
            });
        });
    });

    describe("observer", function(){
        it("calls the observer", function() {
            dispatch('testObserver', 'world', function(err, output) {
                expect(output).to.eql('hello world');
                expect(logs[0]).to.eql('hello world');
            });
        });
    });

    describe("pre and post", function(){
        it("calls pre and post", function() {
            dispatch('hello3', 'world', function(err, output) {
                expect(output).to.eql('hello hello world world');
                expect(logs[0]).to.eql('hello hello world world');
            });
        });
    });

    describe("error handling", function(){
        it("return errors in callback", function() {
            dispatch('hello4', 'world', function(err, output) {
                expect(output).to.be.undefined;
                expect(logs[0]).to.eql('Error: oops');
            });
        });
    });
});
