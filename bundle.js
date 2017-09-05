(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
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
},{"./platform":3,"./util":5}],3:[function(require,module,exports){
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
    } 
}

module.exports = Platform;
},{}],4:[function(require,module,exports){
const util = require('./util');

class Player {
  constructor(stageProps) {
    console.log('Hello, Player');
    
    this.width = this.height = 5;
    this.x = stageProps.width/2;
    this.y = stageProps.height/2 - this.height;
    this.speed = 3;
    this.velX = 0;
    this.velY = 0;
    this.jumping = false;
    this.grounded = false;
    this.stageProps = stageProps;
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
},{"./util":5}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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


},{"./classes/input":1,"./classes/level":2,"./classes/player":4}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4xMS4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsYXNzZXMvaW5wdXQuanMiLCJjbGFzc2VzL2xldmVsLmpzIiwiY2xhc3Nlcy9wbGF0Zm9ybS5qcyIsImNsYXNzZXMvcGxheWVyLmpzIiwiY2xhc3Nlcy91dGlsLmpzIiwibWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNsYXNzIElucHV0IHtcbiAgY29uc3RydWN0b3IoZG9jQm9keSkge1xuICAgIHRoaXMuVVBfQVJST1cgPSAzODsgdGhpcy5SVF9BUlJPVyA9IDM5OyB0aGlzLkxUX0FSUk9XID0gMzc7IHRoaXMuRE5fQVJST1cgPSA0MDsgdGhpcy5TUEFDRSA9IDMyO1xuICAgIFxuICAgIHRoaXMua2V5cyA9IFtdO1xuICBcbiAgICBkb2NCb2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgdGhpcy5rZXlzW2Uua2V5Q29kZV0gPSB0cnVlO1xuICAgIH0pO1xuICBcbiAgICBkb2NCb2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcbiAgICAgIHRoaXMua2V5c1tlLmtleUNvZGVdID0gZmFsc2U7XG4gICAgfSk7XG4gIH1cblxuICBjaGVjayhrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5rZXlzW2tleV07XG4gIH1cblxuICBnZXRIb3Jpem9udGFsKCkge1xuICAgIGxldCByID0gdGhpcy5jaGVjayh0aGlzLlJUX0FSUk9XKTtcbiAgICBsZXQgbCA9IHRoaXMuY2hlY2sodGhpcy5MVF9BUlJPVyk7XG4gICAgcmV0dXJuIHIgJiYgbCA/IDAgOiByID8gMSA6IGwgPyAgLTEgOiAwO1xuICB9XG5cbiAgZ2V0VmVydGljYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hlY2sodGhpcy5VUF9BUlJPVykgfHwgdGhpcy5jaGVjayh0aGlzLlNQQUNFKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IElucHV0OyIsImNvbnN0IFBsYXRmb3JtID0gcmVxdWlyZSgnLi9wbGF0Zm9ybScpO1xuY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5jbGFzcyBMZXZlbCB7XG4gIGNvbnN0cnVjdG9yKHN0YWdlUHJvcHMpIHtcbiAgICB0aGlzLnBsYXRmb3JtcyA9IFtdO1xuXG4gICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgUGxhdGZvcm0oMCwgMCwgMTAsIHN0YWdlUHJvcHMuaGVpZ2h0KSk7XG4gICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgUGxhdGZvcm0oMCwgc3RhZ2VQcm9wcy5oZWlnaHQtMiwgc3RhZ2VQcm9wcy53aWR0aCwgNTApKTtcbiAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBQbGF0Zm9ybShzdGFnZVByb3BzLndpZHRoIC0gMTAsIDAsIDUwLCBzdGFnZVByb3BzLmhlaWdodCkpO1xuICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IFBsYXRmb3JtKHN0YWdlUHJvcHMud2lkdGgvMiAtIDEwMCwgc3RhZ2VQcm9wcy5oZWlnaHQgLSA2MCwgMjAwLCAxMCkpO1xuICB9XG5cbiAgY29sbGlkZShwbGF5ZXIpIHtcbiAgICBwbGF5ZXIuZ3JvdW5kZWQgPSBmYWxzZTtcbiAgICB0aGlzLnBsYXRmb3Jtcy5mb3JFYWNoKChwbGF0Zm9ybSkgPT4ge1xuICAgICAgdmFyIGNvbGxpc2lvbkluZm8gPSB1dGlsLmNvbGxpZGUocGxheWVyLCBwbGF0Zm9ybSk7XG4gICAgICBpZiAoY29sbGlzaW9uSW5mbykge1xuICAgICAgICBzd2l0Y2goY29sbGlzaW9uSW5mby5kaXJlY3Rpb24pIHtcbiAgICAgICAgICBjYXNlICd0JzogXG4gICAgICAgICAgICBwbGF5ZXIueSArPSBjb2xsaXNpb25JbmZvLm92ZXJsYXAub1k7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2InOlxuICAgICAgICAgICAgcGxheWVyLnkgLT0gY29sbGlzaW9uSW5mby5vdmVybGFwLm9ZOyBicmVhaztcbiAgICAgICAgICBjYXNlICdsJzpcbiAgICAgICAgICAgIHBsYXllci54ICs9IGNvbGxpc2lvbkluZm8ub3ZlcmxhcC5vWDsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAncic6XG4gICAgICAgICAgICBwbGF5ZXIueCAtPSBjb2xsaXNpb25JbmZvLm92ZXJsYXAub1g7IGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbGxpc2lvbkluZm8uZGlyZWN0aW9uID09ICdsJyB8fCBjb2xsaXNpb25JbmZvLmRpcmVjdGlvbiA9PSAncicpIHtcbiAgICAgICAgICBwbGF5ZXIudmVsWCA9IDA7IHBsYXllci5qdW1waW5nID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSBpZiAoY29sbGlzaW9uSW5mby5kaXJlY3Rpb24gPT0gJ2InKSB7XG4gICAgICAgICAgcGxheWVyLmdyb3VuZGVkID0gdHJ1ZTsgcGxheWVyLmp1bXBpbmcgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2xsaXNpb25JbmZvLmRpcmVjdGlvbiA9PSAndCcpIHtcbiAgICAgICAgICBwbGF5ZXIudmVsWSA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGRyYXcoY3R4KSB7XG4gICAgdGhpcy5wbGF0Zm9ybXMuZm9yRWFjaCgocCkgPT4ge1xuICAgICAgcC5kcmF3KGN0eCk7XG4gICAgfSlcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExldmVsOyIsImNsYXNzIFBsYXRmb3JtIHtcbiAgICBjb25zdHJ1Y3Rvcih4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgfVxuXG4gICAgZHJhdyhjdHgpIHtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBcImJsYWNrXCI7XG4gICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICBjdHgucmVjdCh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgY3R4LmZpbGwoKTtcbiAgICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXRmb3JtOyIsImNvbnN0IHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuY2xhc3MgUGxheWVyIHtcbiAgY29uc3RydWN0b3Ioc3RhZ2VQcm9wcykge1xuICAgIGNvbnNvbGUubG9nKCdIZWxsbywgUGxheWVyJyk7XG4gICAgXG4gICAgdGhpcy53aWR0aCA9IHRoaXMuaGVpZ2h0ID0gNTtcbiAgICB0aGlzLnggPSBzdGFnZVByb3BzLndpZHRoLzI7XG4gICAgdGhpcy55ID0gc3RhZ2VQcm9wcy5oZWlnaHQvMiAtIHRoaXMuaGVpZ2h0O1xuICAgIHRoaXMuc3BlZWQgPSAzO1xuICAgIHRoaXMudmVsWCA9IDA7XG4gICAgdGhpcy52ZWxZID0gMDtcbiAgICB0aGlzLmp1bXBpbmcgPSBmYWxzZTtcbiAgICB0aGlzLmdyb3VuZGVkID0gZmFsc2U7XG4gICAgdGhpcy5zdGFnZVByb3BzID0gc3RhZ2VQcm9wcztcbiAgfVxuXG4gIG1vdmUoaG9yaXpvbnRhbCwgdmVydGljYWwpIHtcbiAgICBob3Jpem9udGFsID0gdXRpbC5ub3JtYWxpemUoaG9yaXpvbnRhbCk7XG4gICAgdGhpcy52ZWxYICs9IGhvcml6b250YWw7XG4gICAgdGhpcy52ZWxYID0gdXRpbC5jbGFtcCh0aGlzLnZlbFgsIHRoaXMuc3BlZWQpO1xuICAgIHRoaXMudmVsWCAqPSB0aGlzLnN0YWdlUHJvcHMuZnJpY3Rpb247XG5cbiAgICBpZiAodmVydGljYWwpIHtcbiAgICAgIGlmICghdGhpcy5qdW1waW5nICYmIHRoaXMuZ3JvdW5kZWQpIHtcbiAgICAgICAgdGhpcy5qdW1waW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5ncm91bmRlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLnZlbFkgPSAtdGhpcy5zcGVlZCoyXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy52ZWxZICs9IHRoaXMuc3RhZ2VQcm9wcy5ncmF2aXR5O1xuXG4gICAgaWYgKHRoaXMuZ3JvdW5kZWQpIHRoaXMudmVsWSA9IDA7XG5cbiAgICB0aGlzLnggKz0gdGhpcy52ZWxYO1xuICAgIHRoaXMueSArPSB0aGlzLnZlbFk7XG5cbiAgICAvL2tlZXAgdGhlIHBsYXllciBvbiBzY3JlZW5cbiAgICAvL25vIGxvbmdlciBuZWVkZWQgaWYgdGhlIExldmVsIGhhcyB3YWxsIG9iamVjdHNcbiAgICAvL3RoaXMueCA9IHV0aWwuY2xhbXAodGhpcy54LCB0aGlzLnN0YWdlUHJvcHMud2lkdGggLSB0aGlzLndpZHRoLCAwKTtcbiAgICAvL3RoaXMueSA9IHV0aWwuY2xhbXAodGhpcy55LCB0aGlzLnN0YWdlUHJvcHMuaGVpZ2h0IC0gdGhpcy5oZWlnaHQsIDApO1xuXG4gICAgLy9pZiAodGhpcy55ID49IHRoaXMuc3RhZ2VQcm9wcy5oZWlnaHQgLSB0aGlzLmhlaWdodCkgeyB0aGlzLmp1bXBpbmcgPSBmYWxzZTsgdGhpcy5ncm91bmRlZCA9IHRydWU7IH1cbiAgfVxuXG4gIGRyYXcoY3R4KSB7XG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmVkXCI7XG4gICAgY3R4LmZpbGxSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7IiwiY2xhc3MgVXRpbCB7XG4gIGNvbnN0cnVjdG9yKCkge31cblxuICBub3JtYWxpemUoaSkge1xuICAgIHJldHVybiBpIDwgMCA/IC0xIDogaSA+IDAgPyAxIDogMDtcbiAgfVxuXG4gIGNsYW1wKGksIHYxLCB2Mikge1xuICAgIGlmICh0aGlzLm5vdCh2MikpIHYyID0gLXYxO1xuICAgIGxldCBtaW5WYWx1ZSA9IE1hdGgubWluKHYxLCB2Mik7XG4gICAgbGV0IG1heFZhbHVlID0gTWF0aC5tYXgodjEsIHYyKTtcbiAgICBpZiAoaSA8IG1pblZhbHVlKSByZXR1cm4gbWluVmFsdWU7XG4gICAgaWYgKGkgPiBtYXhWYWx1ZSkgcmV0dXJuIG1heFZhbHVlO1xuICAgIHJldHVybiBpO1xuICB9XG5cbiAgbm90KG8pe1xuICAgIHJldHVybiBvID09PSB1bmRlZmluZWQgfHwgbyA9PT0gbnVsbDtcbiAgfVxuXG4gIGNvbGxpZGUoYSwgYikge1xuICAgIGlmICghdGhpcy5vYmplY3RzSGF2ZUFsbFByb3BzKFthLGJdLCBbJ3gnLCAneScsICd3aWR0aCcsICdoZWlnaHQnXSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGNoZWNrIGNvbGxpc2lvbnMgb24gcHJvdmlkZWQgb2JqZWN0cycpO1xuICAgIH1cblxuICAgIGxldCB2WCA9IChhLnggKyAoYS53aWR0aC8yKSkgLSAoYi54ICsgKGIud2lkdGgvMikpO1xuICAgIGxldCB2WSA9IChhLnkgKyAoYS5oZWlnaHQvMikpIC0gKGIueSArIChiLmhlaWdodC8yKSk7XG4gICAgbGV0IGhhbGZXID0gKGEud2lkdGgvMikgKyAoYi53aWR0aC8yKTtcbiAgICBsZXQgaGFsZkggPSAoYS5oZWlnaHQvMikgKyAoYi5oZWlnaHQvMik7XG4gICAgbGV0IGNvbGxJbmZvID0gbnVsbDtcblxuICAgIGlmIChNYXRoLmFicyh2WCkgPCBoYWxmVyAmJiBNYXRoLmFicyh2WSkgPCBoYWxmSCkge1xuICAgICAgbGV0IG9YID0gaGFsZlcgLSBNYXRoLmFicyh2WCk7XG4gICAgICBsZXQgb1kgPSBoYWxmSCAtIE1hdGguYWJzKHZZKTtcbiAgICAgIGNvbGxJbmZvID0ge307XG5cbiAgICAgIGlmIChvWCA+PSBvWSkge1xuICAgICAgICBjb2xsSW5mby5kaXJlY3Rpb24gPSB2WSA+IDAgPyAndCcgOiAnYic7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2xsSW5mby5kaXJlY3Rpb24gPSB2WCA+IDAgPyAnbCcgOiAncic7XG4gICAgICB9XG5cbiAgICAgIGNvbGxJbmZvLm92ZXJsYXAgPSB7IG9YLCBvWSB9O1xuICAgIH1cblxuICAgIHJldHVybiBjb2xsSW5mbztcbiAgfVxuXG4gIG9iamVjdHNIYXZlQWxsUHJvcHMob2JqcywgcHJvcHMpIHtcbiAgICBvYmpzLmZvckVhY2goKG9iaikgPT4ge1xuICAgICAgaWYgKCF0aGlzLm9iamVjdEhhc0FsbFByb3BzKG9iaiwgcHJvcHMpKSByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIG9iamVjdEhhc0FsbFByb3BzKG9iaiwgcHJvcHMpIHtcbiAgICBwcm9wcy5mb3JFYWNoKChwcm9wKSA9PiB7XG4gICAgICBpZiAoIW9iai5oYXNPd25Qcm9wZXJ0eShwcm9wKSkgcmV0dXJuIGZhbHNlO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgVXRpbCgpOyIsImNvbnN0IFBsYXllciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9wbGF5ZXInKTtcbmNvbnN0IElucHV0ID0gcmVxdWlyZSgnLi9jbGFzc2VzL2lucHV0Jyk7XG5jb25zdCBMZXZlbCA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9sZXZlbCcpO1xuXG5jbGFzcyBDVlMge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBjb25zb2xlLmxvZyhcIkhlbGxvLCBDYW52YXNHYW1lXCIpO1xuICAgIFxuICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNcIik7XG4gICAgdGhpcy5jdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB0aGlzLnN0YWdlUHJvcHMgPSB7XG4gICAgICB3aWR0aDo1MDAsXG4gICAgICBoZWlnaHQ6MjAwLFxuICAgICAgZnJpY3Rpb246MC44LFxuICAgICAgZ3Jhdml0eTowLjNcbiAgICB9O1xuXG4gICAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLnN0YWdlUHJvcHMud2lkdGg7XG4gICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gdGhpcy5zdGFnZVByb3BzLmhlaWdodDtcblxuICAgIHRoaXMucGxheWVyID0gbmV3IFBsYXllcih0aGlzLnN0YWdlUHJvcHMpO1xuICAgIHRoaXMuaW5wdXQgPSBuZXcgSW5wdXQoZG9jdW1lbnQuYm9keSk7XG4gICAgdGhpcy5sZXZlbCA9IG5ldyBMZXZlbCh0aGlzLnN0YWdlUHJvcHMpO1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsICgpID0+IHsgdGhpcy51cGRhdGUoKTsgfSApO1xuICB9XG5cbiAgdXBkYXRlKCkge1xuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLnN0YWdlUHJvcHMud2lkdGgsIHRoaXMuc3RhZ2VQcm9wcy5oZWlnaHQpO1xuICAgIFxuICAgIC8vcGxheWVyXG4gICAgdGhpcy5wbGF5ZXIubW92ZSh0aGlzLmlucHV0LmdldEhvcml6b250YWwoKSwgdGhpcy5pbnB1dC5nZXRWZXJ0aWNhbCgpKTtcblxuICAgIC8vY2hlY2sgY29sbGlzaW9uc1xuICAgIHRoaXMubGV2ZWwuY29sbGlkZSh0aGlzLnBsYXllcik7XG5cbiAgICAvL2RyYXdcbiAgICB0aGlzLnBsYXllci5kcmF3KHRoaXMuY3R4KTtcbiAgICB0aGlzLmxldmVsLmRyYXcodGhpcy5jdHgpO1xuXG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4geyB0aGlzLnVwZGF0ZSgpOyB9KTtcbiAgfVxufVxuXG4oZnVuY3Rpb24oKXtcbiAgbGV0IHJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZTtcblxuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG4gIGxldCBjdnMgPSBuZXcgQ1ZTKCk7XG59KSgpXG5cbiJdfQ==
