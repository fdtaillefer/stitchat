var http = require('http');
var express = require('express');
var app = express();
var dust = require('dustjs-linkedin');
var consolidate = require('consolidate');
var socketio = require('socket.io');
var port = require('./js/constants').port;

function start(){
    var io = require('socket.io').listen(app.listen(port));
    app.set('views', __dirname + '/tpl');
    app.set('view engine', "dust");
    app.engine('dust', consolidate.dust);
    app.use(express.static(__dirname + '/js'));
    app.get("/", function(req, res){
        res.render("chatPage", {"title":"Stitchat"});
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
