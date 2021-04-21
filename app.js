// this is the main entry point fot the server 


// the main use of express is to send files (like index.html) form server to client not the data.

var express = require('express');
// const { match } = require('node:assert');
var app = express();
// here we are creating an express server 
var serv = require('http').Server(app);

// here in below line we are telling if reqest is for / (localhost:2000/) then it will send index.html
app.get('/', function (req, res){
    res.sendFile(__dirname + '/client/index.html');
});

// if request is for /client then it will the folder to client
app.use('/client', express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server Started");


// this is the list where the sockets of all the players connected to this 
// server are stored

var SOCKET_LIST = {};
var PLAYER_LIST = {};

var Player = function(id) {
    var self = {
        x:250,
        y:250,
        id:id,
        number:"" + Math.floor(10 * Math.random()),

        pressingRight:false,
        pressingLeft:false,
        pressingUp: false,
        pressingDown:false,
        maxSpd:10
    }

    self.updatePosition = function() {
        if(self.pressingRight){
            self.x += self.maxSpd;
        }
        if(self.pressingLeft){
            self.x -= self.maxSpd;
        }
        if(self.pressingUp){
            self.y -= self.maxSpd;
        }
        if(self.pressingDown){
            self.y += self.maxSpd;
        }
    }

    return self;
}


var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    
    // here we are assignind id and other parameters related to socket(client)
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;    
    
    var player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;

    console.log('socket connection')

    socket.on('disconnect', function() {
        delete SOCKET_LIST[socket.id]
        delete PLAYER_LIST[socket.id]
    })
    
    socket.on('keyPress', function(data) {
        if(data.inputId === 'left'){
            player.pressingLeft = data.state;
        }
        else if(data.inputId === 'right'){
            player.pressingRight = data.state;
        }
        else if(data.inputId === 'up'){
            player.pressingUp = data.state;
        }
        else if(data.inputId === 'down'){
            player.pressingDown = data.state;
        }
    })

  
})



// this function will be called every 40 ms that is 1000/25
setInterval(function() {

    var pack = [];
    for(var i in PLAYER_LIST){
        var player = PLAYER_LIST[i];

        player.updatePosition();

        pack.push({
            x:player.x,
            y:player.y,
            number:player.number   
        })
    }

    for(var i in SOCKET_LIST) {
        socket = SOCKET_LIST[i];
        socket.emit('newPositions', pack)
    }

},1000/25)