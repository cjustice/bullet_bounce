var preload = function(game){}

preload.prototype = {
    preload: function(){ 
        var splash = this.add.sprite(300,300,"splash");
        splash.anchor.setTo(0.5,0.5);
        this.load.setPreloadSprite(splash);
      // menu
      this.game.load.image('play', 'assets/buttons/Play-button.gif');
      // main game
      this.game.load.tilemap('map', 'assets/tilemaps/maps/big_square.json', null, Phaser.Tilemap.TILED_JSON)
      this.game.load.image('first_tiles_1x1', 'assets/tilemaps/tiles/first_tiles_1x1.png');
      this.game.load.image('background','assets/tests/debug-grid-1920x1920.png');
      this.game.load.image('player','assets/sprites/blob-blue.png');
      this.game.load.image('bullet', 'assets/sprites/bullet-blue.png');
    },
    create: function(){
        this.game.state.start("MainMenu");
    }
}