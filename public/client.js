var socket = io.connect();
var room = "room1";
document.addEventListener("DOMContentLoaded", function() {
    var mouse = {
        click: false,
        move: false,
        pos: {x:0, y:0},
        pos_prev: false
    };
    // get canvas and create context
    var canvas = document.getElementById('drawing');
    var context = canvas.getContext('2d');
    var width = window.innerWidth;
    var height = window.innerHeight;

//    var socket = io.connect();


    canvas.width = width;
    canvas.height = height;

    //register mouse events
    canvas.onmousedown = function(e){mouse.click = true;};
    canvas.onmouseup = function(e){mouse.click = false;};

    canvas.onmousemove = function(e) {
        mouse.pos.x = e.clientX / width;
        mouse.pos.y = e.clientY / height;
        mouse.move = true;

    };

    // receive changes made to text area from server
    socket.on('editText', function(data){
        console.log("We received data from the server to textarea")
        var texta = document.getElementById("textarea");
        texta.value = data.text;
    });


    socket.on("connectR", function(data) {
       var box = document.getElementById("textbox");
       var tell = document.getElementById("tellRoom");
       tell.innerHTML = data;
       box.value = data;
    });
       // draw line received from server
	socket.on('drawLine', function (data) {
      var line = data.line;
      context.beginPath();
      context.moveTo(line[0].x * width, line[0].y * height);
      context.lineTo(line[1].x * width, line[1].y * height);
      context.stroke();
   });
   
   // main loop, running every 25ms
   function mainLoop() {
      // check if the user is drawing
      if (mouse.click && mouse.move && mouse.pos_prev) {
         // send line to to the server
         socket.emit('drawLine', { line: [ mouse.pos, mouse.pos_prev ] });
         mouse.move = false;
      }
      mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
      setTimeout(mainLoop, 25);
   }
   mainLoop();
});

function changeRoom(){
//    var socket = io.connect(); 
    room = document.getElementById('room1').value;
    console.log("Chanigng", room);
    socket.emit('changeRoom',{room: room });
}

function changeRoom2(){
//    var socket = io.connect();
    room = document.getElementById('room2').value
    socket.emit('changeRoom',{room: room});
}

function changeRoom3(){
//    var socket = io.connect();
    room = document.getElementById('room3').value;
    socket.emit('changeRoom',{room: room});
}



// handle changes in text area
angular.module('myApp', [])
    .controller('myCtrl', ['$scope', function($scope) {
        //define what the change function will do
        $scope.updateText = function() {
            console.log("we made it to the angular stuff"); 
            //send the changes to the server
            socket.emit('editText', {text: $scope.textModel})
        }
    }]);
