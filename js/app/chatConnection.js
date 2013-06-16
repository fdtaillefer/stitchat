/**
 * This file handles the connection with the chat server.
 */
define(["socket.io", "app/constants"], function(io, constants) {

    var socket;

    /**
     * Throws an exception if the connection hasn't been initialized yet.
     */
    function ensureConnected(){
        if(!socket){
            throw "Connection isn't initialized!";
        }
    }

    /**
     * Connects to the chat server, if not already connected.
     */
    var connect = function(){
        if(!socket){
            var chatConnectionString = constants.HOST + ':' + constants.CHAT_PORT;
            socket = io.connect(chatConnectionString);
        }
    }

    /**
     * Registers a handler for an incoming user message. This must not be called before connect().
     */
    var onUserMessage = function(handler){
        ensureConnected();
        socket.on(constants.CHAT_MESSAGE, handler);
    }

    /**
     * Registers a handler for an incoming system message. This must not be called before connect().
     */
    var onSystemMessage = function(handler){
        ensureConnected();
        socket.on(constants.SYSTEM_MESSAGE, handler);
    }

    /**
     * Sends a chat message to the chat server. This must not be called before connect().
     * @param message The actual text of the message
     */
    var outputChatMessage = function(message){

        ensureConnected();

        //Build message data
        var data = {};
        data['message'] = message;

        //Send message
        socket.emit(constants.CHAT_MESSAGE, data);
    }

     return {
        "connect": connect,
        "onUserMessage": onUserMessage,
        "onSystemMessage": onSystemMessage,
        "outputChatMessage": outputChatMessage
    }
});
