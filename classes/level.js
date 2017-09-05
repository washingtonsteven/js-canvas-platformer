const Platform = require('./platform');
const util = require('./util');

class Level {
  constructor(stageProps) {
    this.platforms = [];

    this.platforms.push(new Platform(0, 0, 10, stageProps.height));
    this.platforms.push(new Platform(0, stageProps.height-2, stageProps.width, 50));
    this.platforms.push(new Platform(stageProps.width - 10, 0, 50, stageProps.height));
    this.platforms.push(new Platform(stageProps.width/2 - 100, stageProps.height - 60, 200, 10));
  }

  collide(player) {
    player.grounded = false;
    this.platforms.forEach((platform) => {
      var collisionInfo = util.collide(player, platform);
      if (collisionInfo) {
        switch(collisionInfo.direction) {
          case 't': 
            player.y += collisionInfo.overlap.oY; break;
          case 'b':
            player.y -= collisionInfo.overlap.oY; break;
          case 'l':
            player.x += collisionInfo.overlap.oX; break;
          case 'r':
            player.x -= collisionInfo.overlap.oX; break;
        }

        if (collisionInfo.direction == 'l' || collisionInfo.direction == 'r') {
          player.velX = 0; player.jumping = false;
        } else if (collisionInfo.direction == 'b') {
          player.grounded = true; player.jumping = false;
        } else if (collisionInfo.direction == 't') {
          player.velY = 0;
        }
      }
    });
  }

  draw(ctx) {
    this.platforms.forEach((p) => {
      p.draw(ctx);
    })
  }
}

module.exports = Level;