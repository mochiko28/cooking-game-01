// Renders individual ingredient art.
import { oval, panel, stroke } from './canvas-ink.js';

function noodles(ctx) {
  oval(ctx, 0, 3, 29, 19, '#a85829');
  for (let i = 0; i < 6; i++) {
    const y = -16 + i * 6;
    ctx.beginPath();
    ctx.moveTo(-25, y + 5);
    ctx.bezierCurveTo(-18, y - 14, -9, y - 9, 0, y);
    ctx.bezierCurveTo(9, y + 9, 16, y + 6, 25, y - 2);
    ctx.strokeStyle = i % 2 ? '#fbd779' : '#edb35c';
    ctx.lineWidth = 4.7;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

function greens(ctx, chopped) {
  for (let i = 0; i < 5; i++) {
    ctx.save();
    ctx.translate(-22 + i * 11, i % 2 ? 6 : 0);
    ctx.rotate((i - 2) * .29);
    oval(ctx, 0, -4, chopped ? 8 : 9, chopped ? 12 : 20, i % 2 ? '#95b955' : '#549852', '#365f41', 2);
    stroke(ctx, '#d9db84', 2.1, [[0, 11], [0, -12]]);
    stroke(ctx, '#bad080', 1.5, [[0, 1], [-4, -5]]);
    ctx.restore();
  }
}

function egg(ctx, cooked) {
  if (cooked) {
    oval(ctx, 0, 0, 24, 17, '#fff0c7', '#c89357');
    oval(ctx, 3, 0, 10, 8, '#f5aa39', '#e98c2e');
    oval(ctx, 1, -3, 4, 2, '#ffdf7d');
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
    ctx.strokeStyle = '#f48b70';
    ctx.lineWidth = 9;
    ctx.stroke();
    for (const a of [.3, 1.15, 1.95]) {
      stroke(ctx, '#ffb895', 2, [[Math.cos(a) * 8, Math.sin(a) * 8], [Math.cos(a) * 15, Math.sin(a) * 15]]);
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
  stroke(ctx, '#fce1a0', 2, [[-10, -10], [-5, -12], [1, -12]]);
  stroke(ctx, '#da834f', 3, [[-12, 5], [-11, 11], [-6, 13]]);
}

const painters = { noodles, greens, egg, tofu, shrimp, shrooms, broth };

export function drawIngredient(ctx, id, x, y, scale = 1, stage = 'raw') {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  painters[id](ctx, stage !== 'raw');
  ctx.restore();
}
