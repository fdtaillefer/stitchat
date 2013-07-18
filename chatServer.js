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

    //Server should serve client-side js files from the js folder
    app.use(express.static(__dirname + '/js'));

    //Server should serve client-side css files from the css folder
    app.use(express.static(__dirname + '/css'));

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

            //Greet the user
            socket.emit(constants.SYSTEM_GREETING, { 'username':newName });

            //Tell all other users about the new user.
            socket.broadcast.emit(constants.SYSTEM_USER_JOIN, { 'username':newName });

            //Confirm the username to the user
            socket.emit(constants.SYSTEM_USERNAME_CONFIRMATION, { 'username':newName });


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

            //Listen to user for name changes.
            socket.on(constants.NAME_CHANGE, function(data){
                if(options["logLevel"] >= 2){
                    console.log('Received ' + constants.NAME_CHANGE + ' from a user: ' + data.username);
                }

                socket.get('username', function(err, oldName){

                    //If old and new name are the same, ignore the request. No need for feedback.
                    if(oldName === data.username){
                        return;
                    }

                    userManager.renameUser(socket, data.username, function(oldUsername){
                        //Confirm the username to the user
                        socket.emit(constants.SYSTEM_USERNAME_CONFIRMATION, { 'username':data.username });

                        //TODO tell all other users about the name change
                    }, function(){

                        //Tell user the new name exists
                        socket.emit(constants.SYSTEM_USERNAME_EXISTS, { 'username':data.username });
                    }, function(){});
                });

            })

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
