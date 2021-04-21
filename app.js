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

// #############################################################################
//                               ENTITY INTERFACE
// #############################################################################

var Entity = function() {
    var self = {
        x:250,
        y:250,
        spdX:0,
        spdY:0,
        id:"",
    }

    self.update = function(){
        self.updatePosition();
    }

    self.updatePosition = function(){
        self.x += self.spdX;
        self.y += self.spdY;
    }

    return self;
}


// #############################################################################
//                               PLAYER CLASS
// #############################################################################

var Player = function(id) {
    var self = Entity();
    self.id = id;
    self.number = "" + Math.floor(10 * Math.random());
    self.pressingRight = false;
    self.pressingLeft = false;
    self.pressingUp = false;
    self.pressingDown = false;
    self.maxSpd = 10;


    var super_update = self.update;
    self.update = function() {
        self.updateSpd();
        super_update();
    }

    self.updateSpd = function() {
        if(self.pressingRight) {
            self.spdX = self.maxSpd;
        }
        else if (self.pressingLeft) {
            self.spdX = -self.maxSpd;
        }
        else {
            self.spdX = 0;
        }


        if(self.pressingDown) {
            self.spdY = self.maxSpd;
        }
        else if (self.pressingUp) {
            self.spdY = -self.maxSpd;
        }
        else {
            self.spdY = 0;
        }

    }

    Player.list[id] = self;

    return self;
}

Player.list = {};

Player.onConnect = function(socket){
    var player = Player(socket.id);

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
    
}

Player.onDisconnect = function(socket) {
    delete Player.list[socket.id];
}

Player.update = function() {
    var pack = [];

    for(var i in Player.list){
        var player = Player.list[i];

        player.update();

        pack.push({
            x:player.x,
            y:player.y,
            number:player.number   
        })
    }

    return pack;
}


// #############################################################################
//                               BULLET CLASS
// #############################################################################

var Bullet = function(angle) {
    var self = Entity();
    self.id = Math.random();
    self.spdX = Math.cos(angle/180*Math.PI) * 10;
    self.spdY = Math.sin(angle/180*Math.PI) * 10;


    self.timer =  0;
    self.Remove = false;
    
    var super_update = self.update;
    self.update = function() {
        if(self.timer++ > 100) {
            self.toRemove = true;
        }
        super_update();
    }

    Bullet.list[self.id] = self;
    return self;
}

Bullet.list = {};

Bullet.update = function() {

    if(Math.random() < 0.1) {
        Bullet(Math.random() * 360);
    }

    var pack = [];
    for(var i in Bullet.list) {
        var bullet = Bullet.list[i];
        bullet.update();
        pack.push({
            x:bullet.x,
            y:bullet.y
        });
    }
    return pack;
}

// #############################################################################
//                               socket Handler
// #############################################################################


var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    
    // here we are assignind id and other parameters related to socket(client)
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;    
    
    Player.onConnect(socket);


    socket.on('disconnect', function() {
        delete SOCKET_LIST[socket.id]
        Player.onDisconnect(socket)
    })
    
    

  
})

// #############################################################################
//                               UPDATE LOOP
// #############################################################################


// this function will be called every 40 ms that is 1000/25
setInterval(function() {

    var pack = {
        player: Player.update(),
        bullet: Bullet.update(),
    }

    

    for(var i in SOCKET_LIST) {
        socket = SOCKET_LIST[i];
        socket.emit('newPositions', pack)
    }

},1000/25)