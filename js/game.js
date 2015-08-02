var game = new Phaser.Game(1200, 900, Phaser.CANVAS, 'bullet-bounce', { preload: preload, create: create, update: update, render: render });

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
var cursors;
var bullets;
var fireRate = 100;
var nextFire = 0;
var currentSpeed = 0;
var angle = 0;
var desired_movement = 400;
var bullet_speed = 300;
var speed = 0;
var xVel,yVel;
var wasd;
var ship;

function Ship(index, game, player) {
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
    this.game = game;
    this.player = player;
    this.ship = game.add.sprite(100,100,'shipblue');
    game.physics.enable(this.ship, Phaser.Physics.ARCADE);
    this.ship.anchor.set(0.5);
    this.ship.body.immovable = false;
    this.ship.body.collideWorldBounds = true;
    this.ship.body.bounce.setTo(0, 0);
    this.id = index;
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
}

function create() {
    map = game.add.tilemap('map');
    map.addTilesetImage('testtiles_1x1','first_tiles_1x1')
    map.setCollisionBetween(1, 12);
    layer = map.createLayer('Tile Layer 1');
    layer.resizeWorld();
    game.add.existing(layer);
    player = new Ship(10, game, ship);
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
    game.time.advancedTiming = true;
    move_player();
    player.ship.rotation = game.physics.arcade.angleToPointer(player.ship) + Math.PI/2;
    game.physics.arcade.collide(bullets, layer);

    game.physics.arcade.overlap(layer, bullets, function(layer,bullet){
        console.log("HERE");
    });

    // game.physics.arcade.overlap(player.ship, bullets, function(player,bullet){
    //     player.kill();
    //     bullet.kill();
    // });
    
}




function move_player() {
    game.physics.arcade.collide(player.ship, layer);
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

    player.ship.body.velocity.x = xVel;
    player.ship.body.velocity.y = yVel;

    if (mouse.isDown) {
        //console.log ("shoot!");
        player.shoot(xVel,yVel);
    }

}

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
    if (debug){
        game.debug.text('FPS: ' + game.time.fps, 32, 32);

        game.debug.bodyInfo(player.ship, 32, 50);
        game.debug.body(player.ship);
    }
}
