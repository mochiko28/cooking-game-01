// Draws ingredient crates, the wooden worktops, and the chopping and wash stations.
import { label, meter, oval, panel, stroke } from './canvas-ink.js';
import { drawIngredient } from './draw-food.js';
import { drawCounterSign, drawCrateLabel, drawStationSign } from './draw-labels.js';
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
  oval(ctx, x + w / 2, y + 37, 38, 10, '#72513865');
  drawIngredient(ctx, id, x + w / 2, y + 30, 1.13);
  panel(ctx, x + 5, y + 57, w - 10, 38, 4, '#f8d6a2', '#8f613f', 1);
  drawCrateLabel(ctx, crate, ingredients[id]);
}

function drawWorktop(ctx, station) {
  const { x, y, w, h } = station;
  panel(ctx, x, y - 2, w, h + 14, 7, '#122723bc');
  panel(ctx, x, y, w, h, 7, '#814f37', '#3e3529', 2);
  panel(ctx, x + 2, y + 1, w - 4, h - 10, 6, '#ce955f', '#edb678', 2);
  panel(ctx, x + 6, y + 34, w - 12, h - 45, 4, '#cc9867', '#b17b53', 1);
  for (const yOffset of [43, 69, 102, 134]) stroke(ctx, '#f6c78748', 1.4, [[x + 9, y + yOffset], [x + w - 9, y + yOffset]]);
  for (const dx of [12, w - 12]) oval(ctx, x + dx, y + h - 5, 2.8, 2.8, '#503d30', '#d49a61', 1);
  drawStationSign(ctx, station);
}

export function drawChopBoard(ctx, state) {
  panel(ctx, 57, 622, 214, 77, 9, '#8a562f', '#72492f', 3);
  panel(ctx, 61, 622, 206, 71, 7, '#ae763f', '#edb471');
  for (const y of [634, 672, 685]) stroke(ctx, '#d4995c', 1.5, [[70, y], [254, y]]);
  oval(ctx, 253, 657, 5, 9, '#6d462d');
  const chopping = state.elapsed - state.board.mark < .17;
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
    stroke(ctx, '#fff2c6', 3, [[155, 642], [145, 631]]);
    stroke(ctx, '#fff2c6', 3, [[166, 640], [163, 628]]);
  }
  meter(ctx, 62, 703, 204, 6, state.board.cuts / 4, '#335a45', '#9e6c48');
  const status = state.board.cuts === 4 ? 'PICK UP' : state.board.food ? `${state.board.cuts} / 4 CUTS` : 'HOLD TO CHOP';
  label(ctx, status, 164, 721, 16, '#3b2b20', { align: 'center' });
}

function drawSink(ctx) {
  panel(ctx, sink.x - 4, sink.y + 8, sink.w + 2, sink.h, 7, '#20372d');
  panel(ctx, sink.x, sink.y, sink.w, sink.h, 7, '#90afa3', '#c4c8a4');
  panel(ctx, sink.x + 7, sink.y + 13, 44, 47, 8, '#496e65', '#d4d9b9');
  stroke(ctx, '#d4d7b6', 4, [[1216, 428], [1216, 439], [1207, 439], [1207, 449]]);
  oval(ctx, 1210, 465, 5, 5, '#b0c9b5');
  label(ctx, 'SINK', 1209, 492, 15, '#172b29', { align: 'center' });
}
