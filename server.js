var http = require('http');
var dust = require('dustjs-linkedin');
var url = require("url");
var path = require("path");
var fs = require('fs');
var socketio = require('socket.io');
var $ = require('jquery');
var port = require('./js/constants').port;

var contentTypesByExtension = {
    '.css':  "text/css",
    '.js':   "text/javascript"
};

/**
 * Feeds the provided file to the provided http response, as the provided content type.
 * The file's existence must already have been verified.
 * @param response An http response
 * @param filename An absolute path to the file
 * @param contentType and http content type in String form, such as "text/javascript"
 */
function returnFile(response, filename, contentType){
    fs.readFile(filename, "binary", function(err, file) {
        if(err) {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(err + "\n");
            response.end();
            return;
        }

        var headers = {};
        headers["Content-Type"] = contentType;
        response.writeHead(200, headers);
        response.write(file, "binary");
        response.end();
    });
}

/**
 * Feeds the Stitchat main page to the provided http response.
 * @param response An http response
 */
function returnChat(response){
    fs.readFile('./tpl/chatPage.dust', function(err, data){
        console.log('Template read');
//      console.log(String(data));

        var compiled = dust.compile(String(data), 'chatPage');
        console.log('Template compiled.');
//      console.log(compiled);
        dust.loadSource(compiled);
        dust.render('chatPage', {'title':'Stitchat'}, function(err, out){

            console.log('Template rendered');
//          console.log(out);

            response.writeHead(200, {'Content-Type': 'text/html'});
            response.write(out);
            response.end();
        })
    });
}

/**
 * Handles requests to the Stitchat server.
 * @param request An http request
 * @param response An http response
 */
function onRequest(request, response) {
    console.log('Request received.');

    var uri = url.parse(request.url).pathname
    var filename = path.join(process.cwd(), uri);

//    console.log('uri is ' + uri);
    console.log('Request for filename ' + filename);

    path.exists(filename, function(exists) {
        if(!exists) {
            response.writeHead(404, {"Content-Type": "text/plain"});
            response.write("404 Not Found\n");
            response.end();
            return;
        }

        var contentType = contentTypesByExtension[path.extname(filename)];
        if(contentType){
            returnFile(response, filename, contentType);
        } else {
            returnChat(response);
        }

    });
};

function start(){
    var server = http.createServer(onRequest).listen(port);
    var io = socketio.listen(server);

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
