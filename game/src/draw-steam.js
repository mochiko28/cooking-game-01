// Paints curling steam above simmering pans and hot dishes.
export function drawSteam(ctx, x, y, elapsed, burnt = false) {
  for (let i = 0; i < 4; i++) {
    const phase = (elapsed * .74 + i * .25) % 1;
    const left = x - 26 + 17 * i;
    const top = y - phase * 40;
    ctx.save();
    ctx.globalAlpha = (1 - phase) * .78;
    ctx.beginPath();
    ctx.moveTo(left, top + 12);
    ctx.bezierCurveTo(left - 13, top + 2, left + 14, top - 6, left + 6, top - 17);
    ctx.lineWidth = 3.2 - phase;
    ctx.strokeStyle = burnt ? '#392d27' : '#fff6d1';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }
}
