var http = require('http');
var express = require('express');
var app = express();
var socketio = require('socket.io');

var requirejs = require('requirejs');
requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require
});
var constants = requirejs('./js/app/constants');

function start(){
    var io = require('socket.io').listen(app.listen(constants.CHAT_PORT));

    //Configure our app to render dust templates
    app.use(express.static(__dirname + '/js'));

    app.get("/", function(req, res){
        res.sendfile("pages/chatPage.html");
    });

    //When a client connects, we want to...
    io.sockets.on('connection', function(socket){
        console.log('A user connected to the chat');

        //Greet the user
        socket.emit('message', { 'message': 'Welcome to stitchat' });

        //Listen to user for chat messages. Transfer their messages to all sockets
        socket.on('sendChat', function (data) {
            console.log('A user sent a message: ' + data.message);
            io.sockets.emit('message', data);
        });
    })

    console.log('Server has started.');
}

exports.start = start;
