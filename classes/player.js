const util = require('./util');

function Player(stageProps) {
  console.log('Hello, Player');

  this.width = this.height = 5;
  this.x = stageProps.width/2;
  this.y = stageProps.height - this.height;
  this.speed = 3;
  this.velX = 0;
  this.velY = 0;
  this.jumping = false;
  this.stageProps = stageProps;
}

Player.prototype = {
  move:function(horizontal, vertical){
    horizontal = util.normalize(horizontal);
    this.velX += horizontal;
    this.velX = util.clamp(this.velX, this.speed);
    this.velX *= this.stageProps.friction;

    if (vertical) {
      if (!this.jumping) {
        this.jumping = true;
        this.velY = -this.speed*2
      }
    }

    this.velY += this.stageProps.gravity;

    this.x += this.velX;
    this.y += this.velY;

    this.x = util.clamp(this.x, this.stageProps.width - this.width, 0);
    this.y = util.clamp(this.y, this.stageProps.height - this.height, 0);

    if (this.y >= this.stageProps.height - this.height) { this.jumping = false; }
  },
  draw:function(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

exports = module.exports = Player;