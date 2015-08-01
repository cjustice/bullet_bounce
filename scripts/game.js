//
var player;
var myId = 0;
var cursors;
var bullets;
var fireRate = 100;
var nextFire = 0;
var currentSpeed = 0;
var angle = 0;
var desired_movement = 100;
var speed = 0;
var shipsList;
var ship;
var wasd;
var curX;
var curY;

var ready = false;
var eurecaServer;
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
    //
    eurecaClient.exports.updateState = function(id, state)
    {
        if (shipsList[id])  {
            // shipsList[id].wasd = state;
            console.log(state.x);
            shipsList[id].ship.body.velocity.x = state.x;
            shipsList[id].ship.body.velocity.y = state.y;            
            shipsList[id].ship.rotation = state.rotation;
            // shipsList[id].turret.rotation = state.rot;
            // shipsList[id].update();
        }
    }

    eurecaClient.exports.kill = function(id)
    {   
        if (shipsList[id]) {
            shipsList[id].kill();
            console.log('killing ', id, shipsList[id]);
        }
    }   
    
    eurecaClient.exports.spawnEnemy = function(i, x, y)
    {
        
        if (i == myId) return; //this is me
        
        console.log('SPAWN');
        var tnk = new Ship(i, game, ship);
        shipsList[i] = tnk;
    }
    
}

Ship = function(index, game, player) {
    this.input = {
        left:false,
        right:false,
        up:false,
        down:false
    };
    this.wasd = {
        left:false,
        right:false,
        up:false,
        down:false        
    };
    var x = 0;
    var y = 0;
    this.game = game;
    this.player = player;
    this.ship = game.add.sprite(this.x,this.y,'shipred');
    game.physics.enable(this.ship, Phaser.Physics.ARCADE);
    this.ship.anchor.set(0.5);
    this.ship.body.immovable = false;
    this.ship.body.collideWorldBounds = true;
    this.ship.body.bounce.setTo(0, 0);
    this.ship.id = index;
    this.posVars = {
        x: 0,
        y: 0,
        rotation: 0
    };
    this.curX = 0;
    this.curY = 0;
}

Ship.prototype.update = function() {
    var inputChanged = (
      this.wasd.left != this.input.left ||
      this.wasd.right != this.input.right ||
      this.wasd.up != this.input.up ||
      this.wasd.down != this.input.down
    );
    //for (var i in this.input) this.wasd[i] = this.input[i];
    //console.log(inputChanged);
   // speed = desired_movement / game.time.elapsed;
    if (inputChanged) {
        if (this.ship.id == myId) {
            if (this.input.left) {
                //this.ship.body.x -= speed;
                this.posVars.x -= 5;
                //console.log(this.posVars);
            }
            if (this.input.right) {
                //this.ship.body.x += speed;
                this.posVars.x += 5;
                //console.log(this.posVars);
            }
            if (this.input.up) {
                this.posVars.y -= 5;
            }
            if (this.input.down) {
                this.posVars.y += 5;
            }
        }
        this.posVars.rotation = this.ship.rotation;
        console.log("ID + " + myId);
       // console.log(this.posVars);

    eurecaServer.handleKeys(this.posVars);
    }
    //this.posVars.angle = this.ship.body.angle;
}

var game = new Phaser.Game(1200, 900, Phaser.CANVAS, 'bullet-bounce', 
    { preload: preload, create: eurecaClientSetup, update: update, render: render });

function preload() {
    game.stage.disableVisibilityChange = true;
    game.load.image('background','assets/tests/debug-grid-1920x1920.png');
    game.load.image('ship','assets/sprites/blob-blue.png');
    game.load.image('shipred','assets/sprites/blob-red.png');
    game.load.image('bullet', 'assets/games/tanks/bullet.png');
}

function create() {
    //console.log("test");
    game.world.setBounds(0, 0, 1920, 1920);
    game.add.tileSprite(0, 0, 1920, 1920, 'background');
    cursors = game.input.keyboard.createCursorKeys();
    mouse = game.input.mousePointer;
    shipsList = {};
    player = new Ship(myId,game,ship);
    ship = player.ship;
    shipsList[myId] = player;
    ship.x = 0;
    ship.y = 0;
    ship.bringToTop();
    wasd = {
        up: game.input.keyboard.addKey(Phaser.Keyboard.W),
        left: game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: game.input.keyboard.addKey(Phaser.Keyboard.D),
        down: game.input.keyboard.addKey(Phaser.Keyboard.S)
    };
}

function update() {
    if (ready) { 
        game.time.advancedTiming = true;
        angle = game.math.angleBetween(mouse.x - game.camera.x,mouse.y-game.camera.y, ship.body.x, ship.body.y)
        ship.rotation = angle;
        move_players();
    }
}

function render() {
    game.debug.text('FPS: ' + game.time.fps, 32, 32);
}

function move_players() {
    player.input.left = wasd.left.isDown;
    player.input.right = wasd.right.isDown;
    player.input.up = wasd.up.isDown;
    player.input.down = wasd.down.isDown;
    for (var i in shipsList) {
        if (!shipsList[i]) continue;
        var curShip = shipsList[i].ship;
        shipsList[i].update();
    }
}
