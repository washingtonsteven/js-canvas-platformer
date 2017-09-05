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
    this.platforms.push(new Platform(stageProps.width/2 - 100, stageProps.height - 45, 200, 7));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4xMS4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsYXNzZXMvaW5wdXQuanMiLCJjbGFzc2VzL2xldmVsLmpzIiwiY2xhc3Nlcy9wbGF0Zm9ybS5qcyIsImNsYXNzZXMvcGxheWVyLmpzIiwiY2xhc3Nlcy91dGlsLmpzIiwibWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNsYXNzIElucHV0IHtcbiAgY29uc3RydWN0b3IoZG9jQm9keSkge1xuICAgIHRoaXMuVVBfQVJST1cgPSAzODsgdGhpcy5SVF9BUlJPVyA9IDM5OyB0aGlzLkxUX0FSUk9XID0gMzc7IHRoaXMuRE5fQVJST1cgPSA0MDsgdGhpcy5TUEFDRSA9IDMyO1xuICAgIFxuICAgIHRoaXMua2V5cyA9IFtdO1xuICBcbiAgICBkb2NCb2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoZSkgPT4ge1xuICAgICAgdGhpcy5rZXlzW2Uua2V5Q29kZV0gPSB0cnVlO1xuICAgIH0pO1xuICBcbiAgICBkb2NCb2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgKGUpID0+IHtcbiAgICAgIHRoaXMua2V5c1tlLmtleUNvZGVdID0gZmFsc2U7XG4gICAgfSk7XG4gIH1cblxuICBjaGVjayhrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5rZXlzW2tleV07XG4gIH1cblxuICBnZXRIb3Jpem9udGFsKCkge1xuICAgIGxldCByID0gdGhpcy5jaGVjayh0aGlzLlJUX0FSUk9XKTtcbiAgICBsZXQgbCA9IHRoaXMuY2hlY2sodGhpcy5MVF9BUlJPVyk7XG4gICAgcmV0dXJuIHIgJiYgbCA/IDAgOiByID8gMSA6IGwgPyAgLTEgOiAwO1xuICB9XG5cbiAgZ2V0VmVydGljYWwoKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hlY2sodGhpcy5VUF9BUlJPVykgfHwgdGhpcy5jaGVjayh0aGlzLlNQQUNFKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IElucHV0OyIsImNvbnN0IFBsYXRmb3JtID0gcmVxdWlyZSgnLi9wbGF0Zm9ybScpO1xuY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5jbGFzcyBMZXZlbCB7XG4gIGNvbnN0cnVjdG9yKHN0YWdlUHJvcHMpIHtcbiAgICB0aGlzLnBsYXRmb3JtcyA9IFtdO1xuXG4gICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgUGxhdGZvcm0oMCwgMCwgMTAsIHN0YWdlUHJvcHMuaGVpZ2h0KSk7XG4gICAgdGhpcy5wbGF0Zm9ybXMucHVzaChuZXcgUGxhdGZvcm0oMCwgc3RhZ2VQcm9wcy5oZWlnaHQtMiwgc3RhZ2VQcm9wcy53aWR0aCwgNTApKTtcbiAgICB0aGlzLnBsYXRmb3Jtcy5wdXNoKG5ldyBQbGF0Zm9ybShzdGFnZVByb3BzLndpZHRoIC0gMTAsIDAsIDUwLCBzdGFnZVByb3BzLmhlaWdodCkpO1xuICAgIHRoaXMucGxhdGZvcm1zLnB1c2gobmV3IFBsYXRmb3JtKHN0YWdlUHJvcHMud2lkdGgvMiAtIDEwMCwgc3RhZ2VQcm9wcy5oZWlnaHQgLSA0NSwgMjAwLCA3KSk7XG4gIH1cblxuICBjb2xsaWRlKHBsYXllcikge1xuICAgIHBsYXllci5ncm91bmRlZCA9IGZhbHNlO1xuICAgIHRoaXMucGxhdGZvcm1zLmZvckVhY2goKHBsYXRmb3JtKSA9PiB7XG4gICAgICB2YXIgY29sbGlzaW9uSW5mbyA9IHV0aWwuY29sbGlkZShwbGF5ZXIsIHBsYXRmb3JtKTtcbiAgICAgIGlmIChjb2xsaXNpb25JbmZvKSB7XG4gICAgICAgIHN3aXRjaChjb2xsaXNpb25JbmZvLmRpcmVjdGlvbikge1xuICAgICAgICAgIGNhc2UgJ3QnOiBcbiAgICAgICAgICAgIHBsYXllci55ICs9IGNvbGxpc2lvbkluZm8ub3ZlcmxhcC5vWTsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnYic6XG4gICAgICAgICAgICBwbGF5ZXIueSAtPSBjb2xsaXNpb25JbmZvLm92ZXJsYXAub1k7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2wnOlxuICAgICAgICAgICAgcGxheWVyLnggKz0gY29sbGlzaW9uSW5mby5vdmVybGFwLm9YOyBicmVhaztcbiAgICAgICAgICBjYXNlICdyJzpcbiAgICAgICAgICAgIHBsYXllci54IC09IGNvbGxpc2lvbkluZm8ub3ZlcmxhcC5vWDsgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29sbGlzaW9uSW5mby5kaXJlY3Rpb24gPT0gJ2wnIHx8IGNvbGxpc2lvbkluZm8uZGlyZWN0aW9uID09ICdyJykge1xuICAgICAgICAgIHBsYXllci52ZWxYID0gMDsgcGxheWVyLmp1bXBpbmcgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmIChjb2xsaXNpb25JbmZvLmRpcmVjdGlvbiA9PSAnYicpIHtcbiAgICAgICAgICBwbGF5ZXIuZ3JvdW5kZWQgPSB0cnVlOyBwbGF5ZXIuanVtcGluZyA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKGNvbGxpc2lvbkluZm8uZGlyZWN0aW9uID09ICd0Jykge1xuICAgICAgICAgIHBsYXllci52ZWxZID0gMDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZHJhdyhjdHgpIHtcbiAgICB0aGlzLnBsYXRmb3Jtcy5mb3JFYWNoKChwKSA9PiB7XG4gICAgICBwLmRyYXcoY3R4KTtcbiAgICB9KVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGV2ZWw7IiwiY2xhc3MgUGxhdGZvcm0ge1xuICAgIGNvbnN0cnVjdG9yKHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB9XG5cbiAgICBkcmF3KGN0eCkge1xuICAgICAgY3R4LmZpbGxTdHlsZSA9IFwiYmxhY2tcIjtcbiAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgIGN0eC5yZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICBjdHguZmlsbCgpO1xuICAgIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gUGxhdGZvcm07IiwiY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5jbGFzcyBQbGF5ZXIge1xuICBjb25zdHJ1Y3RvcihzdGFnZVByb3BzKSB7XG4gICAgY29uc29sZS5sb2coJ0hlbGxvLCBQbGF5ZXInKTtcbiAgICBcbiAgICB0aGlzLndpZHRoID0gdGhpcy5oZWlnaHQgPSA1O1xuICAgIHRoaXMueCA9IHN0YWdlUHJvcHMud2lkdGgvMjtcbiAgICB0aGlzLnkgPSBzdGFnZVByb3BzLmhlaWdodC8yIC0gdGhpcy5oZWlnaHQ7XG4gICAgdGhpcy5zcGVlZCA9IDM7XG4gICAgdGhpcy52ZWxYID0gMDtcbiAgICB0aGlzLnZlbFkgPSAwO1xuICAgIHRoaXMuanVtcGluZyA9IGZhbHNlO1xuICAgIHRoaXMuZ3JvdW5kZWQgPSBmYWxzZTtcbiAgICB0aGlzLnN0YWdlUHJvcHMgPSBzdGFnZVByb3BzO1xuICB9XG5cbiAgbW92ZShob3Jpem9udGFsLCB2ZXJ0aWNhbCkge1xuICAgIGhvcml6b250YWwgPSB1dGlsLm5vcm1hbGl6ZShob3Jpem9udGFsKTtcbiAgICB0aGlzLnZlbFggKz0gaG9yaXpvbnRhbDtcbiAgICB0aGlzLnZlbFggPSB1dGlsLmNsYW1wKHRoaXMudmVsWCwgdGhpcy5zcGVlZCk7XG4gICAgdGhpcy52ZWxYICo9IHRoaXMuc3RhZ2VQcm9wcy5mcmljdGlvbjtcblxuICAgIGlmICh2ZXJ0aWNhbCkge1xuICAgICAgaWYgKCF0aGlzLmp1bXBpbmcgJiYgdGhpcy5ncm91bmRlZCkge1xuICAgICAgICB0aGlzLmp1bXBpbmcgPSB0cnVlO1xuICAgICAgICB0aGlzLmdyb3VuZGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMudmVsWSA9IC10aGlzLnNwZWVkKjJcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnZlbFkgKz0gdGhpcy5zdGFnZVByb3BzLmdyYXZpdHk7XG5cbiAgICBpZiAodGhpcy5ncm91bmRlZCkgdGhpcy52ZWxZID0gMDtcblxuICAgIHRoaXMueCArPSB0aGlzLnZlbFg7XG4gICAgdGhpcy55ICs9IHRoaXMudmVsWTtcblxuICAgIC8va2VlcCB0aGUgcGxheWVyIG9uIHNjcmVlblxuICAgIC8vbm8gbG9uZ2VyIG5lZWRlZCBpZiB0aGUgTGV2ZWwgaGFzIHdhbGwgb2JqZWN0c1xuICAgIC8vdGhpcy54ID0gdXRpbC5jbGFtcCh0aGlzLngsIHRoaXMuc3RhZ2VQcm9wcy53aWR0aCAtIHRoaXMud2lkdGgsIDApO1xuICAgIC8vdGhpcy55ID0gdXRpbC5jbGFtcCh0aGlzLnksIHRoaXMuc3RhZ2VQcm9wcy5oZWlnaHQgLSB0aGlzLmhlaWdodCwgMCk7XG5cbiAgICAvL2lmICh0aGlzLnkgPj0gdGhpcy5zdGFnZVByb3BzLmhlaWdodCAtIHRoaXMuaGVpZ2h0KSB7IHRoaXMuanVtcGluZyA9IGZhbHNlOyB0aGlzLmdyb3VuZGVkID0gdHJ1ZTsgfVxuICB9XG5cbiAgZHJhdyhjdHgpIHtcbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZWRcIjtcbiAgICBjdHguZmlsbFJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjsiLCJjbGFzcyBVdGlsIHtcbiAgY29uc3RydWN0b3IoKSB7fVxuXG4gIG5vcm1hbGl6ZShpKSB7XG4gICAgcmV0dXJuIGkgPCAwID8gLTEgOiBpID4gMCA/IDEgOiAwO1xuICB9XG5cbiAgY2xhbXAoaSwgdjEsIHYyKSB7XG4gICAgaWYgKHRoaXMubm90KHYyKSkgdjIgPSAtdjE7XG4gICAgbGV0IG1pblZhbHVlID0gTWF0aC5taW4odjEsIHYyKTtcbiAgICBsZXQgbWF4VmFsdWUgPSBNYXRoLm1heCh2MSwgdjIpO1xuICAgIGlmIChpIDwgbWluVmFsdWUpIHJldHVybiBtaW5WYWx1ZTtcbiAgICBpZiAoaSA+IG1heFZhbHVlKSByZXR1cm4gbWF4VmFsdWU7XG4gICAgcmV0dXJuIGk7XG4gIH1cblxuICBub3Qobyl7XG4gICAgcmV0dXJuIG8gPT09IHVuZGVmaW5lZCB8fCBvID09PSBudWxsO1xuICB9XG5cbiAgY29sbGlkZShhLCBiKSB7XG4gICAgaWYgKCF0aGlzLm9iamVjdHNIYXZlQWxsUHJvcHMoW2EsYl0sIFsneCcsICd5JywgJ3dpZHRoJywgJ2hlaWdodCddKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgY2hlY2sgY29sbGlzaW9ucyBvbiBwcm92aWRlZCBvYmplY3RzJyk7XG4gICAgfVxuXG4gICAgbGV0IHZYID0gKGEueCArIChhLndpZHRoLzIpKSAtIChiLnggKyAoYi53aWR0aC8yKSk7XG4gICAgbGV0IHZZID0gKGEueSArIChhLmhlaWdodC8yKSkgLSAoYi55ICsgKGIuaGVpZ2h0LzIpKTtcbiAgICBsZXQgaGFsZlcgPSAoYS53aWR0aC8yKSArIChiLndpZHRoLzIpO1xuICAgIGxldCBoYWxmSCA9IChhLmhlaWdodC8yKSArIChiLmhlaWdodC8yKTtcbiAgICBsZXQgY29sbEluZm8gPSBudWxsO1xuXG4gICAgaWYgKE1hdGguYWJzKHZYKSA8IGhhbGZXICYmIE1hdGguYWJzKHZZKSA8IGhhbGZIKSB7XG4gICAgICBsZXQgb1ggPSBoYWxmVyAtIE1hdGguYWJzKHZYKTtcbiAgICAgIGxldCBvWSA9IGhhbGZIIC0gTWF0aC5hYnModlkpO1xuICAgICAgY29sbEluZm8gPSB7fTtcblxuICAgICAgaWYgKG9YID49IG9ZKSB7XG4gICAgICAgIGNvbGxJbmZvLmRpcmVjdGlvbiA9IHZZID4gMCA/ICd0JyA6ICdiJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbGxJbmZvLmRpcmVjdGlvbiA9IHZYID4gMCA/ICdsJyA6ICdyJztcbiAgICAgIH1cblxuICAgICAgY29sbEluZm8ub3ZlcmxhcCA9IHsgb1gsIG9ZIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbGxJbmZvO1xuICB9XG5cbiAgb2JqZWN0c0hhdmVBbGxQcm9wcyhvYmpzLCBwcm9wcykge1xuICAgIG9ianMuZm9yRWFjaCgob2JqKSA9PiB7XG4gICAgICBpZiAoIXRoaXMub2JqZWN0SGFzQWxsUHJvcHMob2JqLCBwcm9wcykpIHJldHVybiBmYWxzZTtcbiAgICB9KTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgb2JqZWN0SGFzQWxsUHJvcHMob2JqLCBwcm9wcykge1xuICAgIHByb3BzLmZvckVhY2goKHByb3ApID0+IHtcbiAgICAgIGlmICghb2JqLmhhc093blByb3BlcnR5KHByb3ApKSByZXR1cm4gZmFsc2U7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBVdGlsKCk7IiwiY29uc3QgUGxheWVyID0gcmVxdWlyZSgnLi9jbGFzc2VzL3BsYXllcicpO1xuY29uc3QgSW5wdXQgPSByZXF1aXJlKCcuL2NsYXNzZXMvaW5wdXQnKTtcbmNvbnN0IExldmVsID0gcmVxdWlyZSgnLi9jbGFzc2VzL2xldmVsJyk7XG5cbmNsYXNzIENWUyB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGNvbnNvbGUubG9nKFwiSGVsbG8sIENhbnZhc0dhbWVcIik7XG4gICAgXG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKTtcbiAgICB0aGlzLmN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHRoaXMuc3RhZ2VQcm9wcyA9IHtcbiAgICAgIHdpZHRoOjUwMCxcbiAgICAgIGhlaWdodDoyMDAsXG4gICAgICBmcmljdGlvbjowLjgsXG4gICAgICBncmF2aXR5OjAuM1xuICAgIH07XG5cbiAgICB0aGlzLmNhbnZhcy53aWR0aCA9IHRoaXMuc3RhZ2VQcm9wcy53aWR0aDtcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLnN0YWdlUHJvcHMuaGVpZ2h0O1xuXG4gICAgdGhpcy5wbGF5ZXIgPSBuZXcgUGxheWVyKHRoaXMuc3RhZ2VQcm9wcyk7XG4gICAgdGhpcy5pbnB1dCA9IG5ldyBJbnB1dChkb2N1bWVudC5ib2R5KTtcbiAgICB0aGlzLmxldmVsID0gbmV3IExldmVsKHRoaXMuc3RhZ2VQcm9wcyk7XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgKCkgPT4geyB0aGlzLnVwZGF0ZSgpOyB9ICk7XG4gIH1cblxuICB1cGRhdGUoKSB7XG4gICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMuc3RhZ2VQcm9wcy53aWR0aCwgdGhpcy5zdGFnZVByb3BzLmhlaWdodCk7XG4gICAgXG4gICAgLy9wbGF5ZXJcbiAgICB0aGlzLnBsYXllci5tb3ZlKHRoaXMuaW5wdXQuZ2V0SG9yaXpvbnRhbCgpLCB0aGlzLmlucHV0LmdldFZlcnRpY2FsKCkpO1xuXG4gICAgLy9jaGVjayBjb2xsaXNpb25zXG4gICAgdGhpcy5sZXZlbC5jb2xsaWRlKHRoaXMucGxheWVyKTtcblxuICAgIC8vZHJhd1xuICAgIHRoaXMucGxheWVyLmRyYXcodGhpcy5jdHgpO1xuICAgIHRoaXMubGV2ZWwuZHJhdyh0aGlzLmN0eCk7XG5cblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7IHRoaXMudXBkYXRlKCk7IH0pO1xuICB9XG59XG5cbihmdW5jdGlvbigpe1xuICBsZXQgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuXG4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSByZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbiAgbGV0IGN2cyA9IG5ldyBDVlMoKTtcbn0pKClcblxuIl19
