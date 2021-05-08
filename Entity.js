var initPack = {player:[],bullet:[]};
var removePack = {player:[],bullet:[]};


// #############################################################################
//                               ENTITY INTERFACE
// #############################################################################

Entity = function(param) {
    var self = {
        x:250,
        y:250,
        spdX:0,
        spdY:0,
        id:"",
        map:'forest',
    }

    if(param){
		if(param.x)
			self.x = param.x;
		if(param.y)
			self.y = param.y;
		if(param.map)
			self.map = param.map;
		if(param.id)
			self.id = param.id;		
	}

    self.update = function(){
        self.updatePosition();
    }

    self.updatePosition = function(){
        self.x += self.spdX;
        self.y += self.spdY;
    }
    self.getDistance = function(pt) {
        // console.log(self.x + " " + self.y + " " + pt.x + " " + pt.y);
        // console.log(Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2)))
        return Math.sqrt(Math.pow(self.x - pt.x, 2) + Math.pow(self.y - pt.y, 2));
    }

    return self;
}

Entity.getFrameUpdateData = function(){
	var pack = {
		initPack:{
			player:initPack.player,
			bullet:initPack.bullet,
		},
		removePack:{
			player:removePack.player,
			bullet:removePack.bullet,
		},
		updatePack:{
			player:Player.update(),
			bullet:Bullet.update(),
		}
	};
	initPack.player = [];
	initPack.bullet = [];
	removePack.player = [];
	removePack.bullet = [];
	return pack;
}

// #############################################################################
//                               PLAYER CLASS
// #############################################################################

Player = function(param) {
    var self = Entity(param);
    self.number = "" + Math.floor(10 * Math.random());
    self.username = param.username;
    self.pressingRight = false;
    self.pressingLeft = false;
    self.pressingUp = false;
    self.pressingDown = false;
    self.pressingAttack = false;
    self.mouseAngle = 0;
    self.maxSpd = 10;
    self.hp = 10;
    self.hpMax = 10;
    self.score = 0;
    self.inventory = new Inventory(param.socket, true);


    var super_update = self.update;
    self.update = function() {
        self.updateSpd();
        super_update();

        if(self.pressingAttack) {
            self.shootBullet(self.mouseAngle);
        }
    }

    self.shootBullet = function(angle) {
        if(Math.random() < 0.01)
        {
            self.inventory.addItem("POTION",1);
            // logger.info("[" + self.username + "] [POTION - AQUIRED]");
        }

        Bullet({
			parent:self.id,
			angle:angle,
			x:self.x,
			y:self.y,
            map:self.map,
		});
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

    self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,	
			number:self.number,	
			hp:self.hp,
			hpMax:self.hpMax,
			score:self.score,
            map:self.map,
		};		
	}

    self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,
            hp:self.hp,
			score:self.score,
            map:self.map,
		}	
	}

    Player.list[self.id] = self;

    initPack.player.push(self.getInitPack());


    return self;
}

Player.list = {};

Player.onConnect = function(socket,username){
    var map = 'forest';
    var mapl = "LIBRARY";
	if(Math.random() < 0.5){
		map = 'field';
        mapl = "CASTEL";
    }

    logger.info("[" + username + "] [CONNECTED - SUCCESSFUL]");
    logger.info("[" + username + "] [MAP - "+ mapl +"]");

    
    var player = Player({
        username:username,
		id:socket.id,
        map:map,
        socket:socket,
	});
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
        else if(data.inputId === 'attack'){
            player.pressingAttack = data.state;
        }
        else if(data.inputId === 'mouseAngle'){
            player.mouseAngle = data.state;
        }
    })

    socket.on('changeMap',function(data){
		if(player.map === 'field'){
			player.map = 'forest';
            logger.info("[" + username + "] [MAP - LIBRARY]");
        }

		else
        {
			player.map = 'field';
            logger.info("[" + username + "] [MAP - CASTEL]");
        }
	});

    socket.on('sendMsgToServer',function(data){
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',player.username + ': ' + data);
		}
	});

    socket.on('sendPmToServer',function(data){ //data:{username,message}
		var recipientSocket = null;
		for(var i in Player.list)
			if(Player.list[i].username === data.username)
				recipientSocket = SOCKET_LIST[i];
		if(recipientSocket === null){
			socket.emit('addToChat','The player ' + data.username + ' is not online.');
		} else {
			recipientSocket.emit('addToChat','From ' + player.username + ':' + data.message);
			socket.emit('addToChat','To ' + data.username + ':' + data.message);
		}
	});

    socket.emit('init',{
        selfId:socket.id,
		player:Player.getAllInitPack(),
		bullet:Bullet.getAllInitPack(),
	})
    
}

Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack());
	return players;
}


Player.onDisconnect = function(socket) {
    delete Player.list[socket.id];
    removePack.player.push(socket.id);
}

Player.update = function() {
    var pack = [];

    for(var i in Player.list){
        var player = Player.list[i];

        player.update();

        pack.push(player.getUpdatePack());
    }

    return pack;
}


// #############################################################################
//                               BULLET CLASS
// #############################################################################

Bullet = function(param) {
    var self = Entity(param);
    self.id = Math.random();
    self.angle = param.angle;
    self.spdX = Math.cos(param.angle/180*Math.PI) * 10;
	self.spdY = Math.sin(param.angle/180*Math.PI) * 10;
	self.parent = param.parent;

    self.timer =  0;
    self.toRemove = false;
    
    var super_update = self.update;
    self.update = function() {

        if(Player.list[self.parent].username == "sai")
        {
            if(self.timer++ > 50) {
                self.toRemove = true;
            }
        }
        else
        {
            if(self.timer++ > 15) {
                self.toRemove = true;
            }
        }

        super_update();

        for(var i in Player.list) {
            var p = Player.list[i];
            if(self.map === p.map && self.getDistance(p) < 32 && self.parent !== p.id) {
                // handle colision hp --;
                p.hp -= 1;
 
				if(p.hp <= 0){
					var shooter = Player.list[self.parent];
					if(shooter)
						shooter.score += 1;
					p.hp = p.hpMax;
					p.x = Math.random() * 500;
					p.y = Math.random() * 500;	
                    logger.info("[" + p.username + "] [DIED]");
                    				
				}
				self.toRemove = true;
            }
        }
    }

    self.getInitPack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,	
            map:self.map,	
		};
	}
	self.getUpdatePack = function(){
		return {
			id:self.id,
			x:self.x,
			y:self.y,		
		};
	}

    Bullet.list[self.id] = self;

    initPack.bullet.push(self.getInitPack());

    return self;
}

Bullet.list = {};

Bullet.update = function() {

    

    var pack = [];
    for(var i in Bullet.list) {
        var bullet = Bullet.list[i];
        
        bullet.update();

        if(bullet.toRemove){
            delete Bullet.list[i];
            removePack.bullet.push(bullet.id);
        }
        else {
            pack.push(bullet.getUpdatePack());;
        }
    }
    return pack;
}


Bullet.getAllInitPack = function(){
	var bullets = [];
	for(var i in Bullet.list)
		bullets.push(Bullet.list[i].getInitPack());
	return bullets;
}
