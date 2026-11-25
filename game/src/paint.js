// Shares canvas drawing tools and ingredient and dish artwork across views.

export function drawIngredient(ctx, id, x, y, scale = 1, stage = 'raw') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  painters[id](ctx, stage !== 'raw');
  ctx.restore();
}

function noodles(ctx) {
  oval(ctx, 0, 4, 28, 17, '#9a4b29');
  const strands = ctx.createLinearGradient(-10, -22, 11, 19);
  strands.addColorStop(0, '#fff1b1');
  strands.addColorStop(.43, '#ffd77f');
  strands.addColorStop(1, '#de9144');
  for (let i = 0; i < 8; i++) {
    const y = -15 + i * 4.2;
    const span = 24 + (3.5 - Math.abs(3.5 - i)) * 1.5;
    ctx.beginPath();
    ctx.moveTo(-span, y + 3);
    ctx.bezierCurveTo(-18, y - 10, -10, y - 9, 0, y);
    ctx.bezierCurveTo(9, y + 7, 16, y + 6, span, y - 2);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#a85c30';
    ctx.lineWidth = 5.4;
    ctx.stroke();
    ctx.strokeStyle = strands;
    ctx.lineWidth = 3.7;
    ctx.stroke();
  }
}

function greens(ctx, chopped) {
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.translate(-22 + i * 11, i % 2 ? 6 : 0);
    ctx.rotate((i - 2) * .33);
    const tip = chopped ? -15 : -24;
    const green = ctx.createLinearGradient(-8, tip, 8, 11);
    green.addColorStop(0, i % 2 ? '#bbd66e' : '#87c371');
    green.addColorStop(1, '#39774e');
    ctx.beginPath();
    ctx.moveTo(0, 12);
    ctx.bezierCurveTo(-13, 4, -11, tip + 4, -2, tip);
    ctx.bezierCurveTo(11, tip + 4, 13, 4, 0, 12);
    ctx.fillStyle = green;
    ctx.fill();
    ctx.strokeStyle = '#365e3f';
    ctx.lineWidth = 1.7;
    ctx.stroke();
    stroke(ctx, '#d4e695', 1.7, [[0, 11], [1, -2], [-1, tip + 5]]);
    for (const y of [4, -4, -11]) stroke(ctx, '#c8e190a0', 1, [[-5, y - 4], [1, y], [5, y - 4]]);
    ctx.restore();
  }
}

function egg(ctx, cooked) {
  if (cooked) {
    const white = ctx.createLinearGradient(-7, -17, 9, 17);
    white.addColorStop(0, '#fffbee');
    white.addColorStop(.61, '#ffedc7');
    white.addColorStop(1, '#dba164');
    oval(ctx, 0, 0, 24, 17, white, '#c89357');
    const yolk = ctx.createRadialGradient(0, -4, 1, 3, 0, 11);
    yolk.addColorStop(0, '#ffdc6c');
    yolk.addColorStop(.48, '#ffb52c');
    yolk.addColorStop(1, '#de7520');
    oval(ctx, 3, 0, 11, 9, yolk, '#ea9322');
    oval(ctx, 0, -4, 4.2, 1.8, '#fff5a7');
    oval(ctx, 5, -4, 1.3, 1, '#ffe78c');
    return;
  }
  for (const [x, y, angle] of [[-11, 1, -.34], [12, -3, .35]]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    oval(ctx, 0, 0, 12, 17, '#eab883', '#9e6551');
    oval(ctx, -3, -6, 5, 6, '#ffe2ac');
    ctx.restore();
  }
}

function tofu(ctx) {
  for (const [x, y] of [[-11, -8], [13, -2], [-12, 9], [7, 12]]) {
    panel(ctx, x - 9, y - 6, 21, 16, 3, '#b67b52', '#976144', 1.4);
    panel(ctx, x - 10, y - 9, 21, 15, 3, '#ffdfa5', '#c59165', 1.4);
    oval(ctx, x - 1, y - 3, 1.6, 1.2, '#d9a96b');
  }
}

function shrimp(ctx) {
  for (const [x, y, angle] of [[-11, -7, -.42], [11, 8, .14]]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.arc(0, 0, 12, -.45, Math.PI * 1.48);
    ctx.strokeStyle = '#944737';
    ctx.lineWidth = 13;
    ctx.lineCap = 'round';
    ctx.stroke();
    const shell = ctx.createLinearGradient(-17, -18, 13, 16);
    shell.addColorStop(0, '#ffc0a0');
    shell.addColorStop(.46, '#f6957a');
    shell.addColorStop(1, '#dd654f');
    ctx.strokeStyle = shell;
    ctx.lineWidth = 9;
    ctx.stroke();
    for (const a of [.18, .89, 1.6, 2.31, 3.02]) {
      stroke(ctx, '#a9483baf', 1.6, [[Math.cos(a) * 8, Math.sin(a) * 8], [Math.cos(a + .12) * 16, Math.sin(a + .12) * 16]]);
      oval(ctx, Math.cos(a + .24) * 12, Math.sin(a + .24) * 12, 1.7, 1.15, '#ffd8b3');
    }
    stroke(ctx, '#ef765a', 4, [[-1, -12], [6, -19], [8, -13]]);
    ctx.restore();
  }
}

function shrooms(ctx) {
  for (const [x, y, angle] of [[-13, 2, -.28], [13, -3, .4]]) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    panel(ctx, -4, -2, 8, 17, 3, '#f7dbac', '#986954', 1.7);
    ctx.beginPath();
    ctx.ellipse(0, -3, 15, 13, 0, Math.PI, 0);
    ctx.closePath();
    ctx.fillStyle = '#a97059';
    ctx.fill();
    ctx.strokeStyle = '#704b41';
    ctx.lineWidth = 2;
    ctx.stroke();
    oval(ctx, -5, -9, 3, 1.4, '#d1a786');
    oval(ctx, 4, -6, 2.4, 1.3, '#e1b691');
    ctx.restore();
  }
}

function broth(ctx) {
  panel(ctx, -20, -14, 40, 32, 10, '#9f492e', '#613a2c', 2.4);
  oval(ctx, 0, -10, 20, 10, '#f7d291', '#743b2a');
  oval(ctx, 0, -10, 15, 6, '#bc622f');
  oval(ctx, -4, -12, 7, 1.6, '#ffe3a3');
  stroke(ctx, '#da834f', 3, [[-12, 5], [-11, 11], [-6, 13]]);
}

const painters = { noodles, greens, egg, tofu, shrimp, shrooms, broth };

export function drawDish(ctx, layers, x, y, scale = 1, color = '#80bfa7', shape = 'bowl') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const depth = shape === 'bowl' ? 10 : 5;
  const soup = layers.includes('broth');
  oval(ctx, 1, 15, 55, 29, '#112b226b');
  const ceramic = ctx.createLinearGradient(-44, 0, 20, 42);
  ceramic.addColorStop(0, '#fff4d9');
  ceramic.addColorStop(.28, color);
  ceramic.addColorStop(1, '#32534b');
  oval(ctx, 0, depth, 53, 31, ceramic, '#283c33', 2.5);
  const rim = ctx.createLinearGradient(0, -28, 0, 29);
  rim.addColorStop(0, '#fff9e8');
  rim.addColorStop(.56, '#f3ddb4');
  rim.addColorStop(1, '#fff5d6');
  oval(ctx, 0, -1, 52, 29, rim, '#355a4d', 2.1);
  oval(ctx, 0, -1, 47, 25, null, color, 2);
  const fill = ctx.createLinearGradient(-17, -22, 13, 21);
  fill.addColorStop(0, soup ? '#8d371d' : '#baa47d');
  fill.addColorStop(.40, soup ? '#e08532' : '#f9e7c6');
  fill.addColorStop(1, soup ? '#ad511e' : '#dfbe93');
  oval(ctx, 0, -1, 43, 22, fill, soup ? '#8b4c2f' : '#c9ab80', 1.5);
  paintDishGlint(ctx, 0, -1, 50, 27, 3.42, 4.85, '#fffef2', 1.8);
  if (soup) {
    paintDishGlint(ctx, -1, -1, 38, 17, 2.66, 3.93, '#ffcf71', 2.1);
    paintDishGlint(ctx, 1, 0, 38, 17, .15, .92, '#f9af59', 1.7);
    oval(ctx, 24, -9, 10, 3, '#ffc57680');
    oval(ctx, 25, -10, 6, 1.3, '#ffe0a4');
    for (const [dx, dy, size] of [[-28, 8, 3], [28, -5, 4], [33, -2, 2], [-9, 13, 2], [15, -14, 2]]) {
      oval(ctx, dx, dy, size, size * .46, '#f3b360', '#b86030', .7);
    }
  }
  for (const id of layers) {
    if (id === 'broth') continue;
    const [px, py, size] = toppingPositions[id];
    const solo = layers.length === 1;
    drawIngredient(ctx, id, solo ? 0 : px, solo ? 0 : py, size, 'ready');
  }
  if (layers.length > 1) {
    for (const [dx, dy, angle] of [[-26, 8, .4], [25, 8, -.4], [18, 13, -.2], [-15, -13, -.4], [-4, -11, .7], [31, 2, .2]]) {
      ctx.save();
      ctx.translate(dx, dy);
      ctx.rotate(angle);
      oval(ctx, 0, 0, 3, 1.65, '#5b9b51', '#376442', .65);
      stroke(ctx, '#d4dc88', .7, [[-1.6, 0], [.2, -.5]]);
      ctx.restore();
    }
    for (const [dx, dy] of [[-13, 3], [4, -10], [10, 5], [-17, 9], [21, -5]]) oval(ctx, dx, dy, 1.4, .85, '#ffedb9');
  }
  ctx.restore();
}

const toppingPositions = {
  noodles: [-6, 0, 1.03], greens: [22, -10, .62], egg: [17, 9, .70],
  tofu: [-20, 7, .67], shrimp: [-15, -8, .67], shrooms: [13, -6, .68],
};

function paintDishGlint(ctx, x, y, rx, ry, begin, end, color, width) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, begin, end);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
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

export function meter(ctx, x, y, w, h, progress, color, track) {
  panel(ctx, x, y, w, h, h / 2, track);
  if (progress > 0) panel(ctx, x, y, w * Math.min(1, progress), h, h / 2, color);
}

export function drawWoodGrain(ctx, x, y, w, h) {
  for (let i = 0; i < 13; i++) {
    const top = y + 4 + i * (h - 11) / 13;
    const start = x + (i * 41) % 61;
    const end = x + w - (i * 17) % 48;
    ctx.beginPath();
    ctx.moveTo(start, top);
    ctx.bezierCurveTo(start + 29, top - 7, end - 50, top + 8, end, top + 2);
    ctx.strokeStyle = i % 2 ? '#80523439' : '#ffe4b358';
    ctx.lineWidth = i % 3 ? 1 : 1.6;
    ctx.stroke();
  }
  oval(ctx, x + w * .73, y + h * .71, 14, 4, null, '#8d57384d', 1);
}

export function drawKitchenSign(ctx, name, x, y, width, height, { size = 22, prep, prepSize = 11 } = {}) {
  const title = name.toUpperCase();
  ctx.font = `800 ${size}px system-ui`;
  const w = width ?? Math.ceil(ctx.measureText(title).width) + 24;
  panel(ctx, x, y, w, height, height / 2, '#222d27', '#ba9065', 1);
  label(ctx, title, x + w / 2, y + (prep ? 11 : height / 2), size, palette.light, { align: 'center' });
  if (prep) label(ctx, prep, x + w / 2, y + 27, prepSize, '#e8bf88', { align: 'center' });
}
