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