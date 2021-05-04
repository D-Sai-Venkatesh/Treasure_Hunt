// this is the main entry point fot the server 


// the main use of express is to send files (like index.html) form server to client not the data.
require('./Entity');
require('./client/Inventory');


// var mongojs = require('mongojs');
// var db = mongojs('localhost:27017/myGame', ['account','progress']);



var express = require('express');
const { addListener } = require('process');
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

// serv.listen(2000);
serv.listen(process.env.PORT || 2000);


console.log("Server Started");


// this is the list where the sockets of all the players connected to this 
// server are stored

SOCKET_LIST = {};

var DEBUG = true;



// #############################################################################
//                               LOGIN HANDLERS
// #############################################################################

var USERS = {
    "bob":"asd",
    "bob2":"bob",
    "bob3":"ttt",
}

var isValidPassword = function(data, cb) {
    // db.account.find({username:data.username, password:data.password}, function(err, res) {
    //     if(res.length > 0) {
    //         cb(true);
    //     }
    //     else {
    //         cb(false);
    //     }
    // });
    
    cb(true);
}

var isUsernameTaken = function(data, cb) {
    // db.account.find({username:data.username}, function(err, res) {
    //     if(res.length > 0) {
    //         cb(true);
    //     }
    //     else {
    //         cb(false);
    //     }
    // });

    cb(true)
}

var addUser = function(data, cb) {
    // db.account.insert({username:data.username, password:data.password}, function(err) {
    //    cb(); 
    // })

}
// #############################################################################
//                               socket Handler
// #############################################################################

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
    
    // here we are assignind id and other parameters related to socket(client)
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;    


    socket.on('signIn', function(data) {
        isValidPassword(data, function(res) {
            
            if(res) {
                Player.onConnect(socket, data.username);
                socket.emit('signInResponse', {success:true});
            }
            else
            {
                socket.emit('signInResponse', {success:false});
            }
        })
        
    })

    socket.on('signUp', function(data) {
        
        isUsernameTaken(data, function(res){
            if(res) {
                socket.emit('signUpResponse', {success:false});
            }
            else
            {
                addUser(data, function() {
                    socket.emit('signUpResponse', {success:true});
                });
            }
        })
        
    })

    

    

    socket.on('evalServer', function(data) {
        
        if(!DEBUG){
            return ;
        }
        
        var res = eval(data);
        socket.emit('evalAnswer',res);
    }) 

    socket.on('disconnect', function() {
        delete SOCKET_LIST[socket.id]
        Player.onDisconnect(socket)
    })
    
    

  
})

// #############################################################################
//                               UPDATE LOOP
// #############################################################################




// this function will be called every 40 ms that is 1000/25
setInterval(function(){
	var packs = Entity.getFrameUpdateData();
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		socket.emit('init',packs.initPack);
		socket.emit('update',packs.updatePack);
		socket.emit('remove',packs.removePack);
	}
	
},1000/25);