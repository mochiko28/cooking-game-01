// Visualizes individual burners, simmer progress, and the last seconds before burning.
import { label, meter, oval, panel } from './draw-primitives.js';
import { drawIngredient } from './draw-food.js';
import { drawSteam } from './draw-steam.js';
import { burners } from './kitchen-layout.js';
import { burnTime, simmerSeconds, stovePhase } from './cooking-stove.js';

export function drawStove(ctx, state) {
  for (const { index, standX } of burners) drawBurner(ctx, state.pots[index], index, standX, 660, 1, state.elapsed);
}

export function drawBurner(ctx, pot, index, x, y, scale, elapsed) {
  const phase = stovePhase(pot);
  const countdown = burnTime(pot);
  const warning = phase === 'cooked' && countdown <= 2;
  const hot = phase !== 'empty';
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  panel(ctx, -62, -42, 124, 73, 6, '#263630', warning ? '#ff765b' : '#8c9b85', 2);
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
    drawSteam(ctx, 3, -13, elapsed, phase === 'burnt');
  }
  const colors = { empty: '#ead4ac', simmering: '#f7b66d', cooked: '#c8e49a', burnt: '#ff977d' };
  const words = { empty: 'EMPTY', simmering: 'SIMMERING', cooked: 'LIFT NOW', burnt: 'BURNT' };
  const progress = phase === 'cooked' ? countdown / 7 : phase === 'simmering' ? pot.age / simmerSeconds : 0;
  meter(ctx, -60, 36, 120, 6, progress, warning ? '#ff785e' : colors[phase], '#6d5944');
  panel(ctx, -62, 46, 124, 23, 5, warning ? '#a53125' : '#263630');
  label(ctx, warning ? `BURN ${Math.ceil(countdown)}s` : words[phase], 0, 58, 16, warning ? '#fff0cf' : colors[phase], { align: 'center' });
  ctx.restore();
}
