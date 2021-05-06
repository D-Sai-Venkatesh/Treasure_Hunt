Inventory = function(socket,server){
    var self = {
        items:[], //{id:"itemId",amount:1}
		socket:socket,
		server:server,
    }
    self.addItem = function(id,amount){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id){
				self.items[i].amount += amount;
				
				if(self.server)
				{
					logger.info("[" + Player.list[socket.id].username + "] [" + id + " - AQUIRED]");
				}
				
				self.refreshRender();
				return;
			}
		}
		self.items.push({id:id,amount:amount});
		self.refreshRender();

		

    }
    self.removeItem = function(id,amount){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id){
				self.items[i].amount -= amount;
				
				if(self.server)
				{
					logger.info("[" + Player.list[socket.id].username + "] [" + id + " - USED]");
				}
				
				if(self.items[i].amount <= 0)
					self.items.splice(i,1);
				self.refreshRender();
				return;
			}
		}
		
    }
    self.hasItem = function(id,amount){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id){
				return self.items[i].amount >= amount;
			}
		}  
		return false;
    }
	self.refreshRender = function(){
		//server
		if(self.server){
			self.socket.emit('updateInventory',self.items);
			return;
		}
		//client only
		var inventory = document.getElementById("inventory");
		inventory.innerHTML = "";
		var addButton = function(data){
			let item = Item.list[data.id];
			let button = document.createElement('button'); 
			button.onclick = function(){
				self.socket.emit("useItem",item.id);
			}
			button.innerText = item.name + " x" + data.amount;
			inventory.appendChild(button);
		}
		for(var i = 0 ; i < self.items.length; i++)
			addButton(self.items[i]);
	}
	if(self.server){
		self.socket.on("useItem",function(itemId){
			if(!self.hasItem(itemId,1)){
				console.log("Cheater");
				return;
			}
			let item = Item.list[itemId];
			item.event(Player.list[self.socket.id]);
		});

	}

	return self;
}


Item = function(id,name,event){
	var self = {
		id:id,
		name:name,
		event:event,
	}
	Item.list[self.id] = self;
	return self;
}
Item.list = {};

Item("POTION","POTION",function(player){
	player.hp = 10;
	player.inventory.removeItem("POTION",1);
	player.inventory.addItem("SUPERATTACK",1);
});

Item("SUPERATTACK","SUPERATTACK",function(player){
	for(var i = 0 ; i < 360; i = i + 10)
		player.shootBullet(i);

		player.inventory.removeItem("SUPERATTACK",1);
});





