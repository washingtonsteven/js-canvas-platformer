(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function Input(docBody) {
  this.UP_ARROW = 38; this.RT_ARROW = 39; this.LT_ARROW = 37; this.DN_ARROW = 40; this.SPACE = 32;
  
  this.keys = [];

  docBody.addEventListener('keydown', (e) => {
    this.keys[e.keyCode] = true;
  });

  docBody.addEventListener('keyup', (e) => {
    this.keys[e.keyCode] = false;
  });
}

Input.prototype = {
  check:function(key) {
    return this.keys[key];
  },
  getHorizontal:function() {
    let r = this.check(this.RT_ARROW);
    let l = this.check(this.LT_ARROW);
    return r && l ? 0 : r ? 1 : l ?  -1 : 0;
  },
  getVertical:function() {
    return this.check(this.UP_ARROW) || this.check(this.SPACE);
  }
}

exports = module.exports = Input;
},{}],2:[function(require,module,exports){
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
},{"./util":3}],3:[function(require,module,exports){
let util = {
  normalize:function(i) {
    return i < 0 ? -1 : i > 0 ? 1 : 0;
  },
  clamp:function(i, v1, v2) {
    if (this.not(v2)) v2 = -v1;
    let minValue = Math.min(v1, v2);
    let maxValue = Math.max(v1, v2);
    if (i < minValue) return minValue;
    if (i > maxValue) return maxValue;
    return i;
  },
  not:function(o){
    return o === undefined || o === null;
  }
}

module.exports = util;
},{}],4:[function(require,module,exports){
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


},{"./classes/input":1,"./classes/player":2}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy5udm0vdmVyc2lvbnMvbm9kZS92Ni4xMS4xL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsYXNzZXMvaW5wdXQuanMiLCJjbGFzc2VzL3BsYXllci5qcyIsImNsYXNzZXMvdXRpbC5qcyIsIm1haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJmdW5jdGlvbiBJbnB1dChkb2NCb2R5KSB7XG4gIHRoaXMuVVBfQVJST1cgPSAzODsgdGhpcy5SVF9BUlJPVyA9IDM5OyB0aGlzLkxUX0FSUk9XID0gMzc7IHRoaXMuRE5fQVJST1cgPSA0MDsgdGhpcy5TUEFDRSA9IDMyO1xuICBcbiAgdGhpcy5rZXlzID0gW107XG5cbiAgZG9jQm9keS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgKGUpID0+IHtcbiAgICB0aGlzLmtleXNbZS5rZXlDb2RlXSA9IHRydWU7XG4gIH0pO1xuXG4gIGRvY0JvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoZSkgPT4ge1xuICAgIHRoaXMua2V5c1tlLmtleUNvZGVdID0gZmFsc2U7XG4gIH0pO1xufVxuXG5JbnB1dC5wcm90b3R5cGUgPSB7XG4gIGNoZWNrOmZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiB0aGlzLmtleXNba2V5XTtcbiAgfSxcbiAgZ2V0SG9yaXpvbnRhbDpmdW5jdGlvbigpIHtcbiAgICBsZXQgciA9IHRoaXMuY2hlY2sodGhpcy5SVF9BUlJPVyk7XG4gICAgbGV0IGwgPSB0aGlzLmNoZWNrKHRoaXMuTFRfQVJST1cpO1xuICAgIHJldHVybiByICYmIGwgPyAwIDogciA/IDEgOiBsID8gIC0xIDogMDtcbiAgfSxcbiAgZ2V0VmVydGljYWw6ZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuY2hlY2sodGhpcy5VUF9BUlJPVykgfHwgdGhpcy5jaGVjayh0aGlzLlNQQUNFKTtcbiAgfVxufVxuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBJbnB1dDsiLCJjb25zdCB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmZ1bmN0aW9uIFBsYXllcihzdGFnZVByb3BzKSB7XG4gIGNvbnNvbGUubG9nKCdIZWxsbywgUGxheWVyJyk7XG5cbiAgdGhpcy53aWR0aCA9IHRoaXMuaGVpZ2h0ID0gNTtcbiAgdGhpcy54ID0gc3RhZ2VQcm9wcy53aWR0aC8yO1xuICB0aGlzLnkgPSBzdGFnZVByb3BzLmhlaWdodCAtIHRoaXMuaGVpZ2h0O1xuICB0aGlzLnNwZWVkID0gMztcbiAgdGhpcy52ZWxYID0gMDtcbiAgdGhpcy52ZWxZID0gMDtcbiAgdGhpcy5qdW1waW5nID0gZmFsc2U7XG4gIHRoaXMuc3RhZ2VQcm9wcyA9IHN0YWdlUHJvcHM7XG59XG5cblBsYXllci5wcm90b3R5cGUgPSB7XG4gIG1vdmU6ZnVuY3Rpb24oaG9yaXpvbnRhbCwgdmVydGljYWwpe1xuICAgIGhvcml6b250YWwgPSB1dGlsLm5vcm1hbGl6ZShob3Jpem9udGFsKTtcbiAgICB0aGlzLnZlbFggKz0gaG9yaXpvbnRhbDtcbiAgICB0aGlzLnZlbFggPSB1dGlsLmNsYW1wKHRoaXMudmVsWCwgdGhpcy5zcGVlZCk7XG4gICAgdGhpcy52ZWxYICo9IHRoaXMuc3RhZ2VQcm9wcy5mcmljdGlvbjtcblxuICAgIGlmICh2ZXJ0aWNhbCkge1xuICAgICAgaWYgKCF0aGlzLmp1bXBpbmcpIHtcbiAgICAgICAgdGhpcy5qdW1waW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy52ZWxZID0gLXRoaXMuc3BlZWQqMlxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudmVsWSArPSB0aGlzLnN0YWdlUHJvcHMuZ3Jhdml0eTtcblxuICAgIHRoaXMueCArPSB0aGlzLnZlbFg7XG4gICAgdGhpcy55ICs9IHRoaXMudmVsWTtcblxuICAgIHRoaXMueCA9IHV0aWwuY2xhbXAodGhpcy54LCB0aGlzLnN0YWdlUHJvcHMud2lkdGggLSB0aGlzLndpZHRoLCAwKTtcbiAgICB0aGlzLnkgPSB1dGlsLmNsYW1wKHRoaXMueSwgdGhpcy5zdGFnZVByb3BzLmhlaWdodCAtIHRoaXMuaGVpZ2h0LCAwKTtcblxuICAgIGlmICh0aGlzLnkgPj0gdGhpcy5zdGFnZVByb3BzLmhlaWdodCAtIHRoaXMuaGVpZ2h0KSB7IHRoaXMuanVtcGluZyA9IGZhbHNlOyB9XG4gIH0sXG4gIGRyYXc6ZnVuY3Rpb24oY3R4KSB7XG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmVkXCI7XG4gICAgY3R4LmZpbGxSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gIH1cbn1cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gUGxheWVyOyIsImxldCB1dGlsID0ge1xuICBub3JtYWxpemU6ZnVuY3Rpb24oaSkge1xuICAgIHJldHVybiBpIDwgMCA/IC0xIDogaSA+IDAgPyAxIDogMDtcbiAgfSxcbiAgY2xhbXA6ZnVuY3Rpb24oaSwgdjEsIHYyKSB7XG4gICAgaWYgKHRoaXMubm90KHYyKSkgdjIgPSAtdjE7XG4gICAgbGV0IG1pblZhbHVlID0gTWF0aC5taW4odjEsIHYyKTtcbiAgICBsZXQgbWF4VmFsdWUgPSBNYXRoLm1heCh2MSwgdjIpO1xuICAgIGlmIChpIDwgbWluVmFsdWUpIHJldHVybiBtaW5WYWx1ZTtcbiAgICBpZiAoaSA+IG1heFZhbHVlKSByZXR1cm4gbWF4VmFsdWU7XG4gICAgcmV0dXJuIGk7XG4gIH0sXG4gIG5vdDpmdW5jdGlvbihvKXtcbiAgICByZXR1cm4gbyA9PT0gdW5kZWZpbmVkIHx8IG8gPT09IG51bGw7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsOyIsImNvbnN0IFBsYXllciA9IHJlcXVpcmUoJy4vY2xhc3Nlcy9wbGF5ZXInKTtcbmNvbnN0IElucHV0ID0gcmVxdWlyZSgnLi9jbGFzc2VzL2lucHV0Jyk7XG5cbmxldCBDVlMgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coXCJIZWxsbywgQ2FudmFzR2FtZVwiKTtcblxuICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzXCIpO1xuICB0aGlzLmN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICB0aGlzLnN0YWdlUHJvcHMgPSB7XG4gICAgd2lkdGg6NTAwLFxuICAgIGhlaWdodDoyMDAsXG4gICAgZnJpY3Rpb246MC44LFxuICAgIGdyYXZpdHk6MC4zXG4gIH07XG5cbiAgdGhpcy5jYW52YXMud2lkdGggPSB0aGlzLnN0YWdlUHJvcHMud2lkdGg7XG4gIHRoaXMuY2FudmFzLmhlaWdodCA9IHRoaXMuc3RhZ2VQcm9wcy5oZWlnaHQ7XG5cbiAgdGhpcy5wbGF5ZXIgPSBuZXcgUGxheWVyKHRoaXMuc3RhZ2VQcm9wcyk7XG4gIHRoaXMuaW5wdXQgPSBuZXcgSW5wdXQoZG9jdW1lbnQuYm9keSk7XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsICgpID0+IHsgdGhpcy51cGRhdGUoKTsgfSApO1xufTtcblxuQ1ZTLnByb3RvdHlwZSA9IHtcbiAgdXBkYXRlOmZ1bmN0aW9uKCkge1xuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLnN0YWdlUHJvcHMud2lkdGgsIHRoaXMuc3RhZ2VQcm9wcy5oZWlnaHQpO1xuXG4gICAgLy9wbGF5ZXJcbiAgICB0aGlzLnBsYXllci5tb3ZlKHRoaXMuaW5wdXQuZ2V0SG9yaXpvbnRhbCgpLCB0aGlzLmlucHV0LmdldFZlcnRpY2FsKCkpO1xuICAgIHRoaXMucGxheWVyLmRyYXcodGhpcy5jdHgpO1xuXG5cbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4geyB0aGlzLnVwZGF0ZSgpOyB9KTtcbiAgfVxufTtcblxuKGZ1bmN0aW9uKCl7XG4gIGxldCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93Lm1velJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubXNSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG5cbiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZTtcblxuICBsZXQgY3ZzID0gbmV3IENWUygpO1xufSkoKVxuXG4iXX0=
