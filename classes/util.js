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