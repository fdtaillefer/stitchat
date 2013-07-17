var assert = require("assert");
var sinon = require("sinon");

require = require('requirejs');
require.config({
    "baseUrl": 'js',
    paths: {
        //The socket.io server seems coded to give the socket.io client, but the server won't be running for this test.
        //Meanwhile, requireJS doesn't seem to let us dig into node_modules.
        //That leaves us with the fake dependency option.
        "socketio":"../test/chatConnectionDependencies/socket.io"
    },

    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});

var io = require('socketio');
var chatConnection = require('app/chatConnection');
var constants = require('app/constants');

var connectStub;
var disconnectStub;
var onStub;
var emitStub;

describe('chatConnection', function(){

    beforeEach(function(){
        disconnectStub = sinon.stub();
        onStub = sinon.stub();
        emitStub = sinon.stub();

        connectStub = sinon.stub(io, "connect");
        connectStub.withArgs(constants.HOST + ':' + constants.CHAT_PORT).returns({
            "disconnect":disconnectStub,
            "on":onStub,
            "emit":emitStub
        });

    })

    afterEach(function(){
        chatConnection.disconnect();
        connectStub.restore();
    })

    describe('.disconnect', function(){
        it('Should do nothing if there is no connection', function(){
            chatConnection.disconnect();
            assert.equal(disconnectStub.callCount, 0);
        })

        it('Should disconnect if there is a connection', function(){
            chatConnection.connect();
            chatConnection.disconnect();
            assert.equal(disconnectStub.callCount, 1);
        })
    })

    describe('.connect', function(){
        it('Should do nothing if there is a connection', function(){
            chatConnection.connect();
            var count = connectStub.callCount;
            chatConnection.connect();
            assert.equal(connectStub.callCount, count);
        })

        it('Should connect if there is no connection', function(){
            chatConnection.connect();
            assert.equal(connectStub.callCount, 1);
        })
    })

    describe('.ensureConnected', function(){

        it('Should do nothing if there is a connection', function(){
            chatConnection.connect();
            chatConnection.ensureConnected();
            //We don't even need an assert, since the wrong behavior for ensureConnected here is to throw an error.
        })

        it('Should throw an error if there is no connection', function(){
            assert.throws(function(){
                chatConnection.ensureConnected();
            });
        })
    })

    describe('.onUserMessage', function(){

        it('Should register the callback on the proper event', function(){
            var callback = function(data){};

            chatConnection.connect();
            chatConnection.onUserMessage(callback);

            assert.equal(onStub.callCount, 1);
            assert(onStub.calledWith(constants.CHAT_MESSAGE, callback));
        })

        it('Should throw an error if there is no connection', function(){
            assert.throws(function(){
                chatConnection.onUserMessage(function(data){});
            });
        })
    })

    describe('.onSystemGreeting', function(){

        it('Should register the callback on the proper event', function(){
            var callback = function(data){};

            chatConnection.connect();
            chatConnection.onSystemGreeting(callback);

            assert.equal(onStub.callCount, 1);
            assert(onStub.calledWith(constants.SYSTEM_GREETING, callback));
        })

        it('Should throw an error if there is no connection', function(){
            assert.throws(function(){
                chatConnection.onSystemGreeting(function(data){});
            });
        })
    })

    describe('.onUsernameConfirmation', function(){

        it('Should register the callback on the proper event', function(){
            var callback = function(data){};

            chatConnection.connect();
            chatConnection.onUsernameConfirmation(callback);

            assert.equal(onStub.callCount, 1);
            assert(onStub.calledWith(constants.SYSTEM_USERNAME_CONFIRMATION, callback));
        })

        it('Should throw an error if there is no connection', function(){
            assert.throws(function(){
                chatConnection.onUsernameConfirmation(function(data){});
            });
        })
    })

    describe('.outputChatMessage', function(){

        it('Should send an event containing the message', function(){
            chatConnection.connect();
            chatConnection.outputChatMessage("Chat message");
            assert.equal(emitStub.callCount, 1);
            assert(emitStub.calledWith(constants.CHAT_MESSAGE, {"message":"Chat message"}));
        })

        it('Should throw an error if there is no connection', function(){
            assert.throws(function(){
                chatConnection.outputChatMessage("Chat message");
            });
        })
    })
})
