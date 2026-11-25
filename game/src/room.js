// Draws the kitchen floor, its fixtures, and the cook’s route.
import { coverIsland, floorBounds, ingredients, nearbyStation, pantry } from './stations.js';
import { drawPass, drawPlating, drawServePop, drawStove, drawWorkstations } from './worktops.js';
import { drawIngredient, drawKitchenSign, drawWoodGrain, label, oval, palette, panel, stroke } from './paint.js';

export function drawKitchen(ctx, state, route) {
  const cover = state.shot === 'cover';
  drawRoom(ctx, cover);
  drawFurniture(ctx, state);
  drawStove(ctx, state);
  drawPlating(ctx, state);
  drawPass(ctx, state);
  drawStationFocus(ctx, state);
  drawRoute(ctx, state, route);
  drawCook(ctx, state);
  for (const bit of state.particles) {
    ctx.globalAlpha = Math.min(1, bit.left * 4);
    panel(ctx, bit.x, bit.y, 5, 5, 1, bit.color);
  }
  ctx.globalAlpha = 1;
  if (!cover) drawServiceFooter(ctx, state);
  else if (route) drawCoverRouteChoices(ctx, route.choices);
  if (state.screen === 'play' && state.servePop) {
    drawServePop(ctx, state.servePop, state.elapsed - state.servePop.at, 1039, 656);
  }
}

function drawStationFocus(ctx, state) {
  if (state.staged || state.screen !== 'play') return;
  const station = state.hover ?? state.target ?? nearbyStation(state.cook);
  if (!station) return;
  panel(ctx, station.x - 2, station.y - 2, station.w + 4, station.h + 4, 9, null, palette.gold, 3);
  oval(ctx, station.standX, station.standY + 14, 11, 4, '#ffce749c');
}

export function drawRoom(ctx, cover = false) {
  const scene = cover ? 'cover' : 'service';
  if (!kitchenBackdrops[scene]) {
    const backdrop = document.createElement('canvas');
    backdrop.width = 1280;
    backdrop.height = 800;
    paintRoom(backdrop.getContext('2d'), cover);
    kitchenBackdrops[scene] = backdrop;
  }
  ctx.drawImage(kitchenBackdrops[scene], 0, 0);
}

function paintRoom(ctx, cover) {
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
  if (cover) {
    label(ctx, 'WASD walk · E chop/use · CLICK station', 795, 231, 25, palette.light, { align: 'center' });
  } else {
    drawLanternString(ctx);
  }
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

const kitchenBackdrops = {};

function drawFurniture(ctx, state) {
  const cover = state.shot === 'cover';
  drawCounterSign(ctx);
  for (const crate of pantry) drawCrate(ctx, crate, cover);
  drawWorkstations(ctx, state, cover);
  if (cover) drawPrepIsland(ctx);
}

function drawPrepIsland(ctx) {
  const { x, y, w, h } = coverIsland;
  oval(ctx, x + w / 2, y + h - 2, w / 2 + 9, 13, '#112b246e');
  for (const legX of [x + 12, x + w - 24]) {
    panel(ctx, legX, y + 34, 12, h - 34, 3, '#7e5236', '#44372a', 2);
  }
  panel(ctx, x, y + 8, w, 43, 7, '#875536', '#513a2c', 2);
  panel(ctx, x, y, w, 41, 7, '#c49361', '#e5b682', 2);
  drawWoodGrain(ctx, x + 5, y + 2, w - 10, 34);
  panel(ctx, x + 16, y + 8, 53, 24, 5, '#658a7c', '#34594e', 2);
  panel(ctx, x + 21, y + 12, 43, 16, 4, '#90ab91', '#bbcab0');
  for (const offset of [95, 120]) {
    oval(ctx, x + offset, y + 22, 11, 8, '#86583b');
    oval(ctx, x + offset, y + 19, 11, 7, '#e6c88e', '#744b37');
    oval(ctx, x + offset, y + 19, 7, 4, '#ab8054');
  }
}

function drawCrate(ctx, crate, cover) {
  const { id, x, y, w, h } = crate;
  panel(ctx, x - 1, y + 8, w + 2, h, 8, '#102522b0');
  panel(ctx, x, y, w, h, 7, '#a66c43', '#503e2d');
  panel(ctx, x + 5, y + 3, w - 10, 53, 4, '#ca9865', '#e4b879');
  panel(ctx, x + 10, y + 8, w - 20, 45, 4, '#956848');
  for (let i = 0; i < 3; i++) stroke(ctx, '#b38158', 1, [[x + 12, y + 17 + 14 * i], [x + w - 12, y + 17 + 14 * i]]);
  drawCrateContents(ctx, id, x + w / 2, y + 30);
  drawCrateLabel(ctx, crate, ingredients[id], cover);
}

function drawCrateContents(ctx, id, x, y) {
  for (const [dx, dy, angle, scale] of [[-41, -4, -.13, .82], [39, -4, .13, .82], [0, 2, -.05, 1.02]]) {
    ctx.save();
    ctx.translate(x + dx, y + dy);
    ctx.rotate(angle);
    oval(ctx, 0, 12, 25, 7, '#513a29a0');
    drawIngredient(ctx, id, 0, 0, scale);
    ctx.restore();
  }
}

function drawCounterSign(ctx) {
  drawKitchenSign(ctx, 'COUNTER INGREDIENTS', 51, 216, 302, 29);
}

function drawCrateLabel(ctx, crate, data, cover) {
  const { x, y, w } = crate;
  const prep = { pour: 'POUR', cook: 'COOK', chop: 'CHOP', both: 'CHOP + COOK' }[data.route];
  drawKitchenSign(ctx, data.name, x + 6, y + 53, w - 12, 35, { size: cover ? 20 : 18, prep, prepSize: cover ? 13 : 11 });
}

function drawServiceFooter(ctx, state) {
  panel(ctx, 20, 753, 1240, 38, 8, '#172f27', '#365549');
  const notice = state.noticeUntil > state.elapsed ? state.notice : '';
  label(ctx, notice || 'WASD  Walk      E  Use / Chop      CLICK  Walk & use      Q  Focus ticket', 36, 772,
    notice ? 18 : 16, notice ? palette.gold : '#ebdbbe');
}

function drawCook(ctx, state) {
  const cook = state.cook;
  const bob = cook.moving ? Math.sin((state.coverMotion ?? state.elapsed) * 25) * 3 : 0;
  ctx.save();
  ctx.translate(cook.x, cook.y - 5 + bob);
  ctx.scale(cook.facing * 1.43, 1.43);
  if (state.shot === 'cover') {
    stroke(ctx, '#ffdf968f', 2.5, [[-59, 5], [-44, 1]]);
    stroke(ctx, '#ffedbfcc', 3, [[-49, -5], [-28, -9]]);
    stroke(ctx, '#ffedbf88', 2, [[-42, 13], [-31, 10]]);
  }
  oval(ctx, 0, 21, 27, 12, '#0c261f70');
  oval(ctx, -11, 18, 7, 8, '#26352c');
  oval(ctx, 10, 17, 7, 8, '#26352c');
  oval(ctx, 0, 7, 19, 20, '#bc563e', '#4d3d2d', 2);
  panel(ctx, -9, 6, 19, 17, 4, '#ffdfac');
  oval(ctx, 19, 5, 7, 10, '#d8925d', '#513d2c');
  oval(ctx, 0, -9, 17, 15, '#db9a63', '#593c2a');
  oval(ctx, -14, -23, 8, 8, '#fff0d5', '#b89675');
  oval(ctx, -1, -29, 13, 11, '#fff0d5', '#b89675');
  oval(ctx, 12, -24, 9, 8, '#fff0d5', '#b89675');
  panel(ctx, -15, -24, 31, 13, 4, '#fff0d5');
  stroke(ctx, '#4e3d31', 2, [[-12, -12], [14, -12]]);
  oval(ctx, 9, -6, 2.3, 2.3, '#483428');
  stroke(ctx, '#a65940', 1.8, [[9, 0], [12, 0]]);
  if (cook.hand) {
    oval(ctx, 38, 14, 27, 19, '#d8ae73', '#384439', 2);
    oval(ctx, 38, 8, 28, 16, '#fff0d2', '#466e57');
    oval(ctx, 38, 7, 23, 12, '#90714c');
    drawIngredient(ctx, cook.hand.id, 38, 5, .85, cook.hand.stage);
    oval(ctx, 17, 18, 7, 5, '#e3a773', '#67402d', 1.3);
  }
  ctx.restore();
}

function drawRoute(ctx, state, route) {
  if (!route) return;
  if (state.shot === 'cover') {
    drawCoverRoute(ctx, route);
    return;
  }
  const { cook } = state;
  const origin = [cook.x, cook.y + 20];
  if (!route.length) return;
  const points = route.map(routePoint);
  drawTrail(ctx, origin, points);
  points.forEach(([x, y], index) => {
    const visits = points.flatMap(([px, py], order) => px === x && py === y ? [order + 1] : []);
    if (visits[0] !== index + 1) return;
    if (visits.length > 1) panel(ctx, x - 31, y - 17, 62, 34, 14, palette.gold, '#283d31', 3);
    else oval(ctx, x, y, 17, 17, palette.gold, '#283d31', 3);
    label(ctx, visits.join('·'), x, y + 1, 23, '#25342a', { align: 'center' });
  });
}

function drawCoverRoute(ctx, { stops, detour }) {
  const points = stops.map(routePoint);
  const [chop, stove, plate] = points;

  // Only the leg around the island differs from the active route.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(...stove);
  const [left, right] = detour.map(routePoint);
  ctx.arcTo(...left, ...right, 14);
  ctx.arcTo(...right, ...plate, 14);
  ctx.lineTo(...plate);
  ctx.setLineDash([8, 7]);
  ctx.lineCap = 'round';
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#d6e1bd98';
  ctx.stroke();
  ctx.restore();

  drawTrail(ctx, chop, [stove, plate]);
  const labels = ['CHOP', 'STOVE', 'PLATE'];
  points.forEach(([x, y], index) => {
    panel(ctx, x - 36, y + 18, 82, 23, 7, '#203b30');
    label(ctx, labels[index], x + 5, y + 30, 20, '#fff1bf', { align: 'center' });
    oval(ctx, x, y, 17, 17, palette.gold, '#283d31', 3);
    label(ctx, String(index + 1), x, y + 1, 23, '#25342a', { align: 'center' });
  });
}

function drawCoverRouteChoices(ctx, [direct, aroundIsland]) {
  const cards = [
    { ...direct, x: 20, width: 692, name: 'ROUTE A: CHOP → STOVE → PLATE' },
    { ...aroundIsland, x: 724, width: 536, name: 'ROUTE B: AROUND ISLAND' },
  ];
  for (const { chosen, x, width, name, seconds } of cards) {
    const ink = chosen ? '#27392c' : '#d3dbc6';
    panel(ctx, x, 752, width, 41, 8, chosen ? '#ffe1a0' : '#213b30', chosen ? '#f6b960' : '#6f8975', 2);
    if (chosen) stroke(ctx, ink, 4, [[x + 17, 773], [x + 24, 780], [x + 37, 765]]);
    label(ctx, name, x + (chosen ? 49 : 16), 772, 29, ink, { weight: 850 });
    label(ctx, `${seconds} s`, x + width - 17, 772, 31, ink, { align: 'right', weight: 900 });
  }
}

function drawTrail(ctx, from, points) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(...from);
  for (const to of points) {
    const [cx, cy] = routeSegment(from, to);
    ctx.quadraticCurveTo(cx, cy, ...to);
    from = to;
  }
  ctx.lineCap = 'round';
  ctx.setLineDash([1, 14]);
  ctx.strokeStyle = '#19382d';
  ctx.lineWidth = 9;
  ctx.stroke();
  ctx.strokeStyle = '#ffe3a0';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.restore();
}

export function routePoint({ standX, standY }) {
  const offset = standY === floorBounds.bottom ? -18 : standY === floorBounds.top ? 12 : 0;
  return [standX, standY + offset];
}

export function routeSegment(from, to) {
  return [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 - Math.min(65, Math.abs(from[0] - to[0]) * .25)];
}
