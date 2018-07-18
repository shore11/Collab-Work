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

var lineHistory = [];
var roomNumber = "room1";
var users = 0;
//var roomNumber = 1;
io.on('connection', function (socket) {
    users++;
    socket.join(roomNumber);
    // Increase roomNumber to only have two clients in a room
    //if(io.nsps['/'].adapter.rooms["room-" + roomNumber] && io.nsps['/'].adapter.rooms["room-" + roomNumber].length > 1) roomNumber++;
    socket.on('changeRoom', function(data){
        socket.leave(roomNumber);
        roomNumber = data.room;
        socket.join(data.room);
        io.in(roomNumber).emit("connectR", "you are in room " + roomNumber);
    });
    // accept changes made to the textarea
    socket.on('editText', function(data) {
        socket.in(roomNumber).emit('editText', {text: data.text});
        console.log("We sent the server changes from textarea");
    });

    // send the history to the new client
    for (var i in lineHistory){
        socket.in(roomNumber).emit('drawLine', {line: lineHistory[i]});
    }
    // handler  for message type drawLine
    socket.in(roomNumber).on('drawLine', function(data) {
        // add received line to history
        lineHistory.push(data.line);
        // send line to all clients
        io.in(roomNumber).emit('drawLine', {line: data.line})
    });
    socket.in(roomNumber).on("disconnect", function(){
        socket.leave(roomNumber);
        console.log("Someone left!");
        users--;     
    });     
});
    