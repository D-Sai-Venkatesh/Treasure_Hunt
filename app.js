// this is the main entry point fot the server 


// the main use of express is to send files (like index.html) form server to client not the data.
require('./Entity');
require('./client/Inventory');

// #############################################################################
//                               MONGO DB HANDLER
// #############################################################################
const mongoose = require('mongoose');
const uri = 'mongodb+srv://client:treasureHunt@treasurhunt.mnpky.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

mongoose.connect(
    uri,
    { useFindAndModify: false, useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true},
    (err) => {
        if (err) return console.log("Error: ", err);
        console.log("MongoDB Connection -- Ready state is:", mongoose.connection.readyState);
    }
);

const accountSchema = new mongoose.Schema({
    username: {type:String, required:true},
    password: String
     });

const account = mongoose.model('account', accountSchema);

// #############################################################################
//                               LOG4js INIT
// #############################################################################


const log4js = require('log4js');

log4js.configure("./log4js_config.json");

// Create the logger
logger = log4js.getLogger();
logger.level = 'info';

// Grok pattern used
// %{TIMESTAMP_ISO8601:timestamp_string} \[%{GREEDYDATA:logger}\] \[%{GREEDYDATA:username}\] \[%{GREEDYDATA:action}\]


// #############################################################################
//                               WEB PAGE HANDLER
// #############################################################################

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
// logger.info('[SERVER_STARTED]');

// this is the list where the sockets of all the players connected to this 
// server are stored

SOCKET_LIST = {};

var DEBUG = false;



// #############################################################################
//                               LOGIN HANDLERS
// #############################################################################

var USERS = {
    "bob":"asd",
    "bob2":"bob",
    "bob3":"ttt",
} 

isValidPassword = async function(data, cb) {

    const res = await account.find({username:data.username, password:data.password},function(err, res) {
        if(res.length > 0) cb(true);
        else cb(false);
    }).lean()

}

isUsernameTaken = async function(data, cb) {

    const res = await account.find({username:data.username}, function(err, res) {
        if(res.length > 0) cb(true);
        else cb(false);
    }).lean()
    
}

addUser = async function(data, cb) {
    // Account.insert({username:data.username, password:data.password}, function(err) {
    //    cb(); 
    // })

    const res = await account.insertMany({username:data.username, password:data.password}, cb())

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
                logger.info("[" + data.username + "] [LOGIN - SUCCESSFUL]");
            }
            else
            {
                socket.emit('signInResponse', {success:false});
                logger.info("[" + data.username + "] [LOGIN - UNSUCCESSFUL]");
            }
        })
        
    })

    socket.on('signUp', function(data) {
        
        isUsernameTaken(data, function(res){
            if(res) {
                socket.emit('signUpResponse', {success:false});
                logger.info("[" + data.username + "] [SIGNUP - UNSUCCESSFUL]");

            }
            else
            {
                addUser(data, function() {
                    socket.emit('signUpResponse', {success:true});
                    logger.info("[" + data.username + "] [SIGNUP - SUCCESSFUL]");
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
        logger.info("[" + Player.list[socket.id].username + "] [DISCONNECTED - SUCCESSFUL]");
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


module.exports = function() {
    return 'App Class';
}