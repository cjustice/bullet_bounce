var game = new Phaser.Game(1200, 900, Phaser.CANVAS, 'bullet-bounce', { preload: preload, create: create, update: update, render: render });

function preload() {
	game.load.image('background','assets/tests/debug-grid-1920x1920.png');
    game.load.image('player','assets/sprites/phaser-dude.png');
    game.load.image('bullet', 'assets/games/tanks/bullet.png');
}

var player;
var cursors;
var bullets;
var fireRate = 100;
var nextFire = 0;
var currentSpeed = 0;
var elapsed = 0;
var adjust = 0;

function create() {
	game.world.setBounds(0, 0, 1920, 1920);
	game.add.tileSprite(0, 0, 1920, 1920, 'background');
    player = game.add.sprite(0, 0, 'player');
    game.physics.enable(player, Phaser.Physics.ARCADE);
    cursors = game.input.keyboard.createCursorKeys();
    player.body.drag.set(0.2);
    player.body.maxVelocity.setTo(400, 400);
    player.body.collideWorldBounds = true;
    player.bringToTop();
    game.time.advancedTiming = true;
    game.time.desiredFps = 30;
}

function update() {
	//player.body.setZeroVelocity();
	elapsed = game.time.elapsed;
	//adjust = (elapsed/60);
	//console.log(adjust);
    if (cursors.left.isDown)
    {
        player.body.x -= (.4 * elapsed);
    }
    if (cursors.right.isDown)
    {
        player.body.x += (.4 * elapsed);
    }
    if (cursors.up.isDown)
    {
        //  The speed we'll travel at
        player.body.y -= (.4 * elapsed);
    }
    if (cursors.down.isDown)
    {
        //  The speed we'll travel at
        player.body.y += (.4 * elapsed);
    }
    
}

function render() {
	game.debug.text('FPS: ' + game.time.fps, 32, 32);
}