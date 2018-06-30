var express = require('express'),
    app = express(),
    http = require('http'),
    socketIo = require('socket.io');

var server = http.createServer(app);
var io = socketIo.listen(server);
server.listen(8080);

// look for static files here
app.use(express.static(__dirname + "/public"));
console.log("Serving on port 8080");

// end point for the room the user wants to join
app.get('/room/:chatroom', createRoom);

function createRoom (req, res) {
    // test to see if we got the room number
    console.log("Chatroom is " + req.params.chatroom)
}
// keep track of all lines drawn
var lineHistory = [];

io.on('connection', function (socket) {
    // send the history to the new client
    for (var i in lineHistory){
        socket.emit('drawLine', {line: lineHistory[i]});
    }
    // handler  for message type drawLine
    socket.on('drawLine', function(data) {
        // add received line to history
        lineHistory.push(data.line);
        // send line to all clients
        io.emit('drawLine', {line: data.line})
    });
});