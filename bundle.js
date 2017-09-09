(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
class Coin {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = this.height = 10;
    this.collected = false;
  }

  draw(ctx) {
    ctx.fillStyle = this.collected ? '#ccc' : '#ff0';
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

module.exports = Coin;
},{}],2:[function(require,module,exports){
class HUD {
  constructor(player) {
    this.player = player;

    this.x = 15;
    this.y = 5;
  }

  draw(ctx) {
    ctx.fillStyle = 'black';
    ctx.font = '25px sans-serif';
    ctx.textBaseline = 'top'
    ctx.fillText('Score: '+this.player.score, this.x, this.y);
  }
}

module.exports = HUD;
},{}],3:[function(require,module,exports){
class Input {
  constructor(docBody) {
    this.UP_ARROW = 38; this.RT_ARROW = 39; this.LT_ARROW = 37; this.DN_ARROW = 40; this.SPACE = 32;
    
    this.keys = [];
  
    docBody.addEventListener('keydown', (e) => {
      this.keys[e.keyCode] = true;
    });
  
    docBody.addEventListener('keyup', (e) => {
      this.keys[e.keyCode] = false;
    });
  }

  check(key) {
    return this.keys[key];
  }

  getHorizontal() {
    let r = this.check(this.RT_ARROW);
    let l = this.check(this.LT_ARROW);
    return r && l ? 0 : r ? 1 : l ?  -1 : 0;
  }

  getVertical() {
    return this.check(this.UP_ARROW) || this.check(this.SPACE);
  }
}

module.exports = Input;
},{}],4:[function(require,module,exports){
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
},{"./coin":1,"./platform":5,"./util":7}],5:[function(require,module,exports){
class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.fill();
      ctx.closePath();
    } 
}

module.exports = Platform;
},{}],6:[function(require,module,exports){
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
},{"./util":7}],7:[function(require,module,exports){
class Util {
  constructor() {}

  normalize(i) {
    return i < 0 ? -1 : i > 0 ? 1 : 0;
  }

  clamp(i, v1, v2) {
    if (this.not(v2)) v2 = -v1;
    let minValue = Math.min(v1, v2);
    let maxValue = Math.max(v1, v2);
    if (i < minValue) return minValue;
    if (i > maxValue) return maxValue;
    return i;
  }

  not(o){
    return o === undefined || o === null;
  }

  collide(a, b) {
    if (!this.objectsHaveAllProps([a,b], ['x', 'y', 'width', 'height'])) {
      throw new Error('Cannot check collisions on provided objects');
    }

    let vX = (a.x + (a.width/2)) - (b.x + (b.width/2));
    let vY = (a.y + (a.height/2)) - (b.y + (b.height/2));
    let halfW = (a.width/2) + (b.width/2);
    let halfH = (a.height/2) + (b.height/2);
    let collInfo = null;

    if (Math.abs(vX) < halfW && Math.abs(vY) < halfH) {
      let oX = halfW - Math.abs(vX);
      let oY = halfH - Math.abs(vY);
      collInfo = {};

      if (oX >= oY) {
        collInfo.direction = vY > 0 ? 't' : 'b';
      } else {
        collInfo.direction = vX > 0 ? 'l' : 'r';
      }

      collInfo.overlap = { oX, oY };
    }

    return collInfo;
  }

  objectsHaveAllProps(objs, props) {
    for (let obj of objs) {
      if (!this.objectHasAllProps(obj, props)) return false;
    }

    return true;
  }

  objectHasAllProps(obj, props) {
    for (let prop of props) {
      if (!obj.hasOwnProperty(prop)) return false;
    }

    return true;
  }
}

module.exports = new Util();

},{}],8:[function(require,module,exports){
const Player = require('./classes/player');
const Input = require('./classes/input');
const Level = require('./classes/level');
const HUD = require('./classes/hud');

class CVS {
  constructor() {
    console.log("Hello, CanvasGame");
    
    this.canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext('2d');
    this.stageProps = {
      width:1920,
      height:1080,
      friction:0.8,
      gravity:0.6
    };

    this.canvas.width = this.stageProps.width;
    this.canvas.height = this.stageProps.height;

    this.player = new Player(this.stageProps);
    this.input = new Input(document.body);
    this.level = new Level(this.stageProps);
    this.hud = new HUD(this.player);

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
    this.hud.draw(this.ctx);


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


},{"./classes/hud":2,"./classes/input":3,"./classes/level":4,"./classes/player":6}]},{},[8]);
