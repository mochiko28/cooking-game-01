import { label, meter, oval, panel, palette, stroke } from './canvas-ink.js';
import { drawDish, drawIngredient } from './draw-food.js';
import { ingredients } from './ingredients.js';
import { pantry, worktops, sink, nearbyStation } from './kitchen-layout.js';
import { burnSeconds, simmerSeconds, stovePhase } from './cooking-stove.js';
import { matchingRecipes } from './recipes.js';

function drawMarketWalls(ctx) {
  const light = ctx.createLinearGradient(0, 0, 0, 800);
  light.addColorStop(0, '#172e27');
  light.addColorStop(.7, '#132e29');
  light.addColorStop(1, '#101f1c');
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, 1280, 800);
  for (let x = 0; x < 1280; x += 64) {
    ctx.fillStyle = x % 128 === 0 ? '#935443' : '#d89a5d';
    ctx.fillRect(x, 0, 64, 8);
    ctx.fillStyle = '#ffffff18';
    ctx.fillRect(x, 0, 62, 2);
  }
  for (const x of [17, 1263]) {
    stroke(ctx, '#39554a', 2, [[x, 32], [x, 723]]);
    for (const y of [32, 723]) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      panel(ctx, -4, -4, 8, 8, 1, '#b98056');
      ctx.restore();
    }
  }
}

function drawFloorTiles(ctx) {
  panel(ctx, 36, 427, 1208, 137, 0, '#295248');
  for (let y = 444; y < 552; y += 43) {
    for (let x = 36; x < 1244; x += 54) {
      const width = Math.min(54, 1244 - x);
      panel(ctx, x + 1, y, width - 2, 41, 2, (x + y) % 4 < 2 ? '#30584d' : '#315c51');
      panel(ctx, x + 13, y + 9, 23, 2, 1, '#3a6457');
    }
  }
  stroke(ctx, '#8fa984', 2, [[36, 532], [1244, 532]]);
}

function drawPantry(ctx) {
  label(ctx, 'COUNTER INGREDIENTS', 37, 323, 23, palette.light);
  label(ctx, 'PICK A LAYER FROM THE TICKET', 1244, 323, 16, '#a7c0a9', { align: 'right' });
  const routes = { pour: 'POUR', cook: 'COOK', chop: 'CHOP', both: 'CHOP+COOK' };
  for (const crate of pantry) {
    const { id, x, y, w, h } = crate;
    const data = ingredients[id];
    panel(ctx, x, y + 5, w, h, 10, '#171e18');
    panel(ctx, x, y, w, h, 10, '#dca870', '#8d583e');
    panel(ctx, x + 7, y + 7, w - 14, 53, 7, '#b58154', '#a06d49');
    panel(ctx, x + 11, y + 10, w - 22, 47, 5, '#cc9867');
    oval(ctx, x + w / 2, y + 40, 42, 10, '#a7734f');
    drawIngredient(ctx, id, x + w / 2, y + 33, 1.12);
    panel(ctx, x + 7, y + 63, w - 14, 33, 5, '#fce0b2');
    label(ctx, data.name, x + w / 2, y + 79, 22, '#402d23', { align: 'center' });
    const tagWidth = data.route === 'both' ? 85 : 49;
    panel(ctx, x + w - tagWidth - 5, y + 4, tagWidth, 17, 4, '#77513b');
    label(ctx, routes[data.route], x + w - tagWidth / 2 - 5, y + 12, 11, '#ffe5b8', { align: 'center' });
    for (const offset of [12, w - 12]) oval(ctx, x + offset, y + 15, 2, 2, '#795137');
  }
}

function drawWorktop(ctx, station) {
  const { x, y, w, h, label: name } = station;
  panel(ctx, x, y + 5, w, h, 12, '#19231e');
  panel(ctx, x, y, w, h, 12, '#e6b781', '#986248');
  panel(ctx, x + 7, y + 37, w - 14, h - 44, 8, '#d29e6e', '#b8865d');
  panel(ctx, x + 7, y + 7, w - 14, 27, 6, '#f7d5a5');
  label(ctx, name, x + 15, y + 20, 22, '#402e23');
  for (const offset of [13, w - 13]) oval(ctx, x + offset, y + h - 13, 2.3, 2.3, '#936345');
}

function drawChopBoard(ctx, state) {
  panel(ctx, 61, 589, 205, 79, 10, '#a26640', '#774c35', 3);
  panel(ctx, 65, 590, 197, 73, 8, '#ba814c', '#d8a46a');
  for (const y of [600, 649, 654]) stroke(ctx, '#c89159', 2, [[76, y], [247, y]]);
  oval(ctx, 248, 626, 6, 10, '#805437');
  const chopping = state.elapsed - state.board.mark < .17;
  if (state.board.food) {
    drawIngredient(ctx, state.board.food.id, 136, 626, 1.16, state.board.cuts >= 3 ? 'chopped' : 'raw');
  }
  ctx.save();
  ctx.translate(172, 622);
  ctx.rotate(chopping ? -.24 : -.63);
  panel(ctx, -14, 2, 53, 20, 4, '#b4c8be', '#56655c');
  stroke(ctx, '#eef5dd', 2, [[-10, 18], [34, 18]]);
  panel(ctx, 36, 2, 28, 10, 4, '#49372a');
  oval(ctx, 49, 7, 2, 2, '#c39258');
  ctx.restore();
  if (chopping) {
    stroke(ctx, '#fff2c6', 3, [[155, 603], [145, 592]]);
    stroke(ctx, '#fff2c6', 3, [[166, 600], [163, 588]]);
  }
  meter(ctx, 66, 681, 192, 10, state.board.cuts / 4, '#638d48', '#af7b55');
  label(ctx, state.board.food ? (state.board.cuts === 4 ? 'PICK UP' : `${state.board.cuts} / 4 CUTS`) : 'HOLD TO CHOP', 162, 703, 15, '#4d3025', { align: 'center' });
}

function drawSteam(ctx, x, y, elapsed, burnt = false) {
  for (let i = 0; i < 4; i++) {
    const phase = (elapsed * .82 + i * .25) % 1;
    ctx.save();
    ctx.globalAlpha = (1 - phase) * .78;
    const top = y - phase * 42;
    ctx.beginPath();
    ctx.moveTo(x - 28 + 18 * i, top + 12);
    ctx.bezierCurveTo(x - 42 + 18 * i, top + 1, x - 18 + 18 * i, top - 2, x - 22 + 18 * i, top - 11);
    ctx.lineWidth = 3;
    ctx.strokeStyle = burnt ? '#362c2a' : '#fff1ca';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }
}

function drawStove(ctx, state) {
  const phase = stovePhase(state.pot);
  panel(ctx, 329, 588, 194, 83, 10, '#354642', '#596960');
  oval(ctx, 426, 629, 69, 32, '#223732', '#728578');
  oval(ctx, 426, 633, 54, 26, phase === 'empty' ? '#525d50' : '#f39b59');
  panel(ctx, 367, 616, 119, 12, 5, '#424944', '#8a9181');
  oval(ctx, 426, 632, 51, 27, '#587970', '#253732', 3);
  oval(ctx, 426, 621, 52, 23, '#a5b4a0', '#e8d6a2', 2);
  oval(ctx, 426, 621, 45, 17, phase === 'burnt' ? '#564133' : phase === 'empty' ? '#5c8379' : '#a75837');
  if (state.pot.food) {
    drawIngredient(ctx, state.pot.food.id, 427, 621, .76, phase === 'cooked' ? 'ready' : state.pot.food.stage);
    drawSteam(ctx, 425, 610, state.elapsed, phase === 'burnt');
  }
  const isCooked = phase === 'cooked';
  const fraction = isCooked ? 1 - (state.pot.age - simmerSeconds) / burnSeconds : state.pot.age / simmerSeconds;
  meter(ctx, 330, 681, 192, 10, ['empty', 'burnt'].includes(phase) ? 0 : fraction, phase === 'simmering' ? '#b65734' : '#668849', '#af7b55');
  const words = { empty: 'READY TO HEAT', simmering: 'SIMMERING', cooked: 'LIFT BEFORE IT BURNS', burnt: 'BURNT · USE SINK' };
  label(ctx, words[phase], 426, 703, 15, '#4d3025', { align: 'center' });
}

function drawPlating(ctx, state) {
  const layers = state.layers;
  const choices = matchingRecipes(layers);
  panel(ctx, 582, 589, 158, 104, 10, '#8ea18a', '#718675');
  for (let y = 596; y < 691; y += 9) stroke(ctx, '#adc0a3', 2, [[588, y], [734, y]]);
  const bounce = Math.max(0, 1 - (state.elapsed - state.platePop) * 6) * .1;
  drawDish(ctx, layers, 663, 637, 1.24 + (state.ready ? 0 : bounce), '#7eb49a');
  const recipe = choices.find(option => state.orders.some(ticket => ticket.recipe === option)) || choices[0];
  label(ctx, layers.length ? 'IN PROGRESS' : 'BUILD A DISH', 808, 602, 19, '#492e23', { align: 'center' });
  label(ctx, layers.length ? `${layers.length} / ${recipe.layers.length}` : '1 → 2 → 3', 804, 636, 31, '#273b2e', { align: 'center' });
  label(ctx, layers.length ? `NEXT: ${ingredients[recipe.layers[layers.length]].name.toUpperCase()}` : 'MATCH TICKET', 804, 665, 14, '#4d3025', { align: 'center' });
  label(ctx, layers.length ? recipe.name : 'Layer by layer', 662, 705, 15, '#4d3025', { align: 'center' });
}

function drawPass(ctx, state) {
  panel(ctx, 923, 587, 302, 104, 10, '#7b4636', '#b77a50');
  for (let y = 598; y < 690; y += 18) stroke(ctx, '#92523b', 2, [[932, y], [1216, y]]);
  if (state.ready) {
    const warm = ctx.createRadialGradient(1003, 632, 33, 1003, 632, 85);
    warm.addColorStop(0, '#ffc663da');
    warm.addColorStop(1, '#ffbc5300');
    oval(ctx, 1003, 632, 81, 51, warm);
    drawDish(ctx, state.ready.layers, 1003, 631, 1.33, state.ready.color, state.ready.shape);
    drawSteam(ctx, 1012, 620, state.elapsed);
    ctx.save();
    ctx.shadowColor = '#ffd486';
    ctx.shadowBlur = 17;
    panel(ctx, 1088, 607, 124, 50, 9, '#ffcf72', '#fff0ae', 2);
    ctx.restore();
    label(ctx, 'READY', 1150, 633, 27, '#472d24', { align: 'center' });
    label(ctx, state.ready.name, 1074, 704, 17, '#4a3024', { align: 'center' });
  } else {
    oval(ctx, 1003, 632, 64, 37, null, '#c48767', 2);
    label(ctx, 'WAITING', 1150, 632, 21, '#f6d4af', { align: 'center' });
    label(ctx, 'Finished dishes land here', 1074, 704, 15, '#4a3024', { align: 'center' });
  }
}

function drawSink(ctx) {
  panel(ctx, sink.x, sink.y, sink.w, sink.h, 7, '#82a89b', '#c1c5a3');
  panel(ctx, sink.x + 9, sink.y + 13, 46, 39, 9, '#446e64', '#b0c8ab');
  stroke(ctx, '#d4d7b6', 4, [[1213, 467], [1213, 475], [1204, 475], [1204, 482]]);
  oval(ctx, 1213, 492, 5, 5, '#b0c9b5');
  label(ctx, 'SINK', 1212, 516, 15, '#172b29', { align: 'center' });
}

function drawCook(ctx, state) {
  const cook = state.cook;
  const bob = cook.moving ? Math.sin(state.elapsed * 25) * 3 : 0;
  ctx.save();
  ctx.translate(cook.x, cook.y - 5 + bob);
  ctx.scale(cook.facing, 1);
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
  oval(ctx, 9, -6, 2, 2, '#483428');
  if (cook.hand) {
    oval(ctx, 29, 4, 24, 17, '#fff0d2', '#466e57');
    drawIngredient(ctx, cook.hand.id, 29, 3, .57, cook.hand.stage);
  }
  ctx.restore();
}

function drawStationFocus(ctx, state) {
  const station = state.hover || state.target || nearbyStation(state.cook);
  if (!station || state.screen !== 'play' || (state.staged && !state.hover)) return;
  panel(ctx, station.x - 2, station.y - 2, station.w + 4, station.h + 4, 10, null, palette.gold, 3);
  oval(ctx, station.standX, station.standY + 14, 11, 4, '#ffce749c');
}

export function drawKitchen(ctx, state) {
  drawMarketWalls(ctx);
  drawFloorTiles(ctx);
  drawPantry(ctx);
  drawSink(ctx);
  for (const station of worktops) drawWorktop(ctx, station);
  drawChopBoard(ctx, state);
  drawStove(ctx, state);
  drawPlating(ctx, state);
  drawPass(ctx, state);
  drawStationFocus(ctx, state);
  drawCook(ctx, state);
  if (state.camera === 'prep') drawPrepCloseup(ctx, state);
  else drawParticles(ctx, state);
  panel(ctx, 36, 735, 1208, 48, 11, '#1d342c', '#34564a');
  const notice = state.noticeUntil > state.elapsed ? state.notice : '';
  label(ctx, notice || 'WASD / ARROWS   Walk     E / SPACE   Use     CLICK   Walk & use', 52, 759, notice ? 20 : 17, notice ? palette.gold : '#e6d5b9');
}

function drawParticles(ctx, state) {
  for (const bit of state.particles) {
    ctx.globalAlpha = Math.min(1, bit.left * 4);
    panel(ctx, bit.x, bit.y, 5, 5, 1, bit.color);
  }
  ctx.globalAlpha = 1;
}

function drawPrepCloseup(ctx, state) {
  panel(ctx, 24, 307, 1232, 426, 0, '#18372e');
  label(ctx, 'PREP DURING THE SIMMER', 46, 326, 23, palette.light);
  ctx.save();
  ctx.translate(46, 349);
  ctx.scale(2.21, 2.1);
  ctx.translate(-36, -542);
  drawWorktop(ctx, worktops[0]);
  drawWorktop(ctx, worktops[1]);
  drawChopBoard(ctx, state);
  drawStove(ctx, state);
  drawParticles(ctx, state);
  ctx.restore();
}
