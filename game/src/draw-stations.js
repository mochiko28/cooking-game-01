// Draws ingredient crates, the wooden worktops, and the chopping and wash stations.
import { label, meter, oval, panel, stroke } from './canvas-ink.js';
import { drawIngredient } from './draw-food.js';
import { drawCounterSign, drawCrateLabel, drawKitchenSign, drawStationSign } from './draw-labels.js';
import { ingredients } from './ingredients.js';
import { pantry, sink, worktops } from './kitchen-layout.js';

export function drawFurniture(ctx, state) {
  drawCounterSign(ctx);
  for (const crate of pantry) drawCrate(ctx, crate);
  for (const station of worktops) drawWorktop(ctx, station);
  drawSink(ctx);
  drawChopBoard(ctx, state);
}

function drawCrate(ctx, crate) {
  const { id, x, y, w, h } = crate;
  panel(ctx, x - 1, y + 8, w + 2, h, 8, '#102522b0');
  panel(ctx, x, y, w, h, 7, '#a66c43', '#503e2d');
  panel(ctx, x + 5, y + 3, w - 10, 53, 4, '#ca9865', '#e4b879');
  panel(ctx, x + 10, y + 8, w - 20, 45, 4, '#956848');
  for (let i = 0; i < 3; i++) stroke(ctx, '#b38158', 1, [[x + 12, y + 17 + 14 * i], [x + w - 12, y + 17 + 14 * i]]);
  drawCrateContents(ctx, id, x + w / 2, y + 30);
  drawCrateLabel(ctx, crate, ingredients[id]);
}

function drawCrateContents(ctx, id, x, y) {
  for (const [dx, dy, angle, scale] of [[-39, -5, -.13, .73], [37, -5, .13, .73], [0, 3, -.05, .91]]) {
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

export function drawChopBoard(ctx, state) {
  panel(ctx, 57, 622, 214, 77, 9, '#8a562f', '#72492f', 3);
  panel(ctx, 61, 622, 206, 71, 7, '#ae763f', '#edb471');
  for (const y of [634, 672, 685]) stroke(ctx, '#d4995c', 1.5, [[70, y], [254, y]]);
  oval(ctx, 253, 657, 5, 9, '#6d462d');
  const sinceCut = state.elapsed - state.board.mark;
  const chopping = sinceCut < .17;
  if (state.board.food) drawIngredient(ctx, state.board.food.id, 132, 656, 1.14, state.board.cuts >= 3 ? 'chopped' : 'raw');
  ctx.save();
  ctx.translate(170, 653);
  ctx.rotate(chopping ? -.24 : -.63);
  panel(ctx, -14, 2, 53, 20, 4, '#b8ceca', '#53665e');
  stroke(ctx, '#effcea', 2, [[-10, 18], [34, 18]]);
  panel(ctx, 36, 2, 28, 10, 4, '#49372a');
  oval(ctx, 49, 7, 2, 2, '#dbab68');
  ctx.restore();
  if (chopping) {
    stroke(ctx, '#fff2c6', 3, [[148, 644], [137, 633]]);
    stroke(ctx, '#fff2c6', 3, [[156, 639], [154, 626]]);
    stroke(ctx, '#ffe299', 2.4, [[165, 639], [172, 630]]);
  }
  if (sinceCut < .58) drawChopPop(ctx, sinceCut);
  meter(ctx, 62, 703, 204, 6, state.board.cuts / 4, '#335a45', '#9e6c48');
  const status = state.board.cuts === 4 ? 'PICK UP' : state.board.food ? `${state.board.cuts} / 4 CUTS` : 'HOLD TO CHOP';
  label(ctx, status, 164, 721, 16, '#3b2b20', { align: 'center' });
}

function drawChopPop(ctx, age) {
  ctx.save();
  ctx.globalAlpha = Math.min(1, (.58 - age) * 6);
  ctx.translate(99, 572 - age * 31);
  ctx.rotate(-.09);
  panel(ctx, -52, -15, 104, 30, 15, '#22342b', '#ffdc8a', 2);
  label(ctx, '+1 CUT', 0, 0, 20, '#ffedb7', { align: 'center', weight: 900 });
  ctx.restore();
}

function drawSink(ctx) {
  drawStationShadow(ctx, sink.x, sink.y, sink.w, sink.h);
  panel(ctx, sink.x, sink.y, sink.w, sink.h, 7, '#90afa3', '#c4c8a4');
  panel(ctx, sink.x + 7, sink.y + 13, 44, 47, 8, '#496e65', '#d4d9b9');
  stroke(ctx, '#d4d7b6', 4, [[1216, 428], [1216, 439], [1207, 439], [1207, 449]]);
  oval(ctx, 1210, 465, 5, 5, '#b0c9b5');
  drawKitchenSign(ctx, 'Sink', 1186, 481, 46, 22, { size: 14 });
}
