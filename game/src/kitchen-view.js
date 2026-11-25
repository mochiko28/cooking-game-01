// Draws the kitchen, its stations, and the cook’s route.
import { focusedTicket, matchingRecipes } from './orders.js';
import {
  burnTime, burners, coverIsland, floorBounds, ingredients, nearbyStation,
  pantry, simmerSeconds, sink, stovePhase, worktops,
} from './stations.js';
import { drawDish, drawIngredient, label, meter, oval, palette, panel, stroke } from './paint.js';

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
  for (const station of worktops) drawWorktop(ctx, station);
  drawSink(ctx, cover);
  drawChopBoard(ctx, state);
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

function drawStationShadow(ctx, x, y, w, h) {
  ctx.save();
  ctx.shadowColor = '#091e18c2';
  ctx.shadowBlur = 17;
  ctx.shadowOffsetY = 8;
  panel(ctx, x + 2, y, w - 4, h, 8, '#273b30');
  ctx.restore();
}

function drawWorktop(ctx, station) {
  const { x, y, w, h } = station;
  drawStationShadow(ctx, x, y, w, h);
  panel(ctx, x, y, w, h, 7, '#814f37', '#3e3529', 2);
  panel(ctx, x + 2, y + 1, w - 4, h - 10, 6, '#ce955f', '#edb678', 2);
  panel(ctx, x + 6, y + 34, w - 12, h - 45, 4, '#cc9867', '#b17b53', 1);
  drawWoodGrain(ctx, x + 8, y + 6, w - 16, h - 19);
  for (const dx of [12, w - 12]) oval(ctx, x + dx, y + h - 5, 2.8, 2.8, '#503d30', '#d49a61', 1);
  drawStationSign(ctx, station);
}

function drawWoodGrain(ctx, x, y, w, h) {
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

function drawChopBoard(ctx, state) {
  panel(ctx, 57, 622, 214, 77, 9, '#8a562f', '#72492f', 3);
  panel(ctx, 61, 622, 206, 71, 7, '#ae763f', '#edb471');
  for (const y of [634, 672, 685]) stroke(ctx, '#d4995c', 1.5, [[70, y], [254, y]]);
  oval(ctx, 253, 657, 5, 9, '#6d462d');
  const sinceCut = state.elapsed - state.board.mark;
  const cover = state.shot === 'cover';
  const swing = cover ? (state.coverMotion - .19 + 3) % .6 : sinceCut;
  const chopping = swing < .17;
  if (state.board.food) drawIngredient(ctx, state.board.food.id, 132, 656, 1.14, state.board.cuts >= 3 ? 'chopped' : 'raw');
  if (cover && swing < .34) {
    const lift = 1 - (swing - .17) ** 2 * 19;
    for (const [x, y, angle] of [[87, 637, -.4], [108, 647, .35], [124, 624, -.25], [143, 633, .5], [157, 647, -.5]]) {
      ctx.save();
      ctx.translate(146 + (x - 146) * lift, 661 + (y - 661) * lift);
      ctx.rotate(angle);
      panel(ctx, -7, -4, 14, 8, 2, '#c8e88b', '#426a3b');
      ctx.restore();
    }
  }
  ctx.save();
  if (cover && chopping) {
    for (const [radius, start, end, color] of [[77, 3.08, 3.69, '#fff0c4'], [88, 3.29, 3.61, '#ffd58e']]) {
      ctx.beginPath();
      ctx.arc(237, 660, radius, start, end);
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
  }
  ctx.translate(220, 655);
  ctx.rotate(cover && chopping ? .81 - swing * 2 : chopping ? -.24 : -.63);
  panel(ctx, -57, -3, 56, 25, 4, '#b8ceca', '#53665e');
  stroke(ctx, '#effcea', 3, [[-52, 18], [-5, 18]]);
  panel(ctx, -4, -3, 30, 12, 4, '#49372a');
  oval(ctx, 11, 3, 2.4, 2.4, '#dbab68');
  ctx.restore();
  if (!cover && chopping) {
    stroke(ctx, '#fff2c6', 3, [[148, 644], [137, 633]]);
    stroke(ctx, '#fff2c6', 3, [[156, 639], [154, 626]]);
    stroke(ctx, '#ffe299', 2.4, [[165, 639], [172, 630]]);
  }
  if (cover || sinceCut < .58) drawChopPop(ctx, swing, state.board.cuts, cover);
  meter(ctx, 62, 703, 204, 6, state.board.cuts / 4, '#335a45', '#9e6c48');
  const status = state.board.cuts === 4 ? 'PICK UP' : state.board.food ? `${state.board.cuts} / 4 CUTS` : 'HOLD TO CHOP';
  label(ctx, status, 164, 721, cover ? 18 : 16, '#3b2b20', { align: 'center' });
}

function drawChopPop(ctx, age, cuts, cover) {
  ctx.save();
  ctx.globalAlpha = cover ? 1 : Math.min(1, (.58 - age) * 6);
  ctx.translate(cover ? 118 : 110, (cover ? 506 : 572) - age * 19);
  ctx.rotate(-.08);
  panel(ctx, -90, -22, 180, 44, 12, '#233a2a', '#d4e78f', 3);
  label(ctx, `CHOP! ${cuts}/4`, 0, 0, 31, '#e8f6b8', { align: 'center', weight: 900 });
  ctx.restore();
}

function drawSink(ctx, cover) {
  drawStationShadow(ctx, sink.x, sink.y, sink.w, sink.h);
  panel(ctx, sink.x, sink.y, sink.w, sink.h, 7, '#90afa3', '#c4c8a4');
  panel(ctx, sink.x + 7, sink.y + 13, 44, 47, 8, '#496e65', '#d4d9b9');
  stroke(ctx, '#d4d7b6', 4, [[1216, 428], [1216, 439], [1207, 439], [1207, 449]]);
  oval(ctx, 1210, 465, 5, 5, '#b0c9b5');
  drawKitchenSign(ctx, 'Sink', 1186, 481, 46, 22, { size: cover ? 16 : 14 });
}

function drawCounterSign(ctx) {
  drawKitchenSign(ctx, 'COUNTER INGREDIENTS', 51, 216, 302, 29);
}

function drawCrateLabel(ctx, crate, data, cover) {
  const { x, y, w } = crate;
  const prep = { pour: 'POUR', cook: 'COOK', chop: 'CHOP', both: 'CHOP + COOK' }[data.route];
  drawKitchenSign(ctx, data.name, x + 6, y + 53, w - 12, 35, { size: cover ? 20 : 18, prep, prepSize: cover ? 13 : 11 });
}

function drawStationSign(ctx, station) {
  const { x, y } = station;
  drawKitchenSign(ctx, station.label, x + 7, y + 5, undefined, 29);
}

function drawKitchenSign(ctx, name, x, y, width, height, { size = 22, prep, prepSize = 11 } = {}) {
  const title = name.toUpperCase();
  ctx.font = `800 ${size}px system-ui`;
  const w = width ?? Math.ceil(ctx.measureText(title).width) + 24;
  panel(ctx, x, y, w, height, height / 2, '#222d27', '#ba9065', 1);
  label(ctx, title, x + w / 2, y + (prep ? 11 : height / 2), size, palette.light, { align: 'center' });
  if (prep) label(ctx, prep, x + w / 2, y + 27, prepSize, '#e8bf88', { align: 'center' });
}

function drawServiceFooter(ctx, state) {
  panel(ctx, 20, 753, 1240, 38, 8, '#172f27', '#365549');
  const notice = state.noticeUntil > state.elapsed ? state.notice : '';
  label(ctx, notice || 'WASD  Walk      E  Use / Chop      CLICK  Walk & use      Q  Focus ticket', 36, 772,
    notice ? 18 : 16, notice ? palette.gold : '#ebdbbe');
}

function drawStove(ctx, state) {
  const motion = state.shot === 'cover' ? state.coverMotion : null;
  for (const { index, standX } of burners) drawBurner(ctx, state.pots[index], index, standX, 660, 1, state.elapsed, motion);
}

export function drawBurner(ctx, pot, index, x, y, scale, elapsed, coverMotion = null, { showDetails = true } = {}) {
  const phase = stovePhase(pot);
  const countdown = burnTime(pot);
  const warning = phase === 'cooked' && countdown <= 2;
  const burning = phase === 'burnt' && coverMotion !== null;
  const hot = phase !== 'empty';
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  panel(ctx, -62, -42, 124, 73, 6, '#263630', warning || burning ? '#ff765b' : '#8c9b85', 2);
  if (showDetails) label(ctx, String(index + 1), -49, -29, coverMotion === null ? 14 : 16, '#f4deb3', { align: 'center' });
  oval(ctx, 0, 3, 51, 25, '#142924', '#567267');
  oval(ctx, 0, 6, 43, 20, hot ? '#bd5e37' : '#425750');
  oval(ctx, 0, 6, 36, 16, null, hot ? '#f6aa5e' : '#73877b', 2.5);
  if (hot) {
    panel(ctx, -52, -11, 104, 9, 4, '#a3ada0', '#192d27');
    oval(ctx, 0, 1, 38, 22, '#4b7470', '#253531', 2);
    oval(ctx, 0, -8, 38, 20, '#b7c4aa', '#f8e2b4', 2);
    const broth = ctx.createLinearGradient(0, -22, 0, 6);
    broth.addColorStop(0, phase === 'burnt' ? '#52382a' : '#893d27');
    broth.addColorStop(.48, phase === 'burnt' ? '#654532' : '#dc8b44');
    broth.addColorStop(1, phase === 'burnt' ? '#382a23' : '#9c4c29');
    oval(ctx, 0, -8, 32, 14, broth);
    oval(ctx, -17, -11, 10, 2.4, '#fac987a0');
    const platingStage = phase === 'cooked' || (pot.food.id === 'egg' && pot.age >= 1) ? 'ready' : pot.food.stage;
    ctx.save();
    if (phase === 'burnt') ctx.filter = 'grayscale(.8) brightness(.56) sepia(.35)';
    drawIngredient(ctx, pot.food.id, 0, -8, .69, platingStage);
    ctx.restore();
    drawSteam(ctx, 3, -13, elapsed + (coverMotion ?? 0), phase === 'burnt', coverMotion !== null);
    if (burning) drawSizzle(ctx, coverMotion);
  }
  if (showDetails) {
    const colors = { empty: '#ead4ac', simmering: '#f7b66d', cooked: '#c8e49a', burnt: '#ff977d' };
    const words = { empty: 'EMPTY', simmering: 'SIMMERING', cooked: 'LIFT NOW', burnt: 'BURNT' };
    const progress = phase === 'cooked' ? countdown / 7 : phase === 'simmering' ? pot.age / simmerSeconds : 0;
    meter(ctx, -60, 36, 120, 6, progress, warning ? '#ff785e' : colors[phase], '#6d5944');
    panel(ctx, -62, 46, 124, 23, 5, warning || burning ? '#a53125' : '#263630');
    const status = burning ? 'BURNING' : warning ? `BURN ${Math.ceil(countdown)}s` : words[phase];
    const statusSize = coverMotion === null ? 16 : burning ? 22 : 18;
    label(ctx, status, 0, 58, statusSize, warning || burning ? '#fff0cf' : colors[phase], { align: 'center' });
  }
  ctx.restore();
}

function drawSizzle(ctx, motion) {
  const pulse = .5 + .5 * Math.sin(motion * 7);
  const x = 42 + 4 * pulse;
  const y = -22 - 5 * pulse;
  oval(ctx, x, y, 13, 13, '#e35c2b80');
  stroke(ctx, '#ffb35d', 3, [[x - 9, y + 6], [x, y], [x + 9, y - 8]]);
  stroke(ctx, '#fff0ab', 3, [[x - 4, y - 8], [x, y], [x + 6, y + 7]]);
  oval(ctx, x, y, 3.6, 3.6, '#fff4d0');
  oval(ctx, x + 9, y - 12, 2.3, 2.3, '#ff9a59');
  oval(ctx, x - 10, y - 7, 1.8, 1.8, '#ffbe73');
}

function drawPlating(ctx, state) {
  const { layers, queuedPlate } = state;
  const cover = state.shot === 'cover';
  const choices = matchingRecipes(layers);
  const focus = focusedTicket(state)?.recipe;
  const recipe = choices.includes(focus) ? focus : choices.find(option => state.orders.some(ticket => ticket.recipe === option)) ?? choices[0];
  const resting = queuedPlate && !layers.length;
  panel(ctx, 589, 619, 182, 109, 7, '#41665a', '#31493d');
  for (let y = 626; y < 724; y += 10) stroke(ctx, '#b9d1ac33', 1.2, [[597, y], [763, y]]);
  const bounce = Math.max(0, 1 - (state.elapsed - state.platePop) * 7) * .13;
  drawDish(ctx, resting ? queuedPlate.layers : layers, 679, 659, 1.78 + bounce, resting ? queuedPlate.color : recipe.color, resting ? queuedPlate.shape : recipe.shape);
  const checklist = resting ? queuedPlate : recipe;
  drawKitchenSign(ctx, resting ? 'ON TRAY' : layers.length ? 'DISH IN PROGRESS' : 'NEXT DISH',
    772, 618, 153, 22, { size: cover ? 15 : 14 });
  checklist.layers.forEach((id, i) => {
    const done = resting || i < layers.length;
    const next = !resting && i === layers.length;
    if (next) panel(ctx, 773, 644 + i * 19, 151, 19, 4, '#ffe5ae');
    label(ctx, done ? '✓' : next ? '›' : '·', 781, 653 + i * 19, 19, done ? '#254f39' : '#6f452e');
    label(ctx, ingredients[id].name, 797, 653 + i * 19, cover ? 18 : 16, '#302d23');
    if (next) label(ctx, 'NEXT', 918, 653 + i * 19, cover ? 12 : 10, '#78502e', { align: 'right' });
  });
  if (cover) drawFallingGreens(ctx, state.coverMotion);
}

function drawFallingGreens(ctx, motion) {
  const progress = ((motion + .03) % .7) / .7;
  const x = 743 - progress * 35;
  const y = 626 + progress * 20;
  stroke(ctx, '#fff2b7', 4, [[x + 16, y - 6], [x + 27, y - 16]]);
  stroke(ctx, '#d8eaaa', 3, [[x + 27, y + 2], [x + 35, y - 8]]);
  drawIngredient(ctx, 'greens', x, y, .94, 'chopped');
  drawSparkle(ctx, x - 31, y + 10, 11, 1);
  panel(ctx, 805, 533 - progress * 14, 167, 43, 12, '#233a2a', '#d4e78f', 3);
  label(ctx, '+GREENS', 888, 554 - progress * 14, 31, '#e8f6b8', { align: 'center', weight: 900 });
}

function drawPass(ctx, state) {
  const cover = state.shot === 'cover';
  if (cover) {
    const vip = state.orders.find(ticket => ticket.recipe.id === 'gold');
    if (vip) drawQueuedCustomer(ctx, Math.ceil(vip.left - state.coverMotion * 4), state.coverMotion);
    drawWaitingCustomer(ctx, state.coverMotion);
  }
  panel(ctx, 954, 620, 274, 104, 7, '#6e3f31', '#a9754f');
  for (let y = 627; y < 721; y += 15) stroke(ctx, '#cc88534d', 1.5, [[962, y], [1220, y]]);
  oval(ctx, 1039, 667, 78, 44, null, '#b37e56');
  if (!state.ready) {
    drawKitchenSign(ctx, 'Waiting', 1121, 645, 95, 33, { size: 16 });
    return;
  }

  drawReadyHalo(ctx, 1044, 665);
  drawDish(ctx, state.ready.layers, 1044, 658, 1.75, state.ready.color, state.ready.shape);
  const steamTime = state.elapsed + (cover ? state.coverMotion : 0);
  if (cover) drawReadySteam(ctx, state.coverMotion);
  else drawSteam(ctx, 1044, 649, steamTime);
  drawReadySparkles(ctx, 1044, 665, steamTime);
  if (cover) drawReadyRing(ctx, state.coverMotion);
  drawKitchenSign(ctx, 'Ready', 1138, 642, 82, 36, { size: 22 });
  label(ctx, state.ready.name, 1179, 698, cover ? 18 : 16, '#ffe5b7', { align: 'center' });
}

function drawReadySteam(ctx, motion) {
  ctx.save();
  for (const [x, y, height] of [[1033, 645, 24], [1060, 640, 23], [1085, 643, 24]]) {
    const drift = Math.sin(motion * 5 + x) * 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x - 15, y - 9, x + 13, y - 12, x + drift, y - height);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#7c634958';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.strokeStyle = '#fff3ce';
    ctx.lineWidth = 4.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawQueuedCustomer(ctx, seconds, motion) {
  ctx.save();
  ctx.translate(0, Math.sin(motion * 6) * 3);
  oval(ctx, 1152, 552, 36, 12, '#132c2880');
  panel(ctx, 1121, 479, 58, 76, 21, '#3a303b', '#c98f69', 3);
  stroke(ctx, '#bb8a72', 3, [[1167, 499], [1156, 522], [1137, 526]]);
  oval(ctx, 1150, 465, 23, 25, '#31283a', '#c98f69', 3);
  oval(ctx, 1168, 449, 10, 10, '#31283a', '#c98f69', 2);
  oval(ctx, 1130, 469, 5, 7, '#be8462');

  panel(ctx, 1109, 399, 66, 32, 10, '#7e352d', '#ffd08a', 2);
  stroke(ctx, '#ffd08a', 2, [[1141, 431], [1149, 439], [1150, 431]]);
  label(ctx, `${seconds} s`, 1142, 415, 23, '#fff0ce', { align: 'center' });
  ctx.restore();
}

function drawWaitingCustomer(ctx, motion) {
  oval(ctx, 1085, 573, 57, 16, '#132c28a0');
  panel(ctx, 1044, 510, 80, 75, 27, '#202e3c', '#e2a36a', 3);
  stroke(ctx, '#b97650', 3, [[1107, 525], [1091, 554], [1071, 563]]);
  oval(ctx, 1084, 493, 28, 29, '#232734', '#e2a36a', 3);
  oval(ctx, 1062, 498, 8, 9, '#bd7854');
  stroke(ctx, '#202e3c', 19, [[1057, 531], [1029, 558], [1019, 577]]);
  panel(ctx, 1007, 562, 21, 26, 8, '#d39a6f', '#f6c48f', 2);
  stroke(ctx, '#a65f42', 2, [[1014, 570], [1014, 580]]);
  const y = 461 - Math.sin(motion * 3) * 8;
  oval(ctx, 1045, y, 22, 22, '#983d31', '#ffd28d', 3);
  label(ctx, '♥', 1045, y + 1, 27, '#fff0ce', { align: 'center' });
  drawSparkle(ctx, 1072, y - 12, 6, .9);
}

function drawReadyRing(ctx, motion) {
  const pulse = Math.sin(motion * 8) * 2;
  for (const side of [-1, 1]) {
    for (const radius of [25, 38]) {
      const facing = side === 1 ? 0 : Math.PI;
      ctx.beginPath();
      ctx.ellipse(1179, 628, radius + pulse, 16, 0, facing - .49, facing + .49);
      ctx.strokeStyle = '#ffd58d';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }
  oval(ctx, 1179, 631, 12, 4, '#b87842', '#ffdf9a', 2);
  panel(ctx, 1170, 618, 18, 13, [9, 9, 3, 3], '#ffda87');
  oval(ctx, 1179, 617, 3, 3, '#fff0bd');
}

function drawReadyHalo(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, .59);
  const glow = ctx.createRadialGradient(0, 0, 45, 0, 0, 112);
  glow.addColorStop(0, '#fff09b');
  glow.addColorStop(.62, '#ffc35aab');
  glow.addColorStop(1, '#ffc45a00');
  oval(ctx, 0, 0, 112, 112, glow);
  oval(ctx, 0, 0, 94, 94, null, '#ffdf8ac0', 3.5);
  ctx.restore();
}

function drawReadySparkles(ctx, x, y, elapsed) {
  for (const [dx, dy, size, phase] of [[-77, -34, 10, 1], [-71, 38, 7, 3], [75, -40, 9, 5], [83, 29, 8, 6]]) {
    drawSparkle(ctx, x + dx, y + dy, size, .8 + .2 * Math.sin(elapsed * 4 + phase));
  }
}

function drawSparkle(ctx, x, y, size, opacity) {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = opacity;
  ctx.fillStyle = '#fff1b4';
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(1, -1, size, 0);
  ctx.quadraticCurveTo(1, 1, 0, size);
  ctx.quadraticCurveTo(-1, 1, -size, 0);
  ctx.quadraticCurveTo(-1, -1, 0, -size);
  ctx.fill();
  ctx.restore();
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

function drawSteam(ctx, x, y, elapsed, burnt = false, bold = false) {
  for (let i = 0; i < 4; i++) {
    const phase = (elapsed * .74 + i * .25) % 1;
    const left = x - 26 + 17 * i;
    const top = y - phase * 37;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(left, top + 12);
    ctx.bezierCurveTo(left - 13, top + 2, left + 14, top - 6, left + 6, top - 17);
    ctx.strokeStyle = burnt ? (bold ? '#d0a58b' : '#392d27') : '#fff6d1';
    ctx.lineCap = 'round';
    ctx.globalAlpha = (1 - phase) * (bold ? .38 : .21);
    ctx.lineWidth = (bold ? 10 : 7) - phase * 3;
    ctx.stroke();
    ctx.globalAlpha = (1 - phase) * (bold ? .95 : .77);
    ctx.lineWidth = (bold ? 5.8 : 3.4) - phase * 1.6;
    ctx.stroke();
    ctx.restore();
  }
}
