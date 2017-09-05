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