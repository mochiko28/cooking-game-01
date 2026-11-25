// Stages the four screenshot scenes and draws the rush showcase.
import { recipes, spawnOrder } from './orders.js';
import { readShiftClock, serviceWave, serviceWaves, shiftLength } from './shift.js';
import { estimateRouteSeconds } from './route.js';
import { burners, chopIngredient, coverIsland, moveParticles, simmerSeconds, worktops } from './stations.js';
import { drawBurner, drawRoom, routePoint, routeSegment } from './kitchen.js';
import { drawDish, label, meter, oval, palette, panel } from './paint.js';

export function stageScreenshot(state, scene) {
  if (!['cover', 'rush', 'recipes', 'results'].includes(scene)) return;
  const [garden, tide, gold, moon, harvest, ember] = recipes;
  state.staged = true;
  state.shot = scene;
  state.screen = 'play';
  state.elapsed = 94;
  state.orders = [];
  state.nextTicket = 7;
  state.coins = 238;
  state.served = 4;
  state.combo = 3;
  state.layers = ['broth', 'noodles'];
  state.ready = tide;
  state.pots = [
    { food: { id: 'egg', stage: 'raw' }, age: 2.8 },
    { food: { id: 'shrimp', stage: 'raw' }, age: 9.7 },
  ];
  state.cook.x = 436;
  state.cook.y = 432;
  state.cook.facing = -1;

  if (scene === 'cover') stageCover(state);

  if (scene === 'rush') {
    state.elapsed = 153;
    state.rushMotion = .24;
    state.coins = 466;
    state.served = 7;
    state.combo = 5;
    state.pots[0].age = 13;
    state.pots[0].food.id = 'shrimp';
    state.pots[1] = { food: { id: 'noodles', stage: 'raw' }, age: 3.3 };
    state.showRoute = false;
  }

  const rush = scene === 'rush';
  const rail = rush ? [ember, tide, harvest, moon, gold, garden] : [garden, tide, gold, moon];
  rail.forEach((recipe, index) => {
    const left = (rush ? [5, 36, 12, 49, 18, 9] : [42, 49, 21, 57])[index];
    spawnOrder(state, { recipe, left, patience: 64, vipLeft: index === 2 ? (rush ? 11 : 17) : undefined });
  });
  if (scene === 'recipes') state.screen = 'recipes';
  if (scene === 'results') {
    state.screen = 'results';
    state.elapsed = shiftLength;
    state.served = 9;
    state.servedByWave = [2, 4, 3];
    state.coins = 698;
    state.tips = 302;
    state.bestCombo = 6;
    state.missed = 2;
  }
}

export function coverRoutePlan() {
  // The cook picks up greens, checks the burning pot, then plates the garnish.
  const stops = [chop, burners[1], plate];
  const { x, y, w } = coverIsland;
  const detour = [
    { standX: x - 28, standY: y - 13 },
    { standX: x + w + 31, standY: y - 13 },
  ];
  // Compare the complete walks at the cover's presentation pace.
  const start = { x: chop.standX, y: chop.standY, speed: 105 };
  return {
    stops,
    detour,
    fastest: Math.ceil(estimateRouteSeconds(start, stops)),
    slower: Math.ceil(estimateRouteSeconds(start, [chop, burners[1], ...detour, plate])),
  };
}

function stageCover(state) {
  Object.assign(state.cook, { facing: 1, moving: true, hand: { id: 'greens', stage: 'ready' } });
  state.board.food = { id: 'greens', stage: 'raw' };
  state.board.cuts = 2;
  state.pots[1].age = 11.5;
  state.coverMotion = .32;
  moveCoverCook(state);
  state.elapsed -= .13;
  chopIngredient(state);
  moveParticles(state, .13);
  state.elapsed += .13;
}

export function moveCoverCook(state) {
  const progress = ((state.coverMotion + 1.18) % 3) / 3;
  const mix = (from, to) => from + (to - from) * progress;
  const [x, y] = coverStart.map((value, axis) => mix(mix(value, coverControl[axis]), mix(coverControl[axis], coverEnd[axis])));
  state.cook.x = x;
  state.cook.y = y - 20;
}

const [chop, , plate] = worktops;
const coverStart = routePoint(chop);
const coverEnd = routePoint(burners[1]);
const coverControl = routeSegment(coverStart, coverEnd);

export function drawRushView(ctx, state) {
  drawRoom(ctx);
  drawRushHeader(ctx, state.elapsed, state.rushMotion);
  drawRushRail(ctx, state.orders);
  panel(ctx, 26, 384, 1228, 389, 14, '#b68051', '#f8c385', 3);
  drawRushBurner(ctx, state, 0, 44, 735);
  drawRushBurner(ctx, state, 1, 797, 438);
}

function drawRushHeader(ctx, elapsed, motion) {
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

  panel(ctx, 996, 20, 258, 117, 12, '#491913', '#ff775c', 4);
  ctx.save();
  for (const offset of [0, .5]) {
    const pulse = (motion + offset) % 1;
    const w = 204 + pulse * 36;
    const h = 68 + pulse * 16;
    ctx.globalAlpha = .8 - pulse * .6;
    panel(ctx, 1125 - w / 2, 91 - h / 2, w, h, 25, null, '#ff674f', 5 - pulse * 2);
  }
  ctx.restore();
  label(ctx, 'TIME LEFT', 1125, 40, 23, '#ffdda8', { align: 'center' });
  label(ctx, readShiftClock(elapsed), 1125, 92, 70, '#ff705b', { align: 'center', face: 'monospace' });
}

function drawRushRail(ctx, orders) {
  panel(ctx, 26, 148, 1228, 224, 11, '#1e342a', '#9a7455', 2);
  label(ctx, 'ORDER BOARD', 39, 169, 29, palette.light);
  label(ctx, `${orders.length} WAITING`, 1240, 169, 29, '#ffd098', { align: 'right' });
  orders.forEach((ticket, i) => {
    const x = 38 + (i % 3) * 404;
    const y = 190 + Math.floor(i / 3) * 89;
    const progress = ticket.left / ticket.patience;
    const urgent = progress <= .34;
    panel(ctx, x, y, 396, 79, 8, '#ffebcb', urgent ? '#ff7959' : '#af9469', urgent ? 4 : 2);
    panel(ctx, x + 6, y + 6, 102, 67, 5, ticket.recipe.color);
    drawDish(ctx, ticket.recipe.layers, x + 57, y + 36, .79, ticket.recipe.color, ticket.recipe.shape);
    label(ctx, ticket.recipe.name, x + 120, y + 27, 39, palette.ink);
    meter(ctx, x + 120, y + 51, 262, 19, progress, urgent ? '#ff634b' : '#6ebf81', urgent ? '#79372e' : '#365547');
  });
}

function drawRushBurner(ctx, state, index, x, width) {
  const cx = x + width / 2;
  const burning = index === 0;
  const pot = state.pots[index];
  panel(ctx, x, 399, width, 357, 11, burning ? '#4e2a25' : '#29473b', burning ? '#e46c50' : '#7b9473', 4);
  panel(ctx, x + 9, 407, width - 18, 58, 8, burning ? '#a73428' : '#3e6650');
  label(ctx, burning ? 'POT BURNING' : 'SIMMERING', cx, 436, 49, '#fff0d5', { align: 'center' });

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 10, 465, width - 20, 230);
  ctx.clip();
  if (burning) {
    const glow = ctx.createRadialGradient(cx, 588, 40, cx, 588, 230);
    glow.addColorStop(0, '#f3a45b');
    glow.addColorStop(1, '#4e2a2500');
    oval(ctx, cx, 580, 230, 145, glow);
  }
  drawBurner(ctx, pot, index, cx, 593, burning ? 3.35 : 2.85, state.elapsed);
  ctx.restore();
  if (burning) drawFireAndSmoke(ctx, cx, 659);
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
