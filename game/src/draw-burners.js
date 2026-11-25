// Visualizes individual burners, simmer progress, and the last seconds before burning.
import { label, meter, oval, panel, stroke } from './draw-primitives.js';
import { drawIngredient } from './draw-food.js';
import { drawSteam } from './draw-steam.js';
import { burners } from './kitchen-layout.js';
import { burnTime, simmerSeconds, stovePhase } from './cooking-stove.js';

export function drawStove(ctx, state) {
  const motion = state.shot === 'cover' ? state.coverMotion : null;
  for (const { index, standX } of burners) drawBurner(ctx, state.pots[index], index, standX, 660, 1, state.elapsed, motion);
}

export function drawBurner(ctx, pot, index, x, y, scale, elapsed, coverMotion = null) {
  const phase = stovePhase(pot);
  const countdown = burnTime(pot);
  const warning = phase === 'cooked' && countdown <= 2;
  const burning = phase === 'burnt' && coverMotion !== null;
  const hot = phase !== 'empty';
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  panel(ctx, -62, -42, 124, 73, 6, '#263630', warning || burning ? '#ff765b' : '#8c9b85', 2);
  label(ctx, String(index + 1), -49, -29, 14, '#f4deb3', { align: 'center' });
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
  const colors = { empty: '#ead4ac', simmering: '#f7b66d', cooked: '#c8e49a', burnt: '#ff977d' };
  const words = { empty: 'EMPTY', simmering: 'SIMMERING', cooked: 'LIFT NOW', burnt: 'BURNT' };
  const progress = phase === 'cooked' ? countdown / 7 : phase === 'simmering' ? pot.age / simmerSeconds : 0;
  meter(ctx, -60, 36, 120, 6, progress, warning ? '#ff785e' : colors[phase], '#6d5944');
  panel(ctx, -62, 46, 124, 23, 5, warning || burning ? '#a53125' : '#263630');
  const status = burning ? 'BURNING' : warning ? `BURN ${Math.ceil(countdown)}s` : words[phase];
  label(ctx, status, 0, 58, burning ? 19 : 16, warning || burning ? '#fff0cf' : colors[phase], { align: 'center' });
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
