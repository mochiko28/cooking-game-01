// Paints curling steam above simmering pans and hot dishes.
export function drawSteam(ctx, x, y, elapsed, burnt = false) {
  for (let i = 0; i < 4; i++) {
    const phase = (elapsed * .74 + i * .25) % 1;
    const left = x - 26 + 17 * i;
    const top = y - phase * 37;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(left, top + 12);
    ctx.bezierCurveTo(left - 13, top + 2, left + 14, top - 6, left + 6, top - 17);
    ctx.strokeStyle = burnt ? '#392d27' : '#fff6d1';
    ctx.lineCap = 'round';
    ctx.globalAlpha = (1 - phase) * .21;
    ctx.lineWidth = 7 - phase * 3;
    ctx.stroke();
    ctx.globalAlpha = (1 - phase) * .77;
    ctx.lineWidth = 3.4 - phase * 1.6;
    ctx.stroke();
    ctx.restore();
  }
}
