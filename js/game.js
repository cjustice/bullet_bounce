var game = new Phaser.Game(1200, 900, Phaser.CANVAS, 'bullet-bounce', { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.image('background','assets/tests/debug-grid-1920x1920.png');
    game.load.image('player','assets/sprites/blob-blue.png');
    game.load.image('bullet', 'assets/sprites/bullet-blue.png');
}

var player;
var cursors;
var bullets;
var fireRate = 1000;
var bullet_speed = 200;
var nextFire = 0;
var currentSpeed = 0;
var angle = 0;
var desired_movement = 100;
var speed = 0;

var wasd;

function create() {
    game.world.setBounds(0, 0, 1920, 1920);
    game.add.tileSprite(0, 0, 1920, 1920, 'background');
    player = game.add.sprite(0, 0, 'player');
    game.physics.enable(player, Phaser.Physics.ARCADE);
    cursors = game.input.keyboard.createCursorKeys();
    mouse = game.input.mousePointer;
    player.anchor.set(.5);

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
    bullets.createMultiple(30, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
    

    game.camera.follow(player);
}

function update() {
    game.time.advancedTiming = true;
    move_player();
    player.rotation = game.physics.arcade.angleToPointer(player) + Math.PI/2;
}

function render() {
    game.debug.text('FPS: ' + game.time.fps, 32, 32);
    // game.debug.text('HERE);
}

function move_player() {
    speed = (desired_movement / game.time.elapsed);
    if (wasd.left.isDown) {
        player.body.x -= speed
    }
    if (wasd.right.isDown) {
        player.body.x += speed;
    }
    if (wasd.up.isDown) {
        player.body.y -= speed;
    }
    if (wasd.down.isDown) {
        player.body.y += speed;
    }
        

    if (mouse.isDown) {
        console.log ("shoot!");
        shoot();
    }

}

function shoot() {
    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstExists(false);

        bullet.reset(player.body.x+16, player.body.y+16);

        bullet.rotation = game.physics.arcade.moveToPointer(bullet, bullet_speed);
    }
}

function render() {
    game.debug.text('FPS: ' + game.time.fps, 32, 32);
}
