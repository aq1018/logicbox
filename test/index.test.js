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
    var output = [ input, "hello" ];
    cb(null, output);
};

var world = function(env, input, cb) {
    var output = [input, "world"];
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
    options: {
        basePath: require('path').join(process.cwd(), 'test'),
    },

    global: {
        pre: function(env, input, cb){ cb(null, [input, 'pre'] ); },
        post: function(env, input, cb){ cb(null, [input, 'post']); },
        observer: function(env){ env.logger.log('global'); }
    },

    actions: {
        testHandler: hello,

        testRequire: 'usecases/hello',

        testActionConfig: 'usecases/actionConfig',

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
        },

        hello5: [ hello, world ],
        hello6: {
            handler: [ hello, world ],
        }
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
                var expected = [[['world', 'pre'],'hello' ],'post' ];
                expect(output).to.eql(expected);
                expect(logs[0]).to.eql('global');
            });
        });

        it("requires the handler", function() {
            dispatch('testRequire', 'world', function(err, output) {
                var expected = [[['world', 'pre'],'hello' ],'post' ];
                expect(output).to.eql(expected);
                expect(logs[0]).to.eql('global');
            });
        });

        it("requires action config object", function() {
            dispatch('testActionConfig', 'world', function(err, output) {
                var expected = [[[['world', 'pre'], 'pre'],'hello' ],'post' ];
                expect(output).to.eql(expected);
                expect(logs[0]).to.eql('global');
            });
        });

        it("runs handlers array", function() {
            dispatch('hello5', 'foo', function(err, output) {
                var expected = [[[['foo', 'pre'], 'hello'],'world' ],'post' ];
                expect(output).to.eql(expected);
                expect(logs[0]).to.eql('global');
            });
        });

        it("runs action config object with handlers array", function() {
            dispatch('hello6', 'foo', function(err, output) {
                var expected = [[[['foo', 'pre'], 'hello'],'world' ],'post' ];
                expect(output).to.eql(expected);
                expect(logs[0]).to.eql('global');
            });
        });
    });

    describe("observer", function(){
        it("calls the observer", function() {
            dispatch('testObserver', 'world', function(err, output) {
                var expected = [[['world', 'pre'],'hello' ],'post' ];
                expect(output).to.eql(expected);
                expect(logs[0]).to.eql(expected.toString());
                expect(logs[1]).to.eql('global');
            });
        });
    });

    describe("pre and post", function(){
        it("calls pre and post", function() {
            dispatch('hello3', 'world', function(err, output) {
                var expected = [ [ [ [ [ 'world', 'pre' ], 'hello' ], 'hello' ], 'world' ], 'post' ];
                expect(output).to.eql(expected);
                expect(logs[0]).to.eql(expected.toString());
                expect(logs[1]).to.eql('global');
            });
        });
    });

    describe("error handling", function(){
        it("return errors in callback", function() {
            dispatch('hello4', 'world', function(err, output) {
                expect(output).to.be.undefined;
                expect(logs[0]).to.eql('Error: oops');
                expect(logs[1]).to.eql('global');
            });
        });
    });
});
