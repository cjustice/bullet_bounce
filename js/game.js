var game = new Phaser.Game(1200, 900, Phaser.CANVAS, 'bullet-bounce', 
    { preload: preload, create: create, update: update, render: render });
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
    this.ship = game.add.sprite(this.x,this.y,'ship');
    game.physics.enable(this.ship, Phaser.Physics.ARCADE);
    this.ship.anchor.set(0.5);
    this.ship.body.immovable = false;
    this.ship.body.collideWorldBounds = true;
    this.ship.body.bounce.setTo(0, 0);
    this.ship.id = index;
}

Ship.prototype.update = function() {
    for (var i in this.input) this.wasd[i] = this.input[i];
    speed = desired_movement / game.time.elapsed;
    if (this.wasd.left) {
        this.ship.body.x -= speed;
    }
    if (this.wasd.right) {
        this.ship.body.x += speed;
    }
    if (this.wasd.up) {
        this.ship.body.y -= speed;
    }
    if (this.wasd.down) {
        this.ship.body.y += speed;
    }
}

function preload() {
	game.load.image('background','assets/tests/debug-grid-1920x1920.png');
    game.load.image('ship','assets/sprites/blob-blue.png');
    game.load.image('bullet', 'assets/games/tanks/bullet.png');
}

function create() {
	game.world.setBounds(0, 0, 1920, 1920);
	game.add.tileSprite(0, 0, 1920, 1920, 'background');
    //player = game.add.sprite(0, 0, 'ship');
    //game.physics.enable(player, Phaser.Physics.ARCADE);
    cursors = game.input.keyboard.createCursorKeys();
    mouse = game.input.mousePointer;
    //player.anchor.set(0.5);
    shipsList = {};
    player = new Ship(myId,game,ship);
    ship = player.ship;
    shipsList[myId] = player;
    ship.x = 0;
    ship.y = 0;
    ship.bringToTop();
    //game.camera.follow(ship);
    wasd = {
        up: game.input.keyboard.addKey(Phaser.Keyboard.W),
        left: game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: game.input.keyboard.addKey(Phaser.Keyboard.D),
        down: game.input.keyboard.addKey(Phaser.Keyboard.S)
    };
}

function update() {
    game.time.advancedTiming = true;
    angle = -game.math.angleBetween(mouse.x - game.camera.x,mouse.y-game.camera.y, ship.body.x, ship.body.y) * 180/Math.PI;
    ship.body.rotation = angle;
    move_players();
}

function render() {
    game.debug.text('FPS: ' + game.time.fps, 32, 32);
}

function move_players() {
    player.input.left = wasd.left.isDown;
    player.input.right = wasd.right.isDown;
    player.input.up = wasd.up.isDown;
    player.input.down = wasd.down.isDown;
    // console.log(player.input.left);
    // console.log(player.input.right);
    // console.log(player.input.up);
    // console.log(player.input.down);
    shipsList[0].update();
}
