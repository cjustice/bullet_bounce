var main_menu = function(game){}

main_menu.prototype = {
    create: function(){
        // var gameTitle = this.game.add.sprite(160,160,"gametitle");
        // gameTitle.anchor.setTo(0.5,0.5);
        var playButton = this.game.add.button(this.game.width / 2, this.game.height * .7,"play",this.playTheGame,this);
        playButton.anchor.setTo(0.5,0.5);
    },

    playTheGame: function(){
    	console.log("Menu done")
        this.game.state.start("Game");
    }
}