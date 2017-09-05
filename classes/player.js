const util = require('./util');

class Player {
  constructor(stageProps) {
    console.log('Hello, Player');
    
    this.width = this.height = 20;
    this.x = stageProps.width/2;
    this.y = stageProps.height/2 - this.height;
    this.speed = 6;
    this.velX = 0;
    this.velY = 0;
    this.jumping = false;
    this.grounded = false;
    this.stageProps = stageProps;
    this.score = 0;
  }

  move(horizontal, vertical) {
    horizontal = util.normalize(horizontal);
    this.velX += horizontal;
    this.velX = util.clamp(this.velX, this.speed);
    this.velX *= this.stageProps.friction;

    if (vertical) {
      if (!this.jumping && this.grounded) {
        this.jumping = true;
        this.grounded = false;
        this.velY = -this.speed*2
      }
    }

    this.velY += this.stageProps.gravity;

    if (this.grounded) this.velY = 0;

    this.x += this.velX;
    this.y += this.velY;

    //keep the player on screen
    //no longer needed if the Level has wall objects
    //this.x = util.clamp(this.x, this.stageProps.width - this.width, 0);
    //this.y = util.clamp(this.y, this.stageProps.height - this.height, 0);

    //if (this.y >= this.stageProps.height - this.height) { this.jumping = false; this.grounded = true; }
  }

  draw(ctx) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

module.exports = Player;