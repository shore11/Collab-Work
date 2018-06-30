var express = require('express'),
    app = express(),
    http = require('http'),
    socketIo = require('socket.io')({
        transports : ["xhr-polling"],
        polling_duration : 10
    });

var server = http.createServer(app);
var io = socketIo.listen(server);

var port = process.env.PORT || 8080; // Use the port Heroku gives or 8080


server.listen(port, function(){
    console.log("Serving on port %d in %s mode", server.address().port, app.settings.env);
});

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

var users = 0;
io.on('connection', function (socket) {
    users++;
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
    socket.on("disconnect", function(){
        console.log("Somoneleft!");
        users--;        
    });
    if (users == 0){
        io.close();
    }
});