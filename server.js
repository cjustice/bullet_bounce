//

var express = require('express')
  , app = express(app)
  , server = require('http').createServer(app);


// serve static files from the current directory
app.use(express.static(__dirname));

//

//get EurecaServer class
var Eureca = require('eureca.io');

//create an instance of EurecaServer
var eurecaServer = new Eureca.Server({allow:['setId', 'spawnEnemy', 'kill','updateState']});
var clients = {};

//attach eureca.io to our http server
eurecaServer.attach(server);
//

//detect client connection
//
var colorList = {};
var availableColors = [0,1,2,3];
var mostRecentConnId;

//detect client connection
eurecaServer.onConnect(function (conn) {    
    console.log('New Client id=%s ', conn.id, conn.remoteAddress);
	
	//the getClient method provide a proxy allowing us to call remote client functions
    var remote = eurecaServer.getClient(conn.id);    
	
	//register the client
	clients[conn.id] = {id:conn.id, remote:remote}
	colorList[conn.id] = availableColors.pop();
	//here we call setId (defined in the client side)
	remote.setId(conn.id, colorList);
	mostRecentConnId = conn.id;
});


//detect client disconnection
eurecaServer.onDisconnect(function (conn) {    
    console.log('Client disconnected ', conn.id);
	if (clients[conn.id]) {
		var removeId = clients[conn.id].id;
	
		delete clients[conn.id];
		availableColors.push(colorList[conn.id]);
		delete colorList[conn.id];

		for (var c in clients)
		{
			var remote = clients[c].remote;
		
			//here we call kill() method defined in the client side
			remote.kill(conn.id);
		}
	}
});

eurecaServer.exports.killPlayer = function(id) {
	delete clients[id]
	availableColors.push(colorList[id]);
	delete colorList[id]
}

eurecaServer.exports.handshake = function() {
	var bulletsSent = false;
	for (var c in clients) {
		var remote = clients[c].remote;
		for (var cc in clients) {		
			//send latest known position
			if (c != cc) {
				//console.log(clients[cc]);
				var x = clients[cc].laststate ? clients[cc].laststate.x:  187.2;
				var y = clients[cc].laststate ? clients[cc].laststate.y:  187.2;

				remote.spawnEnemy(clients[cc].id, x, y, colorList, !bulletsSent);
				bulletsSent = true;
			}
		}
	}
}

eurecaServer.exports.handleKeys = function (keys) {
	var conn = this.connection;
	var updatedClient = clients[conn.id];
	
	for (var c in clients)
	{
		var remote = clients[c].remote;
		remote.updateState(updatedClient.id, keys);
		
		//keep last known state so we can send it to new connected clients
		clients[conn.id].laststate = keys;
	}
}

eurecaServer.exports.handleBullets = function(bullets) {
	var conn = this.connection;
	var remote = clients[mostRecentConnId].remote;
	remote.setBullets(bullets);
}

server.listen(8000);