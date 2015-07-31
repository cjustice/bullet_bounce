
var game = new Phaser.Game(1200, 900, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {
    game.load.tilemap('map', 'assets/tilemaps/maps/collision_test.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('ground_1x1', 'assets/tilemaps/tiles/ground_1x1.png');
    game.load.image('walls_1x2', 'assets/tilemaps/tiles/walls_1x2.png');
    game.load.image('tiles2', 'assets/tilemaps/tiles/tiles2.png');
    game.load.image('ship', 'assets/sprites/thrust_ship2.png');
    game.load.image('bullet', 'assets/games/tanks/bullet.png');
}

var ship;
var map;
var layer;
var cursors;
var nextFire = 0;
var fireRate = 0;

function create() {
    game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

    game.physics.startSystem(Phaser.Physics.P2JS);

    game.stage.backgroundColor = '#2d2d2d';

    map = game.add.tilemap('map');

    map.addTilesetImage('ground_1x1');
    map.addTilesetImage('walls_1x2');
    map.addTilesetImage('tiles2');
    
    layer = map.createLayer('Tile Layer 1');

    layer.resizeWorld();

    //  Set the tiles for collision.
    //  Do this BEFORE generating the p2 bodies below.
    map.setCollisionBetween(1, 12);

    //  Convert the tilemap layer into bodies. Only tiles that collide (see above) are created.
    //  This call returns an array of body objects which you can perform addition actions on if
    //  required. There is also a parameter to control optimising the map build.
    game.physics.p2.convertTilemap(map, layer);

    ship = game.add.sprite(200, 200, 'ship');
    game.physics.p2.enable(ship);

    game.camera.follow(ship);

    makeBullets();

    //  By default the ship will collide with the World bounds,
    //  however because you have changed the size of the world (via layer.resizeWorld) to match the tilemap
    //  you need to rebuild the physics world boundary as well. The following
    //  line does that. The first 4 parameters control if you need a boundary on the left, right, top and bottom of your world.
    //  The final parameter (false) controls if the boundary should use its own collision group or not. In this case we don't require
    //  that, so it's set to false. But if you had custom collision groups set-up then you would need this set to true.
    game.physics.p2.setBoundsToWorld(true, true, true, true, false);

    //  Even after the world boundary is set-up you can still toggle if the ship collides or not with this:
    //  ship.body.collideWorldBounds = false;

    cursors = game.input.keyboard.createCursorKeys();
}

function makeBullets() {
    //  Our bullet group
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.P2;
    bullets.createMultiple(30, 'bullet', 0, false);
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 0.5);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
}

function update() {
    ship.body.setZeroVelocity();
    ship.body.setZeroRotation();
    if (cursors.left.isDown) {
        ship.body.moveLeft(300);
    }
    if (cursors.right.isDown) {
        ship.body.moveRight(300);
    }
    if (cursors.up.isDown) {
        ship.body.moveUp(300);
    }
    if (cursors.down.isDown) {
        ship.body.moveDown(300);
    }
    if (game.input.mousePointer.isDown) {
        ship.body.rotation += 200;
    }
    if (game.input.activePointer.isDown)
    {
        //  Boom!
        fire();
    }
}

function fire () {

    if (game.time.now > nextFire && bullets.countDead() > 0)
    {
        nextFire = game.time.now + fireRate;

        var bullet = bullets.getFirstExists(false);

        bullet.reset(ship.x, ship.y);
        console.log("bullet");
    }

}

function render() {

}
