var game = new Phaser.Game(1200, 900, Phaser.CANVAS, 'bullet-bounce', { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.tilemap('map', 'assets/tilemaps/maps/small_square.json', null, Phaser.Tilemap.TILED_JSON)
    game.load.image('first_tiles_1x1', 'assets/tilemaps/tiles/first_tiles_1x1.png');
    game.load.image('background','assets/tests/debug-grid-1920x1920.png');
    game.load.image('player','assets/sprites/blob-blue.png');
    game.load.image('bullet', 'assets/sprites/bullet-blue.png');
}

var debug = true;

var map;
var layer;
var player;
var cursors;
var bullets;
var fireRate = 100;
var nextFire = 0;
var currentSpeed = 0;
var angle = 0;
var desired_movement = 400;
var bullet_speed = 30;
var speed = 0;
var xVel,yVel;

var wasd;

function create() {
    map = game.add.tilemap('map');
    map.addTilesetImage('testtiles_1x1','first_tiles_1x1')

    map.setCollisionBetween(1, 12);

    layer = map.createLayer('Tile Layer 1');
    layer.resizeWorld();
    game.add.existing(layer);

    

    //game.physics.convertTilemap(map, layer);

    //game.world.setBounds(0, 0, 1920, 1920);
    //game.add.tileSprite(0, 0, 1920, 1920, 'background');
    player = game.add.sprite(100,100, 'player');
    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.height *= .9;
    player.body.width *= .9;

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

    bullets.createMultiple(500, 'bullet', 0, false);
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
    game.physics.arcade.collide(bullets, layer);
    
}



function move_player() {
    game.physics.arcade.collide(player, layer);

    speed = (desired_movement);
    xVel = 0;
    yVel = 0;
    if (wasd.left.isDown) {
        xVel -= speed
    }
    if (wasd.right.isDown) {
        xVel += speed;
    }
    if (wasd.up.isDown) {
        yVel -= speed;
    }
    if (wasd.down.isDown) {
        yVel += speed;
    }

    player.body.velocity.x = xVel;
    player.body.velocity.y = yVel;
        

    if (mouse.isDown) {
        console.log ("shoot!");
        shoot(xVel,yVel);
    }

}

function shoot(xVel,yVel) {
    //console.log(xVel + ", " + yVel)
    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstExists(false);

        bullet.reset(player.body.x+16, player.body.y+16);

        game.physics.arcade.moveToPointer(bullet, bullet_speed);
        bullet.body.velocity.x += xVel;
        bullet.body.velocity.y += yVel;
        bullet.body.bounce.x = 1;
        bullet.body.bounce.y = 1;
    }
}

function render() {

    if (debug){
        game.debug.text('FPS: ' + game.time.fps, 32, 32);

        game.debug.bodyInfo(player, 32, 50);
        game.debug.body(player);
    }
}
