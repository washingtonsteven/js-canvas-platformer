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
    objs.forEach((obj) => {
      if (!this.objectHasAllProps(obj, props)) return false;
    });

    return true;
  }

  objectHasAllProps(obj, props) {
    props.forEach((prop) => {
      if (!obj.hasOwnProperty(prop)) return false;
    });

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


},{"./classes/hud":2,"./classes/input":3,"./classes/level":4,"./classes/player":6}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4xMS4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsYXNzZXMvY29pbi5qcyIsImNsYXNzZXMvaHVkLmpzIiwiY2xhc3Nlcy9pbnB1dC5qcyIsImNsYXNzZXMvbGV2ZWwuanMiLCJjbGFzc2VzL3BsYXRmb3JtLmpzIiwiY2xhc3Nlcy9wbGF5ZXIuanMiLCJjbGFzc2VzL3V0aWwuanMiLCJtYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjbGFzcyBDb2luIHtcbiAgY29uc3RydWN0b3IoeCwgeSkge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICB0aGlzLndpZHRoID0gdGhpcy5oZWlnaHQgPSAxMDtcbiAgICB0aGlzLmNvbGxlY3RlZCA9IGZhbHNlO1xuICB9XG5cbiAgZHJhdyhjdHgpIHtcbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5jb2xsZWN0ZWQgPyAnI2NjYycgOiAnI2ZmMCc7XG4gICAgY3R4LnN0cm9rZVN0eWxlID0gJ2JsYWNrJztcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmFyYyh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgMCwgTWF0aC5QSSAqIDIpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LnN0cm9rZSgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ29pbjsiLCJjbGFzcyBIVUQge1xuICBjb25zdHJ1Y3RvcihwbGF5ZXIpIHtcbiAgICB0aGlzLnBsYXllciA9IHBsYXllcjtcblxuICAgIHRoaXMueCA9IDE1O1xuICAgIHRoaXMueSA9IDU7XG4gIH1cblxuICBkcmF3KGN0eCkge1xuICAgIGN0eC5maWxsU3R5bGUgPSAnYmxhY2snO1xuICAgIGN0eC5mb250ID0gJzI1cHggc2Fucy1zZXJpZic7XG4gICAgY3R4LnRleHRCYXNlbGluZSA9ICd0b3AnXG4gICAgY3R4LmZpbGxUZXh0KCdTY29yZTogJyt0aGlzLnBsYXllci5zY29yZSwgdGhpcy54LCB0aGlzLnkpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSFVEOyIsImNsYXNzIElucHV0IHtcbiAgY29uc3RydWN0b3IoZG9jQm9keSkge1xuICAgIHRoaXMuVVBfQVJST1cgPSAzODsgdGhpcy5SVF9BUlJPVyA9IDM5OyB0aGlzLkxUX0FSUk9XID0gMzc7IHRoaXMuRE5fQVJST1cgPSA0MDsgdGhpcy5TUEFDRSA9IDMyO1xuICAgIFxuICAgIHRoaXMua2V5cyA9IFtdO1xuICBcbiAgICBkb2NCb2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgdGhpcy5rZXlzW2Uua2V5Q29kZV0gPSB0cnVlO1xuICAgIH0pO1xuICBcbiAgICBkb2NCb2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcbiAgICAgIHRoaXMua2V5c1tlLmtleUNvZGVdID0gZmFsc2U7XG4gICAgfSk7XG4gIH1cblxuICBjaGVjayhrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5rZXlzW2tleV07XG4gIH1cblxuICBnZXRIb3Jpem9udGFsKCkge1xuICAgIGxldCByID0gdGhpcy5jaGVjayh0aGlzLlJUX0FSUk9XKTtcbiAgICBsZXQgbCA9IHRoaXMuY2hlY2sodGhpcy5MVF9BUlJPVyk7XG4gICAgcmV0dXJuIHIgJiYgbCA/IDAgOiByID8gMSA6IGwgPyAgLTEgOiAwO1xuICB9XG5cbiAgZ2V0VmVydGljYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hlY2sodGhpcy5VUF9BUlJPVykgfHwgdGhpcy5jaGVjayh0aGlzLlNQQUNFKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IElucHV0OyIsImNvbnN0IFBsYXRmb3JtID0gcmVxdWlyZSgnLi9wbGF0Zm9ybScpO1xuY29uc3QgQ29pbiA9IHJlcXVpcmUoJy4vY29pbicpO1xuY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5jbGFzcyBMZXZlbCB7XG4gIGNvbnN0cnVjdG9yKHN0YWdlUHJvcHMpIHtcbiAgICB0aGlzLnBsYXRmb3JtcyA9IFtdO1xuICAgIHRoaXMuY29pbnMgPSBbXTtcblxuICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IFBsYXRmb3JtKDAsIDAsIDEwLCBzdGFnZVByb3BzLmhlaWdodCkpO1xuICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IFBsYXRmb3JtKDAsIHN0YWdlUHJvcHMuaGVpZ2h0LTIsIHN0YWdlUHJvcHMud2lkdGgsIDUwKSk7XG4gICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgUGxhdGZvcm0oc3RhZ2VQcm9wcy53aWR0aCAtIDEwLCAwLCA1MCwgc3RhZ2VQcm9wcy5oZWlnaHQpKTtcbiAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBQbGF0Zm9ybShzdGFnZVByb3BzLndpZHRoLzIgLSAxMDAsIHN0YWdlUHJvcHMuaGVpZ2h0IC0gMTAwLCAyMDAsIDEzKSk7XG5cbiAgICB0aGlzLmNvaW5zLnB1c2gobmV3IENvaW4oc3RhZ2VQcm9wcy53aWR0aC8yIC0gMjAsIHN0YWdlUHJvcHMuaGVpZ2h0IC0gNjApKTtcbiAgfVxuXG4gIGNvbGxpZGUocGxheWVyKSB7XG4gICAgcGxheWVyLmdyb3VuZGVkID0gZmFsc2U7XG4gICAgdGhpcy5wbGF0Zm9ybXMuZm9yRWFjaCgocGxhdGZvcm0pID0+IHtcbiAgICAgIHZhciBjb2xsaXNpb25JbmZvID0gdXRpbC5jb2xsaWRlKHBsYXllciwgcGxhdGZvcm0pO1xuICAgICAgaWYgKGNvbGxpc2lvbkluZm8pIHtcbiAgICAgICAgc3dpdGNoKGNvbGxpc2lvbkluZm8uZGlyZWN0aW9uKSB7XG4gICAgICAgICAgY2FzZSAndCc6IFxuICAgICAgICAgICAgcGxheWVyLnkgKz0gY29sbGlzaW9uSW5mby5vdmVybGFwLm9ZOyBicmVhaztcbiAgICAgICAgICBjYXNlICdiJzpcbiAgICAgICAgICAgIHBsYXllci55IC09IGNvbGxpc2lvbkluZm8ub3ZlcmxhcC5vWTsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbCc6XG4gICAgICAgICAgICBwbGF5ZXIueCArPSBjb2xsaXNpb25JbmZvLm92ZXJsYXAub1g7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ3InOlxuICAgICAgICAgICAgcGxheWVyLnggLT0gY29sbGlzaW9uSW5mby5vdmVybGFwLm9YOyBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb2xsaXNpb25JbmZvLmRpcmVjdGlvbiA9PSAnbCcgfHwgY29sbGlzaW9uSW5mby5kaXJlY3Rpb24gPT0gJ3InKSB7XG4gICAgICAgICAgcGxheWVyLnZlbFggPSAwOyBwbGF5ZXIuanVtcGluZyA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbGxpc2lvbkluZm8uZGlyZWN0aW9uID09ICdiJykge1xuICAgICAgICAgIHBsYXllci5ncm91bmRlZCA9IHRydWU7IHBsYXllci5qdW1waW5nID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoY29sbGlzaW9uSW5mby5kaXJlY3Rpb24gPT0gJ3QnKSB7XG4gICAgICAgICAgcGxheWVyLnZlbFkgPSAwO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmNvaW5zLmZvckVhY2goKGNvaW4pID0+IHtcbiAgICAgIGlmIChjb2luLmNvbGxlY3RlZCkgcmV0dXJuO1xuXG4gICAgICB2YXIgY29sbGlzaW9uSW5mbyA9IHV0aWwuY29sbGlkZShwbGF5ZXIsIGNvaW4pO1xuICAgICAgaWYgKGNvbGxpc2lvbkluZm8pIHtcbiAgICAgICAgY29pbi5jb2xsZWN0ZWQgPSB0cnVlO1xuICAgICAgICBwbGF5ZXIuc2NvcmUrKztcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGRyYXcoY3R4KSB7XG4gICAgdGhpcy5wbGF0Zm9ybXMuZm9yRWFjaCgocCkgPT4ge1xuICAgICAgcC5kcmF3KGN0eCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmNvaW5zLmZvckVhY2goKGNvaW4pID0+IHtcbiAgICAgIGNvaW4uZHJhdyhjdHgpO1xuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGV2ZWw7IiwiY2xhc3MgUGxhdGZvcm0ge1xuICAgIGNvbnN0cnVjdG9yKHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB9XG5cbiAgICBkcmF3KGN0eCkge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGN0eC5yZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICBjdHguZmlsbCgpO1xuICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGxhdGZvcm07IiwiY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5jbGFzcyBQbGF5ZXIge1xuICBjb25zdHJ1Y3RvcihzdGFnZVByb3BzKSB7XG4gICAgY29uc29sZS5sb2coJ0hlbGxvLCBQbGF5ZXInKTtcbiAgICBcbiAgICB0aGlzLndpZHRoID0gdGhpcy5oZWlnaHQgPSAyMDtcbiAgICB0aGlzLnggPSBzdGFnZVByb3BzLndpZHRoLzI7XG4gICAgdGhpcy55ID0gc3RhZ2VQcm9wcy5oZWlnaHQvMiAtIHRoaXMuaGVpZ2h0O1xuICAgIHRoaXMuc3BlZWQgPSA2O1xuICAgIHRoaXMudmVsWCA9IDA7XG4gICAgdGhpcy52ZWxZID0gMDtcbiAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmdyb3VuZGVkID0gZmFsc2U7XG4gICAgdGhpcy5zdGFnZVByb3BzID0gc3RhZ2VQcm9wcztcbiAgICB0aGlzLnNjb3JlID0gMDtcbiAgfVxuXG4gIG1vdmUoaG9yaXpvbnRhbCwgdmVydGljYWwpIHtcbiAgICBob3Jpem9udGFsID0gdXRpbC5ub3JtYWxpemUoaG9yaXpvbnRhbCk7XG4gICAgdGhpcy52ZWxYICs9IGhvcml6b250YWw7XG4gICAgdGhpcy52ZWxYID0gdXRpbC5jbGFtcCh0aGlzLnZlbFgsIHRoaXMuc3BlZWQpO1xuICAgIHRoaXMudmVsWCAqPSB0aGlzLnN0YWdlUHJvcHMuZnJpY3Rpb247XG5cbiAgICBpZiAodmVydGljYWwpIHtcbiAgICAgIGlmICghdGhpcy5qdW1waW5nICYmIHRoaXMuZ3JvdW5kZWQpIHtcbiAgICAgICAgdGhpcy5qdW1waW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ncm91bmRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZlbFkgPSAtdGhpcy5zcGVlZCoyXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy52ZWxZICs9IHRoaXMuc3RhZ2VQcm9wcy5ncmF2aXR5O1xuXG4gICAgaWYgKHRoaXMuZ3JvdW5kZWQpIHRoaXMudmVsWSA9IDA7XG5cbiAgICB0aGlzLnggKz0gdGhpcy52ZWxYO1xuICAgIHRoaXMueSArPSB0aGlzLnZlbFk7XG5cbiAgICAvL2tlZXAgdGhlIHBsYXllciBvbiBzY3JlZW5cbiAgICAvL25vIGxvbmdlciBuZWVkZWQgaWYgdGhlIExldmVsIGhhcyB3YWxsIG9iamVjdHNcbiAgICAvL3RoaXMueCA9IHV0aWwuY2xhbXAodGhpcy54LCB0aGlzLnN0YWdlUHJvcHMud2lkdGggLSB0aGlzLndpZHRoLCAwKTtcbiAgICAvL3RoaXMueSA9IHV0aWwuY2xhbXAodGhpcy55LCB0aGlzLnN0YWdlUHJvcHMuaGVpZ2h0IC0gdGhpcy5oZWlnaHQsIDApO1xuXG4gICAgLy9pZiAodGhpcy55ID49IHRoaXMuc3RhZ2VQcm9wcy5oZWlnaHQgLSB0aGlzLmhlaWdodCkgeyB0aGlzLmp1bXBpbmcgPSBmYWxzZTsgdGhpcy5ncm91bmRlZCA9IHRydWU7IH1cbiAgfVxuXG4gIGRyYXcoY3R4KSB7XG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmVkXCI7XG4gICAgY3R4LmZpbGxSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7IiwiY2xhc3MgVXRpbCB7XG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBub3JtYWxpemUoaSkge1xuICAgIHJldHVybiBpIDwgMCA/IC0xIDogaSA+IDAgPyAxIDogMDtcbiAgfVxuXG4gIGNsYW1wKGksIHYxLCB2Mikge1xuICAgIGlmICh0aGlzLm5vdCh2MikpIHYyID0gLXYxO1xuICAgIGxldCBtaW5WYWx1ZSA9IE1hdGgubWluKHYxLCB2Mik7XG4gICAgbGV0IG1heFZhbHVlID0gTWF0aC5tYXgodjEsIHYyKTtcbiAgICBpZiAoaSA8IG1pblZhbHVlKSByZXR1cm4gbWluVmFsdWU7XG4gICAgaWYgKGkgPiBtYXhWYWx1ZSkgcmV0dXJuIG1heFZhbHVlO1xuICAgIHJldHVybiBpO1xuICB9XG5cbiAgbm90KG8pe1xuICAgIHJldHVybiBvID09PSB1bmRlZmluZWQgfHwgbyA9PT0gbnVsbDtcbiAgfVxuXG4gIGNvbGxpZGUoYSwgYikge1xuICAgIGlmICghdGhpcy5vYmplY3RzSGF2ZUFsbFByb3BzKFthLGJdLCBbJ3gnLCAneScsICd3aWR0aCcsICdoZWlnaHQnXSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNoZWNrIGNvbGxpc2lvbnMgb24gcHJvdmlkZWQgb2JqZWN0cycpO1xuICAgIH1cblxuICAgIGxldCB2WCA9IChhLnggKyAoYS53aWR0aC8yKSkgLSAoYi54ICsgKGIud2lkdGgvMikpO1xuICAgIGxldCB2WSA9IChhLnkgKyAoYS5oZWlnaHQvMikpIC0gKGIueSArIChiLmhlaWdodC8yKSk7XG4gICAgbGV0IGhhbGZXID0gKGEud2lkdGgvMikgKyAoYi53aWR0aC8yKTtcbiAgICBsZXQgaGFsZkggPSAoYS5oZWlnaHQvMikgKyAoYi5oZWlnaHQvMik7XG4gICAgbGV0IGNvbGxJbmZvID0gbnVsbDtcblxuICAgIGlmIChNYXRoLmFicyh2WCkgPCBoYWxmVyAmJiBNYXRoLmFicyh2WSkgPCBoYWxmSCkge1xuICAgICAgbGV0IG9YID0gaGFsZlcgLSBNYXRoLmFicyh2WCk7XG4gICAgICBsZXQgb1kgPSBoYWxmSCAtIE1hdGguYWJzKHZZKTtcbiAgICAgIGNvbGxJbmZvID0ge307XG5cbiAgICAgIGlmIChvWCA+PSBvWSkge1xuICAgICAgICBjb2xsSW5mby5kaXJlY3Rpb24gPSB2WSA+IDAgPyAndCcgOiAnYic7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2xsSW5mby5kaXJlY3Rpb24gPSB2WCA+IDAgPyAnbCcgOiAncic7XG4gICAgICB9XG5cbiAgICAgIGNvbGxJbmZvLm92ZXJsYXAgPSB7IG9YLCBvWSB9O1xuICAgIH1cblxuICAgIHJldHVybiBjb2xsSW5mbztcbiAgfVxuXG4gIG9iamVjdHNIYXZlQWxsUHJvcHMob2JqcywgcHJvcHMpIHtcbiAgICBvYmpzLmZvckVhY2goKG9iaikgPT4ge1xuICAgICAgaWYgKCF0aGlzLm9iamVjdEhhc0FsbFByb3BzKG9iaiwgcHJvcHMpKSByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIG9iamVjdEhhc0FsbFByb3BzKG9iaiwgcHJvcHMpIHtcbiAgICBwcm9wcy5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICBpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSkgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVXRpbCgpOyIsImNvbnN0IFBsYXllciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9wbGF5ZXInKTtcbmNvbnN0IElucHV0ID0gcmVxdWlyZSgnLi9jbGFzc2VzL2lucHV0Jyk7XG5jb25zdCBMZXZlbCA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9sZXZlbCcpO1xuY29uc3QgSFVEID0gcmVxdWlyZSgnLi9jbGFzc2VzL2h1ZCcpO1xuXG5jbGFzcyBDVlMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zb2xlLmxvZyhcIkhlbGxvLCBDYW52YXNHYW1lXCIpO1xuICAgIFxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNcIik7XG4gICAgdGhpcy5jdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB0aGlzLnN0YWdlUHJvcHMgPSB7XG4gICAgICB3aWR0aDoxOTIwLFxuICAgICAgaGVpZ2h0OjEwODAsXG4gICAgICBmcmljdGlvbjowLjgsXG4gICAgICBncmF2aXR5OjAuNlxuICAgIH07XG5cbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuc3RhZ2VQcm9wcy53aWR0aDtcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLnN0YWdlUHJvcHMuaGVpZ2h0O1xuXG4gICAgdGhpcy5wbGF5ZXIgPSBuZXcgUGxheWVyKHRoaXMuc3RhZ2VQcm9wcyk7XG4gICAgdGhpcy5pbnB1dCA9IG5ldyBJbnB1dChkb2N1bWVudC5ib2R5KTtcbiAgICB0aGlzLmxldmVsID0gbmV3IExldmVsKHRoaXMuc3RhZ2VQcm9wcyk7XG4gICAgdGhpcy5odWQgPSBuZXcgSFVEKHRoaXMucGxheWVyKTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCAoKSA9PiB7IHRoaXMudXBkYXRlKCk7IH0gKTtcbiAgfVxuXG4gIHVwZGF0ZSgpIHtcbiAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5zdGFnZVByb3BzLndpZHRoLCB0aGlzLnN0YWdlUHJvcHMuaGVpZ2h0KTtcbiAgICBcbiAgICAvL3BsYXllclxuICAgIHRoaXMucGxheWVyLm1vdmUodGhpcy5pbnB1dC5nZXRIb3Jpem9udGFsKCksIHRoaXMuaW5wdXQuZ2V0VmVydGljYWwoKSk7XG5cbiAgICAvL2NoZWNrIGNvbGxpc2lvbnNcbiAgICB0aGlzLmxldmVsLmNvbGxpZGUodGhpcy5wbGF5ZXIpO1xuXG4gICAgLy9kcmF3XG4gICAgdGhpcy5wbGF5ZXIuZHJhdyh0aGlzLmN0eCk7XG4gICAgdGhpcy5sZXZlbC5kcmF3KHRoaXMuY3R4KTtcbiAgICB0aGlzLmh1ZC5kcmF3KHRoaXMuY3R4KTtcblxuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHsgdGhpcy51cGRhdGUoKTsgfSk7XG4gIH1cbn1cblxuKGZ1bmN0aW9uKCl7XG4gIGxldCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZTtcblxuICBsZXQgY3ZzID0gbmV3IENWUygpO1xufSkoKVxuXG4iXX0=
