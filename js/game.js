var ready = false;
var eurecaServer;
var state;
//this function will handle client communication with the server
var eurecaClientSetup = function() {
    //create an instance of eureca.io client
    var eurecaClient = new Eureca.Client();
    
    eurecaClient.ready(function (proxy) {       
        eurecaServer = proxy;
    });
    
    //methods defined under "exports" namespace become available in the server side
    
    eurecaClient.exports.setId = function(id, colors) 
    {
        //create() is moved here to make sure nothing is created before uniq id assignation
        colorList = colors;
        myId = id;
        create();
        eurecaServer.handshake();
        ready = true;
    }   
    
    eurecaClient.exports.kill = function(id)
    {   
        if (shipsList[id]) {
            shipsList[id].ship.kill();
            delete shipsList[id];
            //console.log('killing ', id, shipsList[id]);
        }
    }   
    
    eurecaClient.exports.spawnEnemy = function(i, x, y, colors, bulletAdmin) {
        console.log("Anyone here?");
        colorList = colors;
        if (i == myId) return; //this is me
        if (!shipsList[i]) { 
            var shp = new Ship(i, game, ship, x+(player.ship.width*player.ship.anchor.x*hitBoxSize), y+(player.ship.width*player.ship.anchor.x*hitBoxSize));
            shipsList[i] = shp;
        }
        //if (bulletAdmin) eurecaServer.handleBullets(JSON.stringify(bullets));
    }

    eurecaClient.exports.updateState = function(id, state)
    {      
        if (shipsList[id])  {
            shipsList[id].input = state;
        }
    }

    eurecaClient.exports.setBullets = function(newBullets) {
        console.log(newBullets);
        //bullets = newBullets;
    }

}

var game = new Phaser.Game(1200, 900, Phaser.CANVAS, 'bullet-bounce', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload() {
    game.load.tilemap('map', 'assets/tilemaps/maps/small_square.json', null, Phaser.Tilemap.TILED_JSON)
    game.load.image('first_tiles_1x1', 'assets/tilemaps/tiles/first_tiles_1x1.png');
    game.load.image('background','assets/tests/debug-grid-1920x1920.png');
    game.load.image('shipblue','assets/sprites/blob-blue.png');
    game.load.image('shipred','assets/sprites/blob-red.png');
    game.load.image('shipgreen','assets/sprites/blob-green.png');
    game.load.image('shippurple','assets/sprites/blob-purple.png');
    game.load.image('bullet', 'assets/sprites/bullet-blue.png');
}

var debug = false;

var map;
var layer;
var player;
var myId = 0;
var cursors;
var bullets;
var fireRate = 100;
var nextFire = 0;
var currentSpeed = 0;
var angle = 0;
var bullet_speed = 300;
var speed = 0;
var xVel,yVel;
var wasd;
var ship;
var shipsList = {};
var colorList = {};
var refreshXY = 0;
var hitBoxSize = 0.6;

function Ship(index, game, player, startX, startY) {
    this.input = {
        left:false,
        right:false,
        up:false,
        down:false,
        fire: false,
        rotation: 0
    };
    this.wasd = {
        left:false,
        right:false,
        up:false,
        down:false,
        fire: false,
        rotation: 0
    };
    this.game = game;
    this.player = player;
    this.x = startX;
    this.y = startY;
    //this.ship = game.add.sprite(x,y,'shipblue');
    console.log(myId);
    console.log(colorList);
    switch(colorList[index]) {
        case 0:
            this.ship = game.add.sprite(this.x,this.y,'shipblue');
            break;
        case 1:
            this.ship = game.add.sprite(this.x,this.y,'shipred');
            break;
        case 2:
            this.ship = game.add.sprite(this.x,this.y,'shipgreen');
            break;
        case 3:
            this.ship = game.add.sprite(this.x,this.y,'shippurple');
            break;
        default: console.log("TOOOOOO MANY PLAYERS!");
    }
    game.physics.enable(this.ship, Phaser.Physics.ARCADE);
    this.ship.anchor.set(0.5);
    this.ship.body.immovable = false;
    this.ship.body.collideWorldBounds = true;
    this.ship.body.bounce.setTo(0, 0);
    this.ship.id = index;
    this.ship.body.height *= hitBoxSize;
    this.ship.body.width *= hitBoxSize;
    this.color = 0;
    this.speed = 200;
}

Ship.prototype.update = function() {
    //console.log(this.ship.body.velocity);
    //console.log(this.input)
    refreshXY++
    if (refreshXY == 5) {
        this.ship.body.x = this.input.x//this.wasd.x;
        this.ship.body.y = this.input.y;
        refreshXY = 0;
    }
    xVel = 0;
    yVel = 0;
    if (this.input.left) {
        xVel -= this.speed;
    }
    if (this.input.right) {
        xVel += this.speed;
    }
    if (this.input.up) {
        yVel -= this.speed;
    }
    if (this.input.down) {
        yVel += this.speed;
    }
    this.ship.body.velocity.x = xVel;
    this.ship.body.velocity.y = yVel;
    this.ship.rotation = this.input.rotation;
    if (this.input.fire) {
        this.shoot(xVel,yVel);
    }
}

function create() {
    game.stage.disableVisibilityChange  = true;
    map = game.add.tilemap('map');
    map.addTilesetImage('testtiles_1x1','first_tiles_1x1')
    map.setCollisionBetween(1, 12);
    layer = map.createLayer('Tile Layer 1');
    layer.resizeWorld();
    game.add.existing(layer);
    player = new Ship(myId, game, ship, 200, 200);
    shipsList[myId] = player;
    cursors = game.input.keyboard.createCursorKeys();
    mouse = game.input.mousePointer;
    wasd = {
        up: game.input.keyboard.addKey(Phaser.Keyboard.W),
        down: game.input.keyboard.addKey(Phaser.Keyboard.S),
        left: game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: game.input.keyboard.addKey(Phaser.Keyboard.D),
    };
    //adding player bullets
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(500, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('body.bounce.x', 1);
    bullets.setAll('body.bounce.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
    game.camera.follow(player.ship);
}



function update() {
    if (!ready) return;
    //player.ship.body.x = 300;
    for (var i in shipsList) game.physics.arcade.collide(shipsList[i].ship, layer);
    game.time.advancedTiming = true;
    game.physics.arcade.collide(bullets, layer);
    game.physics.arcade.overlap(layer, bullets, function(layer,bullet){
        //console.log("HERE");
    });
    //for (var i in shipsList) move_player(shipsList[i]);
    player.input.left = wasd.left.isDown;
    player.input.right = wasd.right.isDown;
    player.input.up = wasd.up.isDown;
    player.input.down = wasd.down.isDown;
    player.input.fire = mouse.isDown;
    player.ship.rotation = game.physics.arcade.angleToPointer(player.ship) + Math.PI/2
    player.input.rotation = game.physics.arcade.angleToPointer(player.ship) + Math.PI/2

    for (var i in shipsList) {
        var inputChanged = (
            shipsList[i].wasd.left != shipsList[i].input.left ||
            shipsList[i].wasd.right != shipsList[i].input.right ||
            shipsList[i].wasd.up != shipsList[i].input.up ||
            shipsList[i].wasd.down != shipsList[i].input.down ||
            shipsList[i].wasd.fire != shipsList[i].input.fire ||
            shipsList[i].wasd.rotation != shipsList[i].input.rotation
        );
        if (inputChanged) {
            shipsList[i].wasd.left = shipsList[i].input.left;
            shipsList[i].wasd.right = shipsList[i].input.right;
            shipsList[i].wasd.up = shipsList[i].input.up;
            shipsList[i].wasd.down = shipsList[i].input.down;
            shipsList[i].wasd.fire = shipsList[i].input.fire;
            shipsList[i].wasd.rotation = shipsList[i].input.rotation;
            if (i == myId) {
                player.input.x = player.ship.x - (player.ship.width*player.ship.anchor.x*hitBoxSize);
                player.input.y = player.ship.y - (player.ship.height*player.ship.anchor.y*hitBoxSize);
                player.input.rotation = player.ship.rotation;
            } 
            shipsList[i].update();
            eurecaServer.handleKeys(player.input);
        }
    }

    for (var i in shipsList) {
        game.physics.arcade.overlap(shipsList[i].ship, bullets, function(ship,bullet){
            console.log("DEATH!")
            // console.log(ship)
            // console.log(ship.body.x+", "+ ship.body.y);
            // console.log(bullet.x + ", " + bullet.y);
            ship.kill();
            bullet.kill();
            delete shipsList[i];
            delete colorList[i];
            if (i == player.ship.id) {
                eurecaServer.killPlayer(i);
            }
        });
    }
}

Ship.prototype.shoot = function(xVel,yVel) {
    if (game.time.now > nextFire && bullets.countDead() > 0 && this.ship.alive)
    {   
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstExists(false);

        radius = 28;

        //bullet.reset(this.ship.body.center.x,this.ship.body.center.y);
        
        //console.log(bullet)
        bullet.reset(this.ship.body.x+ 16 + radius*Math.cos(this.ship.rotation - Math.PI/2), this.ship.body.y+16 + radius*Math.sin(this.ship.rotation - Math.PI/2));

        //game.physics.arcade.moveToPointer(bullet, bullet_speed);
        bullet.body.velocity.x = bullet_speed*Math.cos(this.ship.rotation - Math.PI/2) + xVel;
        bullet.body.velocity.y = bullet_speed*Math.sin(this.ship.rotation - Math.PI/2) + yVel;
        //console.log("movement?")
        // bullet.x += radius*Math.cos(this.ship.rotation - Math.PI/2);
        // bullet.y += radius*Math.sin(this.ship.rotation - Math.PI/2);
        //console.log("movement!")
        //console.log(bullet.x+", "+bullet.y)
        //console.log(bullets);
    }
}

function render() {
    if (!ready) return;
    if (debug){
        game.debug.text('FPS: ' + game.time.fps, 32, 32);

        game.debug.bodyInfo(player.ship, 32, 50);
        game.debug.body(player.ship);
        //game.debug.body(player.bullets);
    }
}
