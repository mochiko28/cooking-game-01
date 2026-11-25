// Draws the chop board, stove, plating counter, sink, and serving window.
import { focusedTicket, matchingRecipes } from './orders.js';
import { burnTime, burners, ingredients, simmerSeconds, sink, stovePhase, worktops } from './stations.js';
import { drawDish, drawIngredient, drawKitchenSign, drawWoodGrain, label, meter, oval, panel, stroke } from './paint.js';

export function drawWorkstations(ctx, state, cover) {
  const largerLabels = cover || !state.staged;
  for (const station of worktops) drawWorktop(ctx, station);
  drawSink(ctx, largerLabels);
  drawChopBoard(ctx, state, largerLabels);
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

function drawChopBoard(ctx, state, largerLabels) {
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
  label(ctx, status, 164, 721, largerLabels ? 26 : 16, '#3b2b20', { align: 'center', maxWidth: 204 });
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

function drawSink(ctx, largerLabels) {
  drawStationShadow(ctx, sink.x, sink.y, sink.w, sink.h);
  panel(ctx, sink.x, sink.y, sink.w, sink.h, 7, '#90afa3', '#c4c8a4');
  panel(ctx, sink.x + 7, sink.y + 13, 44, 47, 8, '#496e65', '#d4d9b9');
  stroke(ctx, '#d4d7b6', 4, [[1216, 428], [1216, 439], [1207, 439], [1207, 449]]);
  oval(ctx, 1210, 465, 5, 5, '#b0c9b5');
  drawKitchenSign(ctx, 'Sink', largerLabels ? 1182 : 1186, largerLabels ? 478 : 481,
    largerLabels ? 54 : 46, largerLabels ? 29 : 22, { size: largerLabels ? 26 : 14 });
}

function drawStationSign(ctx, station) {
  const { x, y } = station;
  drawKitchenSign(ctx, station.label, x + 7, y + 5, undefined, 29);
}

export function drawStove(ctx, state) {
  const motion = state.shot === 'cover' ? state.coverMotion : null;
  const largerLabels = motion !== null || !state.staged;
  for (const { index, standX } of burners) {
    drawBurner(ctx, state.pots[index], index, standX, 660, 1, state.elapsed, motion, { largerLabels });
  }
}

export function drawBurner(ctx, pot, index, x, y, scale, elapsed, coverMotion = null, { showDetails = true, largerLabels = false } = {}) {
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
    const statusWidth = largerLabels ? 132 : 124;
    panel(ctx, -statusWidth / 2, 46, statusWidth, largerLabels ? 27 : 23, 5,
      warning || burning ? '#a53125' : '#263630');
    const status = burning ? 'BURNING' : warning ? `BURN ${Math.ceil(countdown)}s` : words[phase];
    label(ctx, status, 0, largerLabels ? 60 : 58, largerLabels ? 26 : 16,
      warning || burning ? '#fff0cf' : colors[phase], { align: 'center', maxWidth: statusWidth - 8 });
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

export function platingRecipe(state) {
  const choices = matchingRecipes(state.layers);
  const focus = focusedTicket(state)?.recipe;
  return choices.includes(focus) ? focus : choices.find(option => state.orders.some(ticket => ticket.recipe === option)) ?? choices[0];
}

export function drawPlating(ctx, state) {
  const { layers, queuedPlate } = state;
  const cover = state.shot === 'cover';
  const largerLabels = cover || !state.staged;
  const recipe = platingRecipe(state);
  const resting = queuedPlate && !layers.length;
  const checklist = resting ? queuedPlate : recipe;
  const listX = largerLabels ? 750 : 772;
  const listRight = largerLabels ? 927 : 925;
  const matRight = largerLabels ? 742 : listX - 1;
  panel(ctx, 589, 619, matRight - 589, 109, 7, '#41665a', '#31493d');
  for (let y = 626; y < 724; y += 10) stroke(ctx, '#b9d1ac33', 1.2, [[597, y], [matRight - 8, y]]);
  const bounce = Math.max(0, 1 - (state.elapsed - state.platePop) * 7) * .13;
  drawDish(ctx, resting ? queuedPlate.layers : layers, largerLabels ? 665 : 679, largerLabels ? 666 : 659,
    (largerLabels ? 1.36 : 1.78) + bounce, checklist.color, checklist.shape);
  if (cover) drawFallingGreens(ctx, state.coverMotion);
  const fourRows = largerLabels && checklist.layers.length === 4;
  const rowHeight = largerLabels ? (fourRows ? 22 : 25) : 19;
  const firstRow = fourRows ? 652 : 653;
  if (largerLabels) {
    const cardBottom = firstRow + (checklist.layers.length - .5) * rowHeight + 5;
    panel(ctx, listX, 616, listRight - listX, cardBottom - 616, 7, '#f4ddb4', '#a57850');
  }
  drawKitchenSign(ctx, resting ? 'ON TRAY' : layers.length ? 'DISH IN PROGRESS' : 'NEXT DISH',
    listX, largerLabels ? 616 : 618, listRight - listX, largerLabels ? 25 : 22,
    { size: largerLabels ? 20 : 14 });
  checklist.layers.forEach((id, i) => {
    const done = resting || i < layers.length;
    const next = !resting && i === layers.length;
    const rowY = firstRow + i * rowHeight;
    const rowX = listX + (largerLabels ? 4 : 1);
    if (next) panel(ctx, rowX, rowY - Math.floor(rowHeight / 2),
      (largerLabels ? 923 : 924) - rowX, rowHeight, 4, largerLabels ? '#f7c879' : '#ffe5ae');
    label(ctx, done ? '✓' : next ? '›' : '·', listX + (largerLabels ? 6 : 9), rowY,
      largerLabels ? 22 : 19, done ? '#254f39' : '#6f452e');
    const nameX = listX + (largerLabels ? 22 : 25);
    label(ctx, ingredients[id].name, nameX, rowY, largerLabels ? 26 : 16, '#302d23',
      { maxWidth: next ? 80 : 918 - nameX });
    if (next) label(ctx, 'NEXT', largerLabels ? 921 : 918, rowY, largerLabels ? 26 : 10, largerLabels ? '#5a3c25' : '#78502e',
      { align: 'right', maxWidth: 59 });
  });
}

function drawFallingGreens(ctx, motion) {
  const progress = ((motion + .03) % .7) / .7;
  const x = 701 - progress * 21;
  const y = 628 + progress * 21;
  stroke(ctx, '#fff2b7', 4, [[x + 16, y - 6], [x + 27, y - 16]]);
  stroke(ctx, '#d8eaaa', 3, [[x + 27, y + 2], [x + 35, y - 8]]);
  drawIngredient(ctx, 'greens', x, y, .94, 'chopped');
  drawSparkle(ctx, x - 31, y + 10, 11, 1);
  panel(ctx, 805, 533 - progress * 14, 167, 43, 12, '#233a2a', '#d4e78f', 3);
  label(ctx, '+GREENS', 888, 554 - progress * 14, 31, '#e8f6b8', { align: 'center', weight: 900 });
}

export function drawPass(ctx, state) {
  const cover = state.shot === 'cover';
  const largerLabels = cover || !state.staged;
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
  const readyX = largerLabels ? 1169 : 1179;
  const signWidth = largerLabels ? 104 : 82;
  drawKitchenSign(ctx, 'Ready', readyX - signWidth / 2, 642, signWidth, 36, { size: largerLabels ? 26 : 22 });
  label(ctx, state.ready.name, readyX, 698, largerLabels ? 26 : 16, '#ffe5b7', { align: 'center', maxWidth: 120 });
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
  label(ctx, `${seconds} s`, 1142, 415, 26, '#fff0ce', { align: 'center', maxWidth: 58 });
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

export function drawServePop(ctx, { tip, multiplier }, age, x, y, scale = 1) {
  if (age >= 1.2) return;
  const lift = 38 * (1 - Math.exp(-10 * age));
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  const opacity = Math.min(1, (1.2 - age) / .28);
  ctx.globalAlpha = opacity;
  for (const direction of [-1, 1]) {
    stroke(ctx, '#ffcf75', 4, [[direction * 61, -11], [direction * 81, -36 - lift * .35]]);
    stroke(ctx, '#fff0b7', 3, [[direction * 82, -5], [direction * 104, -20 - lift * .25]]);
    drawSparkle(ctx, direction * 103, -42 - lift * .5, 8, opacity);
  }
  ctx.translate(0, -57 - lift);
  ctx.rotate(-.06);
  panel(ctx, -109, -43, 218, 87, 13, '#142f27', '#ffd078', 4);
  label(ctx, 'SERVED!', 0, -21, 43, '#fff6d4', { align: 'center', weight: 950 });
  label(ctx, multiplier > 1 ? `+${tip} ×${multiplier}` : `+${tip}`,
    0, 20, 43, '#ffd078', { align: 'center', weight: 950 });
  ctx.restore();
}
