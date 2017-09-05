const Player = require('./classes/player');
const Input = require('./classes/input');
const Level = require('./classes/level');

class CVS {
  constructor() {
    console.log("Hello, CanvasGame");
    
    this.canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext('2d');
    this.stageProps = {
      width:500,
      height:200,
      friction:0.8,
      gravity:0.3
    };

    this.canvas.width = this.stageProps.width;
    this.canvas.height = this.stageProps.height;

    this.player = new Player(this.stageProps);
    this.input = new Input(document.body);
    this.level = new Level(this.stageProps);

    window.addEventListener("load", () => { this.update(); } );
  }

  update() {
    this.ctx.clearRect(0, 0, this.stageProps.width, this.stageProps.height);
    
    //player
    this.player.move(this.input.getHorizontal(), this.input.getVertical());

    //check collisions
    this.level.collide(this.player);

    //draw
    this.player.draw(this.ctx);
    this.level.draw(this.ctx);


    requestAnimationFrame(() => { this.update(); });
  }
}

(function(){
  let requestAnimationFrame = window.requestAnimationFrame || 
                              window.mozRequestAnimationFrame || 
                              window.webkitRequestAnimationFrame || 
                              window.msRequestAnimationFrame;

  window.requestAnimationFrame = requestAnimationFrame;

  let cvs = new CVS();
})()

