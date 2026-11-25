// Paints the kitchen shell, glazed floor tiles, and market stall trim.
import { oval, panel, stroke } from './draw-primitives.js';

export function drawRoom(ctx) {
  if (!kitchenBackdrop) {
    kitchenBackdrop = document.createElement('canvas');
    kitchenBackdrop.width = 1280;
    kitchenBackdrop.height = 800;
    paintRoom(kitchenBackdrop.getContext('2d'));
  }
  ctx.drawImage(kitchenBackdrop, 0, 0);
}

function paintRoom(ctx) {
  const wall = ctx.createLinearGradient(0, 0, 0, 265);
  wall.addColorStop(0, '#102822');
  wall.addColorStop(.75, '#16322a');
  wall.addColorStop(1, '#382b28');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, 1280, 800);
  panel(ctx, 20, 207, 1240, 545, 17, '#172c25', '#72553d', 3);
  panel(ctx, 30, 349, 1220, 392, 11, '#253e34', '#9a6d4c', 2);
  for (let row = 0; row < 7; row++) {
    for (let column = 0; column < 19; column++) {
      const x = 34 + column * 64;
      const y = 350 + row * 55;
      const glazes = ['#365b50', '#3a6053', '#426955', '#3b6457', '#3e6453'];
      const glaze = glazes[(row * 7 + column * 3 + row * column) % glazes.length];
      panel(ctx, x, y, 62, 53, 3, glaze);
      stroke(ctx, '#f2e2bc20', 1.5, [[x + 5, y + 6], [x + 56, y + 6]]);
      stroke(ctx, '#112d2562', 1.5, [[x + 4, y + 51], [x + 59, y + 51]]);
    }
  }

  for (const [x, y, width] of [[171, 510, 184], [477, 408, 211], [793, 493, 222], [1083, 435, 180]]) {
    drawLanternLight(ctx, x, y, width);
  }

  for (const x of [30, 1239]) {
    panel(ctx, x, 219, 11, 514, 3, '#916647');
    panel(ctx, x + 1, 219, 3, 514, 1, '#cd9a60');
    for (const y of [237, 353, 557, 728]) oval(ctx, x + 5, y, 4, 4, '#4b392d', '#dfaf6f', 1.5);
  }
  panel(ctx, 43, 211, 1194, 137, 6, '#49372c', '#8e6750', 1);
  for (const y of [218, 235, 249]) stroke(ctx, '#e4a76624', 1, [[47, y], [1232, y]]);
  drawLanternString(ctx);
  panel(ctx, 42, 345, 1196, 16, 3, '#213b32');
  panel(ctx, 42, 350, 1196, 6, 2, '#a27a4d');
  for (let x = 50; x < 1238; x += 27) stroke(ctx, '#cd9e644f', 2, [[x, 351], [x + 4, 355]]);
  for (const x of [63, 1217]) floorDrain(ctx, x, 543);
}

function drawLanternString(ctx) {
  ctx.beginPath();
  ctx.moveTo(396, 211);
  ctx.quadraticCurveTo(809, 235, 1237, 209);
  ctx.strokeStyle = '#dab383';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  for (const [x, y] of [[440, 228], [561, 234], [684, 237], [807, 238], [930, 235], [1054, 231], [1177, 225]]) {
    drawPaperLantern(ctx, x, y);
  }
}

function drawPaperLantern(ctx, x, y) {
  const halo = ctx.createRadialGradient(x, y, 6, x, y, 36);
  halo.addColorStop(0, '#ffb14caa');
  halo.addColorStop(1, '#ff9a3900');
  oval(ctx, x, y, 36, 27, halo);
  const paper = ctx.createRadialGradient(x - 2, y + 1, 1, x, y, 21);
  paper.addColorStop(0, '#ffde91');
  paper.addColorStop(.55, '#f78a49');
  paper.addColorStop(1, '#ac402e');
  stroke(ctx, '#dfb277', 1.5, [[x, y - 15], [x, y + 17]]);
  oval(ctx, x, y, 19, 10, paper, '#ffc47e', 1.3);
  oval(ctx, x, y, 10, 9.5, null, '#af503557', 1.4);
  stroke(ctx, '#ffe2a48a', 1.2, [[x - 15, y - 2], [x + 15, y - 2]]);
  panel(ctx, x - 7, y - 12, 14, 3, 1, '#63372a');
  panel(ctx, x - 6, y + 9, 12, 3, 1, '#783e2e');
}

function drawLanternLight(ctx, x, y, width) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, .58);
  const light = ctx.createRadialGradient(0, 0, 8, 0, 0, width);
  light.addColorStop(0, '#ffbb5966');
  light.addColorStop(.47, '#ffbc5340');
  light.addColorStop(1, '#ffb44b00');
  oval(ctx, 0, 0, width, width, light);
  ctx.restore();
}

function floorDrain(ctx, x, y) {
  panel(ctx, x - 11, y - 11, 22, 22, 4, '#263f38', '#5e8071');
  for (let offset = -6; offset <= 6; offset += 4) stroke(ctx, '#789386', 1.5, [[x + offset, y - 6], [x + offset, y + 6]]);
}

let kitchenBackdrop;
