const Platform = require('./platform');
const Coin = require('./coin');
const util = require('./util');

class Level {
  constructor(stageProps) {
    this.platforms = [];
    this.coins = [];

    this.platforms.push(new Platform(0, 0, 10, stageProps.height));
    this.platforms.push(new Platform(0, stageProps.height-2, stageProps.width, 50));
    this.platforms.push(new Platform(stageProps.width - 10, 0, 50, stageProps.height));
    this.platforms.push(new Platform(stageProps.width/2 - 100, stageProps.height - 100, 200, 13));

    this.coins.push(new Coin(stageProps.width/2 - 20, stageProps.height - 60));
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

    this.coins.forEach((coin) => {
      if (coin.collected) return;

      var collisionInfo = util.collide(player, coin);
      if (collisionInfo) {
        coin.collected = true;
        player.score++;
      }
    });
  }

  draw(ctx) {
    this.platforms.forEach((p) => {
      p.draw(ctx);
    });

    this.coins.forEach((coin) => {
      coin.draw(ctx);
    });
  }
}

module.exports = Level;