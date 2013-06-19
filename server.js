/**
 * Chat server module.
 */
var express = require('express');
var app = express();
var socketio = require('socket.io');


requirejs = require('requirejs');
requirejs.config({
    baseUrl:'js',
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});
var constants = requirejs('app/constants');

function start(){
    var server = app.listen(constants.CHAT_PORT);

    //Server should serve client-side js files
    app.use(express.static(__dirname + '/js'));

    //Setup default behavior
    app.get("/", function(req, res){
        res.sendfile("pages/chatPage.html");
    });


    var io = socketio.listen(server);

    //When a client connects, we want to...
    io.sockets.on('connection', function(socket){
        console.log('A user connected to the chat');

        //Greet the user
        socket.emit(constants.SYSTEM_MESSAGE, { 'message':'Welcome to stitchat!', 'type':constants.SYSTEM_WELCOME });

        //Listen to user for chat messages. Transfer their messages to all sockets
        socket.on(constants.CHAT_MESSAGE, function (data) {
            console.log('Received ' + constants.CHAT_MESSAGE + ' from a user: ' + data.message);
            io.sockets.emit(constants.CHAT_MESSAGE, data);
        });
    })

    console.log('Server has started.');
}

exports.start = start;
