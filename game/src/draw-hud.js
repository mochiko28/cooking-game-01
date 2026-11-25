import { label, meter, oval, panel, palette, stroke } from './canvas-ink.js';
import { drawDish, drawIngredient } from './draw-food.js';
import { readShiftClock, rushDifficulty, shiftLength } from './shift-timer.js';

function lantern(ctx, x, y) {
  oval(ctx, x, y, 32, 32, '#294a3d');
  stroke(ctx, '#edb56e', 3, [[x, y - 25], [x, y + 25]]);
  panel(ctx, x - 19, y - 16, 38, 31, 13, '#e57954', '#f6be79', 2);
  oval(ctx, x, y, 10, 15, null, '#ffc887', 2);
  stroke(ctx, '#ffcf82', 2, [[x - 17, y], [x + 17, y]]);
  stroke(ctx, '#ec9b61', 2, [[x - 6, y + 24], [x + 6, y + 24]]);
}

function drawTicket(ctx, ticket, index) {
  const x = 48 + 300 * index;
  panel(ctx, x, 186, 284, 107, 11, '#0c1d1a');
  panel(ctx, x, 180, 284, 106, 11, '#ffeacf');
  panel(ctx, x + 10, 191, 71, 63, 11, ticket.recipe.color);
  drawDish(ctx, ticket.recipe.layers, x + 46, 222, .56, ticket.recipe.color, ticket.recipe.shape);
  label(ctx, ticket.recipe.name, x + 92, 202, 24, palette.ink);
  ticket.recipe.layers.forEach((id, j) => {
    if (j) label(ctx, '›', x + 82 + j * 43, 237, 21, '#8b6249');
    drawIngredient(ctx, id, x + 105 + j * 43, 237, .47, 'ready');
  });
  const progress = ticket.left / ticket.patience;
  meter(ctx, x + 11, 266, 262, 9, progress, progress <= .29 ? '#b9413d' : '#3b7a58', '#d3b99a');
}

export function drawServiceHud(ctx, state) {
  lantern(ctx, 68, 73);
  label(ctx, 'LANTERN & LADLE', 112, 61, 42, palette.light, { face: 'Georgia, serif' });
  label(ctx, 'NIGHT MARKET KITCHEN', 113, 103, 20, '#b9cdb8');

  const pressure = rushDifficulty(state.elapsed);
  const rushColor = pressure.pressure > .67 ? '#ff9278' : palette.gold;
  panel(ctx, 562, 34, 250, 82, 10, '#223e35', '#406454');
  label(ctx, 'RUSH', 578, 56, 21, rushColor);
  label(ctx, pressure.tier, 797, 56, 17, '#faddb7', { align: 'right' });
  for (let i = 0; i < 10; i++) {
    const filled = i < Math.max(1, Math.ceil(pressure.pressure * 10));
    const h = 9 + i * 1.7;
    panel(ctx, 579 + i * 22, 98 - h, 16, h, 3, filled ? rushColor : '#446458');
  }

  const urgent = shiftLength - state.elapsed <= 28;
  const clockHot = urgent && Math.floor(state.elapsed * 4) % 2 === 0;
  panel(ctx, 826, 27, 224, 96, 13, clockHot ? '#ffd9ad' : '#ffcf80', '#f7b16c', 2);
  label(ctx, 'SHIFT TIMER', 938, 47, 19, '#593e28', { align: 'center' });
  label(ctx, readShiftClock(state.elapsed), 938, 88, 53, '#272d24', { align: 'center', face: 'monospace' });

  panel(ctx, 1065, 34, 179, 82, 10, '#223e35', '#406454');
  oval(ctx, 1088, 60, 11, 11, '#eeb667', '#ffdb8a');
  label(ctx, '$', 1088, 61, 13, '#62432a', { align: 'center' });
  label(ctx, String(state.coins), 1107, 61, 29, palette.light);
  label(ctx, state.combo >= 2 ? `×${state.combo} STREAK` : `${state.served} SERVED`, 1080, 95, 18, palette.gold);

  panel(ctx, 36, 139, 1208, 164, 15, '#263d32', '#54715c');
  label(ctx, 'ORDER BOARD', 50, 159, 23, palette.light);
  label(ctx, `${state.orders.length} / 4 TICKETS`, 1229, 158, 18, '#c0ccae', { align: 'right' });
  for (let i = 0; i < 4; i++) {
    if (state.orders[i]) drawTicket(ctx, state.orders[i], i);
    else panel(ctx, 48 + 300 * i, 180, 284, 106, 11, '#20352c', '#42614f');
  }
}
