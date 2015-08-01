var game = new Phaser.Game(1200, 900, Phaser.CANVAS, 'bullet-bounce', { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.tilemap('map', 'assets/tilemaps/maps/big_square.json', null, Phaser.Tilemap.TILED_JSON)
    game.load.image('first_tiles_1x1', 'assets/tilemaps/tiles/first_tiles_1x1.png');
    game.load.image('background','assets/tests/debug-grid-1920x1920.png');
    game.load.image('player','assets/sprites/blob-blue.png');
    game.load.image('bullet', 'assets/sprites/bullet-blue.png');
}

var map;
var layer;
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

function create() {
    map = game.add.tilemap('map');
    map.addTilesetImage('testtiles_1x1','first_tiles_1x1')

    layer = map.createLayer('Tile Layer 1');
    layer.resizeWorld();

    map.setCollisionBetween(1, 12);

    //game.physics.convertTilemap(map, layer);

    game.world.setBounds(0, 0, 1920, 1920);
    //game.add.tileSprite(0, 0, 1920, 1920, 'background');
    player = game.add.sprite(0, 0, 'player');
    game.physics.enable(player, Phaser.Physics.ARCADE);
    cursors = game.input.keyboard.createCursorKeys();
    mouse = game.input.mousePointer;
    player.anchor.set(.5);

    //adding player bullets
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
    

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
    
    angle = -game.math.angleBetween(mouse.x,mouse.y, player.body.x, player.body.y) * 180/Math.PI;
    // console.log(angle);
    player.body.rotation = angle;
    // console.log(player.body.rotation)    

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

        bullet.velocity = game.physics.arcade.moveToPointer(bullet, bullet_speed);
    }
}

function render() {
    game.debug.text('FPS: ' + game.time.fps, 32, 32);
}
