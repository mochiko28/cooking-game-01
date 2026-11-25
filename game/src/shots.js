// Stages the four screenshot scenes and draws the rush showcase.
import { recipes, spawnOrder, ticketCapacity } from './orders.js';
import { serviceWave, shiftLength } from './shift.js';
import { chooseFastestRoute, estimateRouteSeconds } from './route.js';
import { burners, chopIngredient, coverIsland, ingredients, moveParticles, useStation, worktops } from './stations.js';
import { drawRoom, routePoint, routeSegment } from './room.js';
import { drawBurner, drawServePop } from './worktops.js';
import { drawLastCall, drawUrgentClock } from './hud.js';
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
    const shotTime = 153;
    state.elapsed = shotTime - .17;
    state.served = 6;
    state.combo = 4;
    state.lastServedRecipe = garden;
    spawnOrder(state, { recipe: tide });
    useStation(state, pass);
    state.elapsed = shotTime;
    state.rushMotion = shotTime - state.servePop.at;
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
  const progress = ((state.coverMotion + .54) % 3) / 3;
  const mix = (from, to) => from + (to - from) * progress;
  const [x, y] = coverStart.map((value, axis) => mix(mix(value, coverControl[axis]), mix(coverControl[axis], coverEnd[axis])));
  state.cook.x = x;
  state.cook.y = y - 20;
}

const [chop, , plate, pass] = worktops;
const coverStart = routePoint(chop);
const coverEnd = routePoint(plate);
const coverControl = routeSegment(coverStart, coverEnd);

export function drawRushView(ctx, state) {
  drawRoom(ctx);
  drawRushHeader(ctx, state.elapsed, state.rushMotion, state.orders.length);
  drawRushRail(ctx, state.orders);
  drawRushBurner(ctx, state, 0, 26);
  drawRushBurner(ctx, state, 1, 920);

  panel(ctx, 377, 384, 526, 394, 12, '#1c3228', '#b48754', 4);
  const glow = ctx.createRadialGradient(640, 652, 28, 640, 652, 235);
  glow.addColorStop(0, '#efb9578f');
  glow.addColorStop(1, '#efb95700');
  oval(ctx, 640, 652, 237, 121, glow);
  const age = state.rushMotion % 1.6;
  const dishY = 688 - 20 * Math.sin(Math.PI * Math.min(1, age / .55));
  const { recipe } = state.servePop;
  drawDish(ctx, recipe.layers, 640, dishY, 2.6, recipe.color, recipe.shape);
  drawServePop(ctx, state.servePop, age, 640, 704, 2.1);
}

function drawRushHeader(ctx, elapsed, motion, orderCount) {
  const wave = serviceWave(elapsed);
  panel(ctx, 26, 32, 548, 121, 12, '#a73428', '#ff9365', 4);
  drawLastCall(ctx, wave.name.toUpperCase(), 300, 93, 78, motion);

  panel(ctx, 592, 32, 243, 121, 12, '#382d25', '#b87551', 3);
  label(ctx, 'RUSH x2', 714, 69, 53, '#ffdda8', { align: 'center', weight: 900 });
  label(ctx, `+${orderCount - ticketCapacity} waiting`, 714, 121, 37, '#ffdfab', { align: 'center' });
  drawUrgentClock(ctx, elapsed, motion, 1056, 92, 1.48);
}

function drawRushRail(ctx, orders) {
  orders.slice(0, ticketCapacity).forEach((ticket, i) => {
    const x = 26 + i * 312;
    const width = 292;
    const progress = ticket.left / ticket.patience;
    const urgent = progress <= .34;
    panel(ctx, x, 186, width, 174, 10, urgent ? '#8c362b' : '#ffebcb', urgent ? '#ff7959' : '#dbac66', 4);
    const [first, ...rest] = ticket.recipe.name.split(' ');
    const ink = urgent ? '#fff0d5' : palette.ink;
    label(ctx, first, x + width / 2, 230, 63, ink, { align: 'center', weight: 900, maxWidth: width - 24 });
    label(ctx, rest.join(' '), x + width / 2, 291, 63, ink, { align: 'center', weight: 900, maxWidth: width - 24 });
    meter(ctx, x + 16, 333, width - 32, 15, progress, urgent ? '#ff8b66' : '#ffc260', urgent ? '#51221c' : '#58402d');
  });
}

function drawRushBurner(ctx, state, index, x) {
  const width = 334;
  const cx = x + width / 2;
  const burning = index === 0;
  const pot = state.pots[index];
  panel(ctx, x, 384, width, 394, 12, burning ? '#4e2a25' : '#233c32', burning ? '#e46c50' : '#7baf79', 4);
  panel(ctx, x + 9, 393, width - 18, 76, 8, burning ? '#a73428' : '#356047');
  label(ctx, burning ? 'BURNING' : 'SIMMERING', cx, 431, burning ? 59 : 50, burning ? '#fff0d5' : '#e5ffc9',
    { align: 'center', weight: 950 });

  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 10, 470, width - 20, 243);
  ctx.clip();
  if (burning) {
    const glow = ctx.createRadialGradient(cx, 636, 40, cx, 636, 240);
    glow.addColorStop(0, '#f3a45b');
    glow.addColorStop(1, '#4e2a2500');
    oval(ctx, cx, 636, 240, 125, glow);
  }
  drawBurner(ctx, pot, index, cx, 606, 2.36, state.elapsed, null, { showDetails: false });
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
