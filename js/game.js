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
    
    eurecaClient.exports.setId = function(id) 
    {
        //create() is moved here to make sure nothing is created before uniq id assignation
        myId = id;
        create();
        eurecaServer.handshake();
        ready = true;
    }   
    
    eurecaClient.exports.kill = function(id)
    {   
        if (shipsList[id]) {
            shipsList[id].ship.kill();
            console.log('killing ', id, shipsList[id]);
        }
    }   
    
    eurecaClient.exports.spawnEnemy = function(i, x, y)
    {
        if (i == myId) return; //this is me
        console.log("New enemy at "+x+", "+y);
        console.log('SPAWN');
        var shp = new Ship(i, game, ship, x+(player.ship.width*player.ship.anchor.x*.8), y+(player.ship.width*player.ship.anchor.x*.8));
        // shp.wasd.x = x;
        // shp.wasd.y = y;
        shipsList[i] = shp;
    }

    eurecaClient.exports.updateState = function(id, state)
    {      
        console.log("running updateState");
        // console.log(shipsList);
        // console.log(myId);
        if (shipsList[id])  {
            shipsList[id].input = state;
            //console.log("Updating + " + id + " with " + state.x + ", " + state.y)
            //shipsList[id].ship.body.x = state.x;
            //shipsList[id].ship.body.y = state.y;
            //shipsList[id].ship.x = state.x;
            //shipsList[id].ship.y = state.y;
            //console.log("ShipsList"+id+ "is getting x: " + state.x + "y: " + state.y);
            //shipsList[id].ship.rotation = state.rotation;
            // shipsList[id].turret.rotation = state.rot;
            //shipsList[id].update();
        }
    }
}

var game = new Phaser.Game(1200, 900, Phaser.CANVAS, 'bullet-bounce', { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload() {
    game.load.tilemap('map', 'assets/tilemaps/maps/small_square.json', null, Phaser.Tilemap.TILED_JSON)
    game.load.image('first_tiles_1x1', 'assets/tilemaps/tiles/first_tiles_1x1.png');
    game.load.image('background','assets/tests/debug-grid-1920x1920.png');
    game.load.image('shipblue','assets/sprites/blob-blue.png');
    game.load.image('bullet', 'assets/sprites/bullet-blue.png');
}

var debug = true;

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

var refreshXY = 0;

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
    var x = startX;
    var y = startY;
    this.ship = game.add.sprite(x,y,'shipblue');
    game.physics.enable(this.ship, Phaser.Physics.ARCADE);
    this.ship.anchor.set(0.5);
    this.ship.body.immovable = false;
    this.ship.body.collideWorldBounds = true;
    this.ship.body.bounce.setTo(0, 0);
    this.ship.id = index;
    this.ship.body.height *= .8;
    this.ship.body.width *= .8;
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
    this.speed = 200;
}

Ship.prototype.update = function() {
    //console.log(this.ship.body.velocity);
    refreshXY++
    if (refreshXY == 20) {
        this.ship.body.x = this.input.x//this.wasd.x;
        this.ship.body.y = this.input.y;
        refreshXY = 0;
    }

    xVel = 0;
    yVel = 0;
    if (this.input.left) {
        xVel -= this.speed
        console.log("left")
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
    if (mouse.isDown) {
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
                player.input.x = player.ship.x - (player.ship.width*player.ship.anchor.x*.8);
                player.input.y = player.ship.y - (player.ship.height*player.ship.anchor.y*.8);
                player.input.rotation = player.ship.rotation;
            } 
            shipsList[i].update();
            eurecaServer.handleKeys(player.input);
        }
    }

        // game.physics.arcade.overlap(player.ship, bullets, function(player,bullet){
        //     player.kill();
        //     bullet.kill();
        // });
}

function doChange() {
    player.ship.body.x = 300;
}

function move_player(plyr) {
    xVel = 0;
    yVel = 0;
    if (wasd.left.isDown) {
        xVel -= plyr.speed
    }
    if (wasd.right.isDown) {
        xVel += plyr.speed;
    }
    if (wasd.up.isDown) {
        yVel -= plyr.speed;
    }
    if (wasd.down.isDown) {
        yVel += plyr.speed;
    }

    plyr.ship.body.velocity.x = xVel;
    plyr.ship.body.velocity.y = yVel;

    if (mouse.isDown) {
        //console.log ("shoot!");
        plyr.shoot(xVel,yVel);
    }
    //plyr.ship.rotation = game.physics.arcade.angleToPointer(player.ship) + Math.PI/2;
}

// function move_players() {
//     //speed = 400;
//     xVel = 0;
//     yVel = 0;
//     if (wasd.left.isDown) {
//         xVel -= player.speed
//     }
//     if (wasd.right.isDown) {
//         xVel += player.speed;
//     }
//     if (wasd.up.isDown) {
//         yVel -= player.speed;
//     }
//     if (wasd.down.isDown) {
//         yVel += player.speed;
//     }

//     player.ship.body.velocity.x = xVel;
//     player.ship.body.velocity.y = yVel;

//     if (mouse.isDown) {
//         //console.log ("shoot!");
//         player.shoot(xVel,yVel);
//     }
//     player.ship.rotation = game.physics.arcade.angleToPointer(player.ship) + Math.PI/2;
// }

Ship.prototype.shoot = function(xVel,yVel) {
    //console.log(xVel + ", " + yVel)
    if (game.time.now > nextFire && bullets.countDead() > 0)
    {   
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstExists(false);

        radius = 20;

        bullet.reset(player.ship.body.center.x,player.ship.body.center.y);
        //bullet.reset(player.ship.body.x+ 16 + radius*Math.cos(player.ship.rotation - Math.PI/2), player.ship.body.y+16 + radius*Math.sin(player.ship.rotation - Math.PI/2));

        game.physics.arcade.moveToPointer(bullet, bullet_speed);
    }
}

function render() {
    if (!ready) return;
    if (debug){
        game.debug.text('FPS: ' + game.time.fps, 32, 32);

        game.debug.bodyInfo(player.ship, 32, 50);
        game.debug.body(player.ship);
    }
}
