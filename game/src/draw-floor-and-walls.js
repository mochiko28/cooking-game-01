// Paints the kitchen shell, glazed floor tiles, and market stall trim.
import { oval, panel, stroke } from './canvas-ink.js';

let backdrop;

export function drawRoom(ctx) {
  if (!backdrop) {
    backdrop = document.createElement('canvas');
    backdrop.width = 1280;
    backdrop.height = 800;
    paintRoom(backdrop.getContext('2d'));
  }
  ctx.drawImage(backdrop, 0, 0);
}

function paintRoom(ctx) {
  ctx.fillStyle = '#112923';
  ctx.fillRect(0, 0, 1280, 800);
  panel(ctx, 20, 207, 1240, 545, 17, '#10251f', '#72553d', 3);
  panel(ctx, 30, 216, 1220, 525, 11, '#3c594b', '#9a6d4c', 2);
  for (let row = 0; row < 9; row++) {
    for (let column = 0; column < 19; column++) {
      const x = 34 + column * 64;
      const y = 222 + row * 57;
      const glazes = ['#3b6b5b', '#416f5d', '#4c7964', '#467260', '#426d58'];
      const glaze = glazes[(row * 7 + column * 3 + row * column) % glazes.length];
      panel(ctx, x, y, 62, 55, 3, glaze);
      stroke(ctx, '#f2e2bc20', 1.5, [[x + 5, y + 6], [x + 56, y + 6]]);
      stroke(ctx, '#112d2562', 1.5, [[x + 4, y + 53], [x + 59, y + 53]]);
    }
  }

  const light = ctx.createRadialGradient(595, 434, 45, 595, 434, 645);
  light.addColorStop(0, '#ffcf7d25');
  light.addColorStop(.65, '#ffcf7d04');
  light.addColorStop(1, '#092a2480');
  panel(ctx, 34, 222, 1214, 512, 8, light);

  for (const x of [30, 1239]) {
    panel(ctx, x, 219, 11, 514, 3, '#916647');
    panel(ctx, x + 1, 219, 3, 514, 1, '#cd9a60');
    for (const y of [237, 353, 557, 728]) oval(ctx, x + 5, y, 4, 4, '#4b392d', '#dfaf6f', 1.5);
  }
  panel(ctx, 42, 345, 1196, 16, 3, '#213b32');
  panel(ctx, 42, 350, 1196, 6, 2, '#a27a4d');
  for (let x = 50; x < 1238; x += 27) stroke(ctx, '#cd9e644f', 2, [[x, 351], [x + 4, 355]]);
  for (const x of [63, 1217]) floorDrain(ctx, x, 543);
}

function floorDrain(ctx, x, y) {
  panel(ctx, x - 11, y - 11, 22, 22, 4, '#263f38', '#5e8071');
  for (let offset = -6; offset <= 6; offset += 4) stroke(ctx, '#789386', 1.5, [[x + offset, y - 6], [x + offset, y + 6]]);
}
