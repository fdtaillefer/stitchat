/**
 * Chat server module.
 */
var express = require('express');
var app = express();
var socketio = require('socket.io');
var requirejs, constants;
var chatServer, userManager;
var userManagerFactory = require("./userManager");

function start(options){

    //Configure default options
    if(!options){
        options = {};
    }

    if(!options["logLevel"]){
        options["logLevel"] = 3;
    }

    if(!options["requirejs"]){

        if(!requirejs){
            requirejs = require('requirejs');
            requirejs.config({
                baseUrl:'js',
                //Pass the top-level main.js/index.js require
                //function to requirejs so that node modules
                //are loaded relative to the top-level JS file.
                nodeRequire: require
            });
        }

        options["requirejs"] = requirejs;
    }

    constants = options["requirejs"]('app/constants');
    userManager = userManagerFactory.create(constants.DEFAULT_CHAT_USERNAME);


    chatServer = app.listen(constants.CHAT_PORT);

    //Server should serve client-side js files
    app.use(express.static(__dirname + '/js'));

    //Setup default behavior
    app.get("/", function(req, res){
        res.sendfile("pages/chatPage.html");
    });


    var io = socketio.listen(chatServer);
    io.set('log level', options["logLevel"]);

    //When a client connects, we want to...
    io.sockets.on('connection', function(socket){
        if(options["logLevel"] >= 2){
            console.log('A user connected to the chat');
        }

        //Add this user to the user manager
        userManager.createUser(socket, function(newName){

            //Confirm the username to the user
            socket.emit(constants.SYSTEM_USERNAME_CONFIRMATION, { 'username':newName });

            //Greet the user
            socket.emit(constants.SYSTEM_GREETING, { 'username':newName });

            //TODO Tell all other users about the new user.

            //Listen to user for chat messages. Transfer their messages to all sockets
            socket.on(constants.CHAT_MESSAGE, function (data) {
                if(options["logLevel"] >= 2){
                    console.log('Received ' + constants.CHAT_MESSAGE + ' from a user: ' + data.message);
                }
                socket.get('username', function(err, username){
                    data.username = username;
                    io.sockets.emit(constants.CHAT_MESSAGE, data);
                });
            });

            //When user disconnects, we want to...
            socket.on('disconnect', function(){
                if(options["logLevel"] >= 2){
                    console.log('A user disconnected from the chat');
                }
                userManager.removeUser(socket, function(removedUsername){
                    //TODO Tell all other users about the user leaving.
                });
            });
        });

    })
    console.log('Chat server has started.');
}

function stop(){
    chatServer.close()
    console.log('Chat server has stopped.');
}

exports.start = start;
exports.stop = stop;
