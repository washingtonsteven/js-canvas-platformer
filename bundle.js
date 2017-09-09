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


},{"./classes/hud":2,"./classes/input":3,"./classes/level":4,"./classes/player":6}]},{},[8])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4xMS4xL2xpYi9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiY2xhc3Nlcy9jb2luLmpzIiwiY2xhc3Nlcy9odWQuanMiLCJjbGFzc2VzL2lucHV0LmpzIiwiY2xhc3Nlcy9sZXZlbC5qcyIsImNsYXNzZXMvcGxhdGZvcm0uanMiLCJjbGFzc2VzL3BsYXllci5qcyIsImNsYXNzZXMvdXRpbC5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY2xhc3MgQ29pbiB7XG4gIGNvbnN0cnVjdG9yKHgsIHkpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy53aWR0aCA9IHRoaXMuaGVpZ2h0ID0gMTA7XG4gICAgdGhpcy5jb2xsZWN0ZWQgPSBmYWxzZTtcbiAgfVxuXG4gIGRyYXcoY3R4KSB7XG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMuY29sbGVjdGVkID8gJyNjY2MnIDogJyNmZjAnO1xuICAgIGN0eC5zdHJva2VTdHlsZSA9ICdibGFjayc7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgIGN0eC5hcmModGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5zdHJva2UoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENvaW47IiwiY2xhc3MgSFVEIHtcbiAgY29uc3RydWN0b3IocGxheWVyKSB7XG4gICAgdGhpcy5wbGF5ZXIgPSBwbGF5ZXI7XG5cbiAgICB0aGlzLnggPSAxNTtcbiAgICB0aGlzLnkgPSA1O1xuICB9XG5cbiAgZHJhdyhjdHgpIHtcbiAgICBjdHguZmlsbFN0eWxlID0gJ2JsYWNrJztcbiAgICBjdHguZm9udCA9ICcyNXB4IHNhbnMtc2VyaWYnO1xuICAgIGN0eC50ZXh0QmFzZWxpbmUgPSAndG9wJ1xuICAgIGN0eC5maWxsVGV4dCgnU2NvcmU6ICcrdGhpcy5wbGF5ZXIuc2NvcmUsIHRoaXMueCwgdGhpcy55KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhVRDsiLCJjbGFzcyBJbnB1dCB7XG4gIGNvbnN0cnVjdG9yKGRvY0JvZHkpIHtcbiAgICB0aGlzLlVQX0FSUk9XID0gMzg7IHRoaXMuUlRfQVJST1cgPSAzOTsgdGhpcy5MVF9BUlJPVyA9IDM3OyB0aGlzLkROX0FSUk9XID0gNDA7IHRoaXMuU1BBQ0UgPSAzMjtcbiAgICBcbiAgICB0aGlzLmtleXMgPSBbXTtcbiAgXG4gICAgZG9jQm9keS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcbiAgICAgIHRoaXMua2V5c1tlLmtleUNvZGVdID0gdHJ1ZTtcbiAgICB9KTtcbiAgXG4gICAgZG9jQm9keS5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIChlKSA9PiB7XG4gICAgICB0aGlzLmtleXNbZS5rZXlDb2RlXSA9IGZhbHNlO1xuICAgIH0pO1xuICB9XG5cbiAgY2hlY2soa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMua2V5c1trZXldO1xuICB9XG5cbiAgZ2V0SG9yaXpvbnRhbCgpIHtcbiAgICBsZXQgciA9IHRoaXMuY2hlY2sodGhpcy5SVF9BUlJPVyk7XG4gICAgbGV0IGwgPSB0aGlzLmNoZWNrKHRoaXMuTFRfQVJST1cpO1xuICAgIHJldHVybiByICYmIGwgPyAwIDogciA/IDEgOiBsID8gIC0xIDogMDtcbiAgfVxuXG4gIGdldFZlcnRpY2FsKCkge1xuICAgIHJldHVybiB0aGlzLmNoZWNrKHRoaXMuVVBfQVJST1cpIHx8IHRoaXMuY2hlY2sodGhpcy5TUEFDRSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBJbnB1dDsiLCJjb25zdCBQbGF0Zm9ybSA9IHJlcXVpcmUoJy4vcGxhdGZvcm0nKTtcbmNvbnN0IENvaW4gPSByZXF1aXJlKCcuL2NvaW4nKTtcbmNvbnN0IHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuY2xhc3MgTGV2ZWwge1xuICBjb25zdHJ1Y3RvcihzdGFnZVByb3BzKSB7XG4gICAgdGhpcy5wbGF0Zm9ybXMgPSBbXTtcbiAgICB0aGlzLmNvaW5zID0gW107XG5cbiAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBQbGF0Zm9ybSgwLCAwLCAxMCwgc3RhZ2VQcm9wcy5oZWlnaHQpKTtcbiAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBQbGF0Zm9ybSgwLCBzdGFnZVByb3BzLmhlaWdodC0yLCBzdGFnZVByb3BzLndpZHRoLCA1MCkpO1xuICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IFBsYXRmb3JtKHN0YWdlUHJvcHMud2lkdGggLSAxMCwgMCwgNTAsIHN0YWdlUHJvcHMuaGVpZ2h0KSk7XG4gICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgUGxhdGZvcm0oc3RhZ2VQcm9wcy53aWR0aC8yIC0gMTAwLCBzdGFnZVByb3BzLmhlaWdodCAtIDEwMCwgMjAwLCAxMykpO1xuXG4gICAgdGhpcy5jb2lucy5wdXNoKG5ldyBDb2luKHN0YWdlUHJvcHMud2lkdGgvMiAtIDIwLCBzdGFnZVByb3BzLmhlaWdodCAtIDYwKSk7XG4gIH1cblxuICBjb2xsaWRlKHBsYXllcikge1xuICAgIHBsYXllci5ncm91bmRlZCA9IGZhbHNlO1xuICAgIHRoaXMucGxhdGZvcm1zLmZvckVhY2goKHBsYXRmb3JtKSA9PiB7XG4gICAgICB2YXIgY29sbGlzaW9uSW5mbyA9IHV0aWwuY29sbGlkZShwbGF5ZXIsIHBsYXRmb3JtKTtcbiAgICAgIGlmIChjb2xsaXNpb25JbmZvKSB7XG4gICAgICAgIHN3aXRjaChjb2xsaXNpb25JbmZvLmRpcmVjdGlvbikge1xuICAgICAgICAgIGNhc2UgJ3QnOiBcbiAgICAgICAgICAgIHBsYXllci55ICs9IGNvbGxpc2lvbkluZm8ub3ZlcmxhcC5vWTsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnYic6XG4gICAgICAgICAgICBwbGF5ZXIueSAtPSBjb2xsaXNpb25JbmZvLm92ZXJsYXAub1k7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2wnOlxuICAgICAgICAgICAgcGxheWVyLnggKz0gY29sbGlzaW9uSW5mby5vdmVybGFwLm9YOyBicmVhaztcbiAgICAgICAgICBjYXNlICdyJzpcbiAgICAgICAgICAgIHBsYXllci54IC09IGNvbGxpc2lvbkluZm8ub3ZlcmxhcC5vWDsgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29sbGlzaW9uSW5mby5kaXJlY3Rpb24gPT0gJ2wnIHx8IGNvbGxpc2lvbkluZm8uZGlyZWN0aW9uID09ICdyJykge1xuICAgICAgICAgIHBsYXllci52ZWxYID0gMDsgcGxheWVyLmp1bXBpbmcgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2xsaXNpb25JbmZvLmRpcmVjdGlvbiA9PSAnYicpIHtcbiAgICAgICAgICBwbGF5ZXIuZ3JvdW5kZWQgPSB0cnVlOyBwbGF5ZXIuanVtcGluZyA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbGxpc2lvbkluZm8uZGlyZWN0aW9uID09ICd0Jykge1xuICAgICAgICAgIHBsYXllci52ZWxZID0gMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5jb2lucy5mb3JFYWNoKChjb2luKSA9PiB7XG4gICAgICBpZiAoY29pbi5jb2xsZWN0ZWQpIHJldHVybjtcblxuICAgICAgdmFyIGNvbGxpc2lvbkluZm8gPSB1dGlsLmNvbGxpZGUocGxheWVyLCBjb2luKTtcbiAgICAgIGlmIChjb2xsaXNpb25JbmZvKSB7XG4gICAgICAgIGNvaW4uY29sbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgcGxheWVyLnNjb3JlKys7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBkcmF3KGN0eCkge1xuICAgIHRoaXMucGxhdGZvcm1zLmZvckVhY2goKHApID0+IHtcbiAgICAgIHAuZHJhdyhjdHgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5jb2lucy5mb3JFYWNoKChjb2luKSA9PiB7XG4gICAgICBjb2luLmRyYXcoY3R4KTtcbiAgICB9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExldmVsOyIsImNsYXNzIFBsYXRmb3JtIHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuXG4gICAgZHJhdyhjdHgpIHtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XG4gICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICBjdHgucmVjdCh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgY3R4LmZpbGwoKTtcbiAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXRmb3JtOyIsImNvbnN0IHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuY2xhc3MgUGxheWVyIHtcbiAgY29uc3RydWN0b3Ioc3RhZ2VQcm9wcykge1xuICAgIGNvbnNvbGUubG9nKCdIZWxsbywgUGxheWVyJyk7XG4gICAgXG4gICAgdGhpcy53aWR0aCA9IHRoaXMuaGVpZ2h0ID0gMjA7XG4gICAgdGhpcy54ID0gc3RhZ2VQcm9wcy53aWR0aC8yO1xuICAgIHRoaXMueSA9IHN0YWdlUHJvcHMuaGVpZ2h0LzIgLSB0aGlzLmhlaWdodDtcbiAgICB0aGlzLnNwZWVkID0gNjtcbiAgICB0aGlzLnZlbFggPSAwO1xuICAgIHRoaXMudmVsWSA9IDA7XG4gICAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG4gICAgdGhpcy5ncm91bmRlZCA9IGZhbHNlO1xuICAgIHRoaXMuc3RhZ2VQcm9wcyA9IHN0YWdlUHJvcHM7XG4gICAgdGhpcy5zY29yZSA9IDA7XG4gIH1cblxuICBtb3ZlKGhvcml6b250YWwsIHZlcnRpY2FsKSB7XG4gICAgaG9yaXpvbnRhbCA9IHV0aWwubm9ybWFsaXplKGhvcml6b250YWwpO1xuICAgIHRoaXMudmVsWCArPSBob3Jpem9udGFsO1xuICAgIHRoaXMudmVsWCA9IHV0aWwuY2xhbXAodGhpcy52ZWxYLCB0aGlzLnNwZWVkKTtcbiAgICB0aGlzLnZlbFggKj0gdGhpcy5zdGFnZVByb3BzLmZyaWN0aW9uO1xuXG4gICAgaWYgKHZlcnRpY2FsKSB7XG4gICAgICBpZiAoIXRoaXMuanVtcGluZyAmJiB0aGlzLmdyb3VuZGVkKSB7XG4gICAgICAgIHRoaXMuanVtcGluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuZ3JvdW5kZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy52ZWxZID0gLXRoaXMuc3BlZWQqMlxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudmVsWSArPSB0aGlzLnN0YWdlUHJvcHMuZ3Jhdml0eTtcblxuICAgIGlmICh0aGlzLmdyb3VuZGVkKSB0aGlzLnZlbFkgPSAwO1xuXG4gICAgdGhpcy54ICs9IHRoaXMudmVsWDtcbiAgICB0aGlzLnkgKz0gdGhpcy52ZWxZO1xuXG4gICAgLy9rZWVwIHRoZSBwbGF5ZXIgb24gc2NyZWVuXG4gICAgLy9ubyBsb25nZXIgbmVlZGVkIGlmIHRoZSBMZXZlbCBoYXMgd2FsbCBvYmplY3RzXG4gICAgLy90aGlzLnggPSB1dGlsLmNsYW1wKHRoaXMueCwgdGhpcy5zdGFnZVByb3BzLndpZHRoIC0gdGhpcy53aWR0aCwgMCk7XG4gICAgLy90aGlzLnkgPSB1dGlsLmNsYW1wKHRoaXMueSwgdGhpcy5zdGFnZVByb3BzLmhlaWdodCAtIHRoaXMuaGVpZ2h0LCAwKTtcblxuICAgIC8vaWYgKHRoaXMueSA+PSB0aGlzLnN0YWdlUHJvcHMuaGVpZ2h0IC0gdGhpcy5oZWlnaHQpIHsgdGhpcy5qdW1waW5nID0gZmFsc2U7IHRoaXMuZ3JvdW5kZWQgPSB0cnVlOyB9XG4gIH1cblxuICBkcmF3KGN0eCkge1xuICAgIGN0eC5maWxsU3R5bGUgPSBcInJlZFwiO1xuICAgIGN0eC5maWxsUmVjdCh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWVyOyIsImNsYXNzIFV0aWwge1xuICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgbm9ybWFsaXplKGkpIHtcbiAgICByZXR1cm4gaSA8IDAgPyAtMSA6IGkgPiAwID8gMSA6IDA7XG4gIH1cblxuICBjbGFtcChpLCB2MSwgdjIpIHtcbiAgICBpZiAodGhpcy5ub3QodjIpKSB2MiA9IC12MTtcbiAgICBsZXQgbWluVmFsdWUgPSBNYXRoLm1pbih2MSwgdjIpO1xuICAgIGxldCBtYXhWYWx1ZSA9IE1hdGgubWF4KHYxLCB2Mik7XG4gICAgaWYgKGkgPCBtaW5WYWx1ZSkgcmV0dXJuIG1pblZhbHVlO1xuICAgIGlmIChpID4gbWF4VmFsdWUpIHJldHVybiBtYXhWYWx1ZTtcbiAgICByZXR1cm4gaTtcbiAgfVxuXG4gIG5vdChvKXtcbiAgICByZXR1cm4gbyA9PT0gdW5kZWZpbmVkIHx8IG8gPT09IG51bGw7XG4gIH1cblxuICBjb2xsaWRlKGEsIGIpIHtcbiAgICBpZiAoIXRoaXMub2JqZWN0c0hhdmVBbGxQcm9wcyhbYSxiXSwgWyd4JywgJ3knLCAnd2lkdGgnLCAnaGVpZ2h0J10pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjaGVjayBjb2xsaXNpb25zIG9uIHByb3ZpZGVkIG9iamVjdHMnKTtcbiAgICB9XG5cbiAgICBsZXQgdlggPSAoYS54ICsgKGEud2lkdGgvMikpIC0gKGIueCArIChiLndpZHRoLzIpKTtcbiAgICBsZXQgdlkgPSAoYS55ICsgKGEuaGVpZ2h0LzIpKSAtIChiLnkgKyAoYi5oZWlnaHQvMikpO1xuICAgIGxldCBoYWxmVyA9IChhLndpZHRoLzIpICsgKGIud2lkdGgvMik7XG4gICAgbGV0IGhhbGZIID0gKGEuaGVpZ2h0LzIpICsgKGIuaGVpZ2h0LzIpO1xuICAgIGxldCBjb2xsSW5mbyA9IG51bGw7XG5cbiAgICBpZiAoTWF0aC5hYnModlgpIDwgaGFsZlcgJiYgTWF0aC5hYnModlkpIDwgaGFsZkgpIHtcbiAgICAgIGxldCBvWCA9IGhhbGZXIC0gTWF0aC5hYnModlgpO1xuICAgICAgbGV0IG9ZID0gaGFsZkggLSBNYXRoLmFicyh2WSk7XG4gICAgICBjb2xsSW5mbyA9IHt9O1xuXG4gICAgICBpZiAob1ggPj0gb1kpIHtcbiAgICAgICAgY29sbEluZm8uZGlyZWN0aW9uID0gdlkgPiAwID8gJ3QnIDogJ2InO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29sbEluZm8uZGlyZWN0aW9uID0gdlggPiAwID8gJ2wnIDogJ3InO1xuICAgICAgfVxuXG4gICAgICBjb2xsSW5mby5vdmVybGFwID0geyBvWCwgb1kgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gY29sbEluZm87XG4gIH1cblxuICBvYmplY3RzSGF2ZUFsbFByb3BzKG9ianMsIHByb3BzKSB7XG4gICAgZm9yIChsZXQgb2JqIG9mIG9ianMpIHtcbiAgICAgIGlmICghdGhpcy5vYmplY3RIYXNBbGxQcm9wcyhvYmosIHByb3BzKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgb2JqZWN0SGFzQWxsUHJvcHMob2JqLCBwcm9wcykge1xuICAgIGZvciAobGV0IHByb3Agb2YgcHJvcHMpIHtcbiAgICAgIGlmICghb2JqLmhhc093blByb3BlcnR5KHByb3ApKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVXRpbCgpO1xuIiwiY29uc3QgUGxheWVyID0gcmVxdWlyZSgnLi9jbGFzc2VzL3BsYXllcicpO1xuY29uc3QgSW5wdXQgPSByZXF1aXJlKCcuL2NsYXNzZXMvaW5wdXQnKTtcbmNvbnN0IExldmVsID0gcmVxdWlyZSgnLi9jbGFzc2VzL2xldmVsJyk7XG5jb25zdCBIVUQgPSByZXF1aXJlKCcuL2NsYXNzZXMvaHVkJyk7XG5cbmNsYXNzIENWUyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnNvbGUubG9nKFwiSGVsbG8sIENhbnZhc0dhbWVcIik7XG4gICAgXG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKTtcbiAgICB0aGlzLmN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHRoaXMuc3RhZ2VQcm9wcyA9IHtcbiAgICAgIHdpZHRoOjE5MjAsXG4gICAgICBoZWlnaHQ6MTA4MCxcbiAgICAgIGZyaWN0aW9uOjAuOCxcbiAgICAgIGdyYXZpdHk6MC42XG4gICAgfTtcblxuICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5zdGFnZVByb3BzLndpZHRoO1xuICAgIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuc3RhZ2VQcm9wcy5oZWlnaHQ7XG5cbiAgICB0aGlzLnBsYXllciA9IG5ldyBQbGF5ZXIodGhpcy5zdGFnZVByb3BzKTtcbiAgICB0aGlzLmlucHV0ID0gbmV3IElucHV0KGRvY3VtZW50LmJvZHkpO1xuICAgIHRoaXMubGV2ZWwgPSBuZXcgTGV2ZWwodGhpcy5zdGFnZVByb3BzKTtcbiAgICB0aGlzLmh1ZCA9IG5ldyBIVUQodGhpcy5wbGF5ZXIpO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsICgpID0+IHsgdGhpcy51cGRhdGUoKTsgfSApO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLnN0YWdlUHJvcHMud2lkdGgsIHRoaXMuc3RhZ2VQcm9wcy5oZWlnaHQpO1xuICAgIFxuICAgIC8vcGxheWVyXG4gICAgdGhpcy5wbGF5ZXIubW92ZSh0aGlzLmlucHV0LmdldEhvcml6b250YWwoKSwgdGhpcy5pbnB1dC5nZXRWZXJ0aWNhbCgpKTtcblxuICAgIC8vY2hlY2sgY29sbGlzaW9uc1xuICAgIHRoaXMubGV2ZWwuY29sbGlkZSh0aGlzLnBsYXllcik7XG5cbiAgICAvL2RyYXdcbiAgICB0aGlzLnBsYXllci5kcmF3KHRoaXMuY3R4KTtcbiAgICB0aGlzLmxldmVsLmRyYXcodGhpcy5jdHgpO1xuICAgIHRoaXMuaHVkLmRyYXcodGhpcy5jdHgpO1xuXG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4geyB0aGlzLnVwZGF0ZSgpOyB9KTtcbiAgfVxufVxuXG4oZnVuY3Rpb24oKXtcbiAgbGV0IHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZTtcblxuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG4gIGxldCBjdnMgPSBuZXcgQ1ZTKCk7XG59KSgpXG5cbiJdfQ==
