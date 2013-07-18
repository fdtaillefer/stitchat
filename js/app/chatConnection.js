/**
 * This file handles the connection with the chat server.
 */
define(["socketio", "app/constants"], function(io, constants) {

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
     * Disconnects from the chat server, if connected.
     */
    var disconnect = function(){
        if(socket){
            socket.disconnect();
            socket = null;
        }
    }

    /**
     * Registers a handler for an incoming event for a chat message.
     * This must not be called before connect().
     * The handler callback should receive one parameter which is a data object.
     */
    var onChatMessage = function(handler){
        ensureConnected();
        socket.on(constants.CHAT_MESSAGE, handler);
    }

    /**
     * Registers a handler for an incoming system greeting event.
     * This must not be called before connect().
     * The handler callback should receive one parameter which is a data object.
     */
    var onSystemGreeting = function(handler){
        ensureConnected();
        socket.on(constants.SYSTEM_GREETING, handler);
    }

    /**
     * Registers a handler for an incoming event that the system has successfully change current
     * user's username.
     * This must not be called before connect();
     * The handler callback should receive one parameter which is a data object.
     */
    var onUsernameConfirmation = function(handler){
        ensureConnected();
        socket.on(constants.SYSTEM_USERNAME_CONFIRMATION, handler);
    }

    /**
     * Registers a handler for an incoming event that a username already exists from the system.
     * This must not be called before connect();
     * The handler callback should receive one parameter which is a data object.
     */
    var onUsernameExists = function(handler){
        ensureConnected();
        socket.on(constants.SYSTEM_USERNAME_EXISTS, handler);
    }

    /**
     * Registers a handler for an incoming event that a user has joined the chat.
     * This must not be called before connect();
     * The handler callback should receive one parameter which is a data object.
     */
    var onUserJoin = function(handler){
        ensureConnected();
        socket.on(constants.SYSTEM_USER_JOIN, handler);
    }

    /**
     * Registers a handler for an incoming event that a user has left the chat.
     * This must not be called before connect();
     * The handler callback should receive one parameter which is a data object.
     */
    var onUserLeave = function(handler){
        ensureConnected();
        socket.on(constants.SYSTEM_USER_LEAVE, handler);
    }

    /**
     * Registers a handler for an incoming event that a user has changed its name.
     * This must not be called before connect();
     * The handler callback should receive one parameter which is a data object.
     */
    var onUserRename = function(handler){
        ensureConnected();
        socket.on(constants.SYSTEM_USER_RENAME, handler);
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

    var outputNameChange = function(newName){

        ensureConnected();

        //Build message data
        var data = {};
        data['username'] = newName;

        //Send message
        socket.emit(constants.NAME_CHANGE, data);
    }

     return {
        "connect": connect,
        "disconnect": disconnect,
        "ensureConnected":ensureConnected,
        "onChatMessage": onChatMessage,
        "onSystemGreeting": onSystemGreeting,
        "onUsernameConfirmation": onUsernameConfirmation,
        "onUsernameExists": onUsernameExists,
        "onUserJoin": onUserJoin,
        "onUserLeave": onUserLeave,
        "onUserRename": onUserRename,
        "outputChatMessage": outputChatMessage,
        "outputNameChange": outputNameChange
    }
});
