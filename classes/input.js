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