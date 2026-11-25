// Frames a full order rail and the two live burners for the rush showcase.
import { label, meter, oval, panel, palette, stroke } from './canvas-ink.js';
import { drawRoom } from './draw-floor-and-walls.js';
import { drawBurner } from './draw-burners.js';
import { drawCook } from './draw-cook.js';
import { burnTime, simmerSeconds } from './cooking-stove.js';

export function drawRushView(ctx, state) {
  drawRoom(ctx);
  panel(ctx, 45, 227, 1190, 510, 13, '#473524', '#c18c56', 4);
  panel(ctx, 52, 230, 1176, 492, 12, '#ce975f', '#ffd38b', 2);
  label(ctx, 'TWO-BURNER STOVE', 83, 272, 42, '#33281e');
  for (let i = 0; i < 2; i++) {
    const x = 79 + 490 * i;
    const pot = state.pots[i];
    const warning = i === 0;
    panel(ctx, x, 309, 468, 383, 11, '#263831', warning ? '#8e3226' : '#566a55', 5);
    panel(ctx, x + 9, 317, 450, 57, 7, warning ? '#9b3429' : '#476959');
    label(ctx, warning ? `BURNS IN ${Math.ceil(burnTime(pot))}s` : 'SIMMERING', x + 234, 346, 40,
      '#fff0d3', { align: 'center' });
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 14, 379, 440, 257);
    ctx.clip();
    drawBurner(ctx, pot, i, x + 234, 527, 3.25, state.elapsed);
    ctx.restore();
    panel(ctx, x + 16, 636, 436, 47, 5, '#263831');
    label(ctx, warning ? 'LIFT THE SHRIMP' : 'NOODLES', x + 234, 657, 27, warning ? '#ffb199' : palette.gold, { align: 'center' });
    meter(ctx, x + 18, 677, 432, 8, warning ? burnTime(pot) / 7 : pot.age / simmerSeconds, warning ? '#ff8362' : '#f0b663', '#4f5a46');
  }
  panel(ctx, 1064, 309, 133, 383, 9, '#83553c', '#f3bd7b');
  for (let y = 323; y < 680; y += 26) stroke(ctx, '#a46a47', 2, [[1074, y], [1187, y]]);
  oval(ctx, 1127, 507, 47, 36, '#3e3127', '#e7be7d', 3);
  ctx.save();
  ctx.translate(1125, 486);
  ctx.scale(1.7, 1.7);
  ctx.translate(-state.cook.x, -state.cook.y);
  drawCook(ctx, state);
  ctx.restore();
}
