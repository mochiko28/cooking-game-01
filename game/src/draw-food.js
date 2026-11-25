// Renders individual ingredient art.
import { oval, panel, stroke } from './canvas-ink.js';

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
