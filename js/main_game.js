var main_game = function(game){
    map = null;
    layer = null;
    player = null;

    bullets = null;
    fireRate = 100;
    nextFire = 0;
    currentSpeed = 0;
    angle = 0;
    desired_movement = 400;
    bullet_speed = 300;
    speed = 0;
    xVel = 0;
    yVel = 0;
    debug = true;
    wasd = null;
}

main_game.prototype = {
    preload: function(){
        console.log("Boop")
    },
    
    create: function(){
        console.log("HERE");
        map = this.game.add.tilemap('map');
        map.addTilesetImage('testtiles_1x1','first_tiles_1x1')

        map.setCollisionBetween(1, 12);

        layer = map.createLayer('Tile Layer 1');
        layer.resizeWorld();
        this.game.add.existing(layer);

        

        //game.physics.convertTilemap(map, layer);

        //game.world.setBounds(0, 0, 1920, 1920);
        //game.add.tileSprite(0, 0, 1920, 1920, 'background');
        player = this.game.add.sprite(100,100, 'player');
        this.game.physics.enable(player, Phaser.Physics.ARCADE);

        player.body.height *= .8;
        player.body.width *= .8;

        cursors = this.game.input.keyboard.createCursorKeys();
        mouse = this.game.input.mousePointer;
        player.anchor.set(.5);

        wasd = {
                    up: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
                    down: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
                    left: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
                    right: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
        };

        //adding player bullets
        bullets = this.game.add.group();
        bullets.enableBody = true;
        bullets.physicsBodyType = Phaser.Physics.ARCADE;

        bullets.createMultiple(500, 'bullet', 0, false);
        bullets.setAll('anchor.x', 0.5);
        bullets.setAll('anchor.y', 0.5);
        bullets.setAll('body.bounce.x', 1);
        bullets.setAll('body.bounce.y', 1);
        bullets.setAll('outOfBoundsKill', true);
        bullets.setAll('checkWorldBounds', true);
        

        this.game.camera.follow(player);
    },



    update: function(){
        this.game.time.advancedTiming = true;
        this.move_player();
        player.rotation = this.game.physics.arcade.angleToPointer(player) + Math.PI/2;
        this.game.physics.arcade.collide(bullets, layer);

        this.game.physics.arcade.overlap(layer, bullets, function(layer,bullet){
            console.log("HERE");
        });

        this.game.physics.arcade.overlap(player, bullets, function(player,bullet){
            player.kill();
            bullet.kill();
        });
        
    },




    move_player: function(){
        this.game.physics.arcade.collide(player, layer);

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
            this.shoot(xVel,yVel);
        }

    },

    shoot: function(xVel,yVel){
        //console.log(xVel + ", " + yVel)
        if (this.game.time.now > nextFire && bullets.countDead() > 0)
        {   
            nextFire = this.game.time.now + fireRate;

            var bullet = bullets.getFirstExists(false);

            radius = 35;

            bullet.reset(player.body.x+ 16 + radius*Math.cos(player.rotation - Math.PI/2), player.body.y+16 + radius*Math.sin(player.rotation - Math.PI/2));

            this.game.physics.arcade.moveToPointer(bullet, bullet_speed);
            bullet.body.velocity.x += xVel;
            bullet.body.velocity.y += yVel;
            // bullet.body.bounce.x = 1;
            // bullet.body.bounce.y = 1;
        }
    },

    render: function(){

        if (debug){
            this.game.debug.text('FPS: ' + this.game.time.fps, 32, 32);

            this.game.debug.bodyInfo(player, 32, 50);
            this.game.debug.body(player);
        }
    }

}