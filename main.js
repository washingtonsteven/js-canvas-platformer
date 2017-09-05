const Player = require('./classes/player');
const Input = require('./classes/input');

let CVS = function() {
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

  window.addEventListener("load", () => { this.update(); } );
};

CVS.prototype = {
  update:function() {
    this.ctx.clearRect(0, 0, this.stageProps.width, this.stageProps.height);

    //player
    this.player.move(this.input.getHorizontal(), this.input.getVertical());
    this.player.draw(this.ctx);


    requestAnimationFrame(() => { this.update(); });
  }
};

(function(){
  let requestAnimationFrame = window.requestAnimationFrame || 
                              window.mozRequestAnimationFrame || 
                              window.webkitRequestAnimationFrame || 
                              window.msRequestAnimationFrame;

  window.requestAnimationFrame = requestAnimationFrame;

  let cvs = new CVS();
})()

