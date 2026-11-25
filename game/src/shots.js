// Stages the four screenshot scenes and draws the rush showcase.
import { recipes, spawnOrder, ticketCapacity } from './orders.js';
import { readShiftClock, serviceWave, serviceWaves, shiftLength } from './shift.js';
import { chooseFastestRoute, estimateRouteSeconds } from './route.js';
import { burners, chopIngredient, coverIsland, ingredients, moveParticles, worktops } from './stations.js';
import { drawBurner, drawRoom, routePoint, routeSegment } from './kitchen-view.js';
import { label, meter, oval, palette, panel } from './paint.js';

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
  const stove = burners[1];
  const stops = [chop, stove, plate];
  const { x, y, w } = coverIsland;
  const detour = [
    { standX: x - 28, standY: y - 13 },
    { standX: x + w + 31, standY: y - 13 },
  ];
  // Compare the complete walks at the cover's presentation pace.
  const start = { x: chop.standX, y: chop.standY, speed: 105 };
  const alternatives = [stops, [chop, stove, ...detour, plate]];
  const chosen = chooseFastestRoute(start, alternatives);
  return {
    stops,
    detour,
    choices: alternatives.map(route => ({
      seconds: Math.ceil(estimateRouteSeconds(start, route)),
      chosen: route === chosen,
    })),
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
  drawRushBurner(ctx, state, 0, 26);
  drawRushBurner(ctx, state, 1, 650);
}

function drawRushHeader(ctx, elapsed, motion) {
  const wave = serviceWave(elapsed);
  panel(ctx, 26, 20, 600, 117, 12, '#a73428', '#ff9365', 4);
  label(ctx, wave.name.toUpperCase(), 326, 78, 92, '#fff0d5', { align: 'center', weight: 950 });

  panel(ctx, 644, 20, 334, 117, 12, '#382d25', '#b87551', 3);
  label(ctx, 'RUSH x2', 811, 57, 58, '#ffdda8', { align: 'center', weight: 900 });
  const intensity = (serviceWaves.indexOf(wave) + 1) / serviceWaves.length;
  for (let i = 0; i < 6; i++) {
    panel(ctx, 664 + i * 50, 91, 44, 26, 4, i / 6 < intensity ? '#ff9a61' : '#614138');
  }

  panel(ctx, 996, 20, 258, 117, 12, '#491913', '#ff775c', 4);
  ctx.save();
  for (const offset of [0, .5]) {
    const pulse = (motion + offset) % 1;
    const w = 214 + pulse * 26;
    const h = 84 + pulse * 14;
    ctx.globalAlpha = .8 - pulse * .6;
    panel(ctx, 1125 - w / 2, 78 - h / 2, w, h, 22, null, '#ff674f', 5 - pulse * 2);
  }
  ctx.restore();
  label(ctx, readShiftClock(elapsed), 1125, 78, 78, '#ff826b', { align: 'center', face: 'monospace' });
}

function drawRushRail(ctx, orders) {
  panel(ctx, 26, 151, 1228, 254, 12, '#183029', '#9a7455', 2);
  label(ctx, 'ORDER BOARD', 42, 178, 40, palette.light);
  panel(ctx, 962, 157, 278, 45, 10, '#6b3427', '#f79365', 2);
  label(ctx, `+${orders.length - ticketCapacity} waiting`, 1101, 178, 40, '#ffdfab', { align: 'center' });

  orders.slice(0, ticketCapacity).forEach((ticket, i) => {
    const x = 39 + i * 304;
    const width = 290;
    const progress = ticket.left / ticket.patience;
    const urgent = progress <= .34;
    panel(ctx, x, 214, width, 177, 10, '#ffebcb', urgent ? '#ff7959' : '#dbac66', 4);
    panel(ctx, x + 12, 225, width - 24, 7, 3, ticket.recipe.color);
    const [first, ...rest] = ticket.recipe.name.split(' ');
    label(ctx, first, x + width / 2, 265, 60, palette.ink, { align: 'center', weight: 900 });
    label(ctx, rest.join(' '), x + width / 2, 325, 60, palette.ink, { align: 'center', weight: 900 });
    meter(ctx, x + 16, 353, width - 32, 26, progress, urgent ? '#ff6954' : '#ffc260', urgent ? '#67302a' : '#58402d');
  });
}

function drawRushBurner(ctx, state, index, x) {
  const width = 604;
  const cx = x + width / 2;
  const burning = index === 0;
  const pot = state.pots[index];
  panel(ctx, x, 423, width, 355, 12, burning ? '#4e2a25' : '#233c32', burning ? '#e46c50' : '#7baf79', 4);
  panel(ctx, x + 9, 432, width - 18, 80, 8, burning ? '#a73428' : '#356047');
  label(ctx, burning ? 'BURNING' : 'SIMMERING', cx, 472, 66, burning ? '#fff0d5' : '#e5ffc9',
    { align: 'center', weight: 950 });

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 10, 512, width - 20, 195);
  ctx.clip();
  if (burning) {
    const glow = ctx.createRadialGradient(cx, 636, 40, cx, 636, 240);
    glow.addColorStop(0, '#f3a45b');
    glow.addColorStop(1, '#4e2a2500');
    oval(ctx, cx, 636, 240, 125, glow);
  }
  drawBurner(ctx, pot, index, cx, 623, 2.57, state.elapsed, null, { showDetails: false });
  if (burning) drawFireAndSmoke(ctx, cx, 675);
  ctx.restore();
  label(ctx, ingredients[pot.food.id].name.toUpperCase(), cx, 739, 63, '#ffebcb', { align: 'center', weight: 900 });
}

function drawFireAndSmoke(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.save();
  ctx.translate(0, 41);
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
  ctx.restore();
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
