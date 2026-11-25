// Provides shared canvas drawing primitives and the kitchen palette.
export const palette = {
  ink: '#172b29', night: '#102421', light: '#fff0d7', gold: '#ffd078',
  dull: '#a6bcb0', pale: '#fff0d5', scarlet: '#f28b72', mint: '#bce08a',
};

export function panel(ctx, x, y, w, h, r, color, outline, line = 2) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (color) {
    ctx.fillStyle = color;
    ctx.fill();
  }
  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = line;
    ctx.stroke();
  }
}

export function oval(ctx, x, y, rx, ry, color, outline, line = 2) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  if (color) {
    ctx.fillStyle = color;
    ctx.fill();
  }
  if (outline) {
    ctx.strokeStyle = outline;
    ctx.lineWidth = line;
    ctx.stroke();
  }
}

export function stroke(ctx, color, width, points) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (const point of points.slice(1)) ctx.lineTo(...point);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
}

export function label(ctx, text, x, y, size, color, options = {}) {
  const { align = 'left', weight = 800, face = 'system-ui' } = options;
  ctx.font = `${weight} ${size}px ${face}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

export function meter(ctx, x, y, w, h, progress, color, track) {
  panel(ctx, x, y, w, h, h / 2, track);
  if (progress > 0) panel(ctx, x, y, w * Math.min(1, progress), h, h / 2, color);
}
