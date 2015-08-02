var boot = function(game){
    console.log("%Starting Game", "color:white; background:red");
};
  
boot.prototype = {
    preload: function(){
          this.game.load.image("splash","assets/demoscene/joes1.png"); 
    },

    create: function(){
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.setScreenSize();
        this.game.state.start("Preload");
    }
}