var game = new Phaser.Game(1200, 900, Phaser.CANVAS, 'bullet-bounce', { preload: preload, create: create, update: update, render: render });

function preload() {
	game.load.image('background','assets/tests/debug-grid-1920x1920.png');
    game.load.image('player','assets/sprites/blob-blue.png');
    game.load.image('bullet', 'assets/games/tanks/bullet.png');
}

var player;
var cursors;
var bullets;
var fireRate = 100;
var nextFire = 0;
var currentSpeed = 0;
var angle = 0;
var desired_movement = 100;
var speed = 0;

function create() {
	game.world.setBounds(0, 0, 1920, 1920);
	game.add.tileSprite(0, 0, 1920, 1920, 'background');
    player = game.add.sprite(0, 0, 'player');
    game.physics.enable(player, Phaser.Physics.ARCADE);
    cursors = game.input.keyboard.createCursorKeys();
    mouse = game.input.mousePointer;
    player.anchor.set(.5);
    //game.camera.follow(player);
}

function update() {
    game.time.advancedTiming = true;
    angle = -game.math.angleBetween(mouse.x,mouse.y, player.body.x, player.body.y) * 180/Math.PI;
    player.body.rotation = angle;
    move_player();
}

function render() {
    game.debug.text('FPS: ' + game.time.fps, 32, 32);
}

function move_player() {
    speed = (desired_movement / game.time.elapsed);
    if (cursors.left.isDown) {
        player.body.x -= speed
    }
    if (cursors.right.isDown) {
        player.body.x += speed;
    }
    if (cursors.up.isDown) {
        player.body.y -= speed;
    }
    if (cursors.down.isDown) {
        player.body.y += speed;
    }
}
