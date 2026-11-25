// Frames the last-call order rail and the two burners for the rush showcase.
import { label, meter, oval, panel, palette } from './draw-primitives.js';
import { drawBurner } from './draw-burners.js';
import { drawDish } from './draw-dish.js';
import { drawRoom } from './draw-floor-and-walls.js';
import { readShiftClock } from './shift-timer.js';
import { serviceWave, serviceWaves } from './service-waves.js';
import { simmerSeconds } from './cooking-stove.js';

export function drawRushView(ctx, state) {
  drawRoom(ctx);
  drawRushHeader(ctx, state.elapsed);
  drawRushRail(ctx, state.orders);
  panel(ctx, 26, 339, 1228, 434, 14, '#b68051', '#f8c385', 3);
  drawRushBurner(ctx, state, 0, 44, 735);
  drawRushBurner(ctx, state, 1, 797, 438);
}

function drawRushHeader(ctx, elapsed) {
  const wave = serviceWave(elapsed);
  panel(ctx, 26, 20, 659, 117, 12, '#a73428', '#ff9365', 4);
  label(ctx, wave.name.toUpperCase(), 355, 78, 95, '#fff0d5', { align: 'center', weight: 950 });

  panel(ctx, 700, 20, 281, 117, 12, '#382d25', '#b87551', 3);
  label(ctx, 'RUSH MAX', 840, 51, 34, '#ffdda8', { align: 'center' });
  const intensity = (serviceWaves.indexOf(wave) + 1) / serviceWaves.length;
  for (let i = 0; i < 6; i++) {
    const height = 17 + i * 6;
    panel(ctx, 725 + i * 40, 113 - height, 30, height, 4, i / 6 < intensity ? '#ff9a61' : '#614138');
  }

  panel(ctx, 996, 20, 258, 117, 12, '#531e1a', '#ff9365', 4);
  label(ctx, 'TIME LEFT', 1125, 43, 24, '#ffdda8', { align: 'center' });
  label(ctx, readShiftClock(elapsed), 1125, 92, 73, '#ff9b59', { align: 'center', face: 'monospace' });
}

function drawRushRail(ctx, orders) {
  panel(ctx, 26, 148, 1228, 179, 11, '#1e342a', '#9a7455', 2);
  label(ctx, 'ORDER BOARD', 39, 169, 23, palette.light);
  label(ctx, `${orders.length} WAITING`, 1240, 169, 23, '#ffd098', { align: 'right' });
  orders.forEach((ticket, i) => {
    const x = 37 + i * 202;
    const progress = ticket.left / ticket.patience;
    const urgent = progress <= .34;
    panel(ctx, x, 186, 195, 130, 8, '#ffebcb', urgent ? '#ff7959' : '#af9469', urgent ? 4 : 2);
    panel(ctx, x + 6, 192, 183, 68, 5, ticket.recipe.color);
    drawDish(ctx, ticket.recipe.layers, x + 97, 220, .97, ticket.recipe.color, ticket.recipe.shape);
    label(ctx, ticket.recipe.name, x + 97, 275, 25, palette.ink, { align: 'center' });
    meter(ctx, x + 9, 292, 177, 16, progress, urgent ? '#ff5d43' : '#66aa6a', urgent ? '#81312a' : '#b7bf8b');
  });
}

function drawRushBurner(ctx, state, index, x, width) {
  const cx = x + width / 2;
  const burning = index === 0;
  const pot = state.pots[index];
  panel(ctx, x, 355, width, 401, 11, burning ? '#4e2a25' : '#29473b', burning ? '#e46c50' : '#7b9473', 4);
  panel(ctx, x + 9, 363, width - 18, 63, 8, burning ? '#a73428' : '#3e6650');
  label(ctx, burning ? 'POT BURNING' : 'SIMMERING', cx, 395, 49, '#fff0d5', { align: 'center' });

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 10, 430, width - 20, 265);
  ctx.clip();
  if (burning) {
    const glow = ctx.createRadialGradient(cx, 588, 40, cx, 588, 230);
    glow.addColorStop(0, '#f3a45b');
    glow.addColorStop(1, '#4e2a2500');
    oval(ctx, cx, 580, 230, 145, glow);
  }
  drawBurner(ctx, pot, index, cx, burning ? 574 : 575, burning ? 3.55 : 2.98, state.elapsed);
  ctx.restore();
  if (burning) drawFireAndSmoke(ctx, cx, 645);
  panel(ctx, x + 10, 695, width - 20, 53, 7, burning ? '#702f25' : '#29473b');
  label(ctx, burning ? 'SHRIMP BURNT' : 'NOODLES', cx, 717, 34, burning ? '#ffcf9b' : '#ffe0a5', { align: 'center' });
  if (!burning) meter(ctx, x + 19, 739, width - 38, 8, pot.age / simmerSeconds, '#f0b663', '#597662');
}

function drawFireAndSmoke(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  const smoke = ctx.createLinearGradient(0, -193, 0, -65);
  smoke.addColorStop(0, '#d2baa894');
  smoke.addColorStop(.58, '#8c7467e8');
  smoke.addColorStop(1, '#382a25f2');
  oval(ctx, -111, -184, 35, 15, '#c1a99caa');
  oval(ctx, -61, -171, 24, 13, '#bda2939e');
  ctx.beginPath();
  ctx.moveTo(-34, -78);
  ctx.bezierCurveTo(-34, -111, 22, -132, -33, -140);
  ctx.bezierCurveTo(-71, -142, -93, -173, -55, -179);
  ctx.bezierCurveTo(-18, -191, -23, -148, 19, -153);
  ctx.bezierCurveTo(74, -147, 55, -115, 14, -108);
  ctx.quadraticCurveTo(-10, -100, -7, -83);
  ctx.closePath();
  ctx.fillStyle = smoke;
  ctx.fill();
  for (const [dx, dy, scale] of [[-113, 3, .8], [-65, 24, 1], [-8, 27, .84], [49, 23, 1.08], [106, 7, .82]]) {
    ctx.save();
    ctx.translate(dx, dy);
    ctx.scale(scale, scale);
    flame(ctx, '#fa6439');
    ctx.scale(.56, .66);
    flame(ctx, '#ffca69');
    ctx.restore();
  }
  ctx.restore();
}

function flame(ctx, color) {
  ctx.beginPath();
  ctx.moveTo(-30, 0);
  ctx.bezierCurveTo(-40, -29, -6, -49, -10, -83);
  ctx.bezierCurveTo(10, -72, 23, -56, 15, -38);
  ctx.quadraticCurveTo(34, -46, 35, -58);
  ctx.quadraticCurveTo(54, -19, 30, 0);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
