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