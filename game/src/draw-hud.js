// Draws the stall name, wave indicator, shift countdown, and live tip multiplier.
import { label, meter, oval, panel, palette, stroke } from './canvas-ink.js';
import { readShiftClock, shiftLength } from './shift-timer.js';
import { serviceWave, serviceWaves } from './service-waves.js';
import { comboMultiplier } from './combo-streak.js';
import { drawOrderBoard } from './draw-order-board.js';

function lantern(ctx, x, y) {
  const light = ctx.createRadialGradient(x, y, 7, x, y, 43);
  light.addColorStop(0, '#ffc15d7a');
  light.addColorStop(1, '#ffbd5900');
  oval(ctx, x, y, 42, 39, light);
  stroke(ctx, '#edb56e', 3, [[x, y - 29], [x, y + 27]]);
  panel(ctx, x - 24, y - 19, 48, 37, 14, '#d95839', '#ffc882', 2);
  oval(ctx, x, y, 12, 18, null, '#ffad66', 2);
  stroke(ctx, '#ffc57a', 2, [[x - 22, y], [x + 22, y]]);
  stroke(ctx, '#ec9b61', 2, [[x - 6, y + 25], [x + 6, y + 25]]);
}

export function drawServiceHud(ctx, state) {
  lantern(ctx, 57, 47);
  if (state.shot === 'rush') {
    label(ctx, 'DINNER RUSH', 105, 49, 60, palette.light);
  } else {
    label(ctx, 'LANTERN & LADLE', 105, 42, 43, palette.light, { face: 'Georgia, serif' });
    label(ctx, 'NIGHT MARKET KITCHEN', 108, 71, 15, '#b9ceba');
  }

  const wave = serviceWave(state.elapsed);
  const index = serviceWaves.indexOf(wave);
  panel(ctx, 564, 15, 223, 69, 9, '#213e33', '#49675a');
  label(ctx, state.shot === 'rush' ? 'WAVE 2 / 3' : wave.name.toUpperCase(), 675, 36, 24, wave.color, { align: 'center' });
  for (let i = 0; i < serviceWaves.length; i++) {
    const current = serviceWaves[i].start;
    const next = serviceWaves[i + 1]?.start ?? shiftLength;
    meter(ctx, 579 + 67 * i, 59, 60, 9, (state.elapsed - current) / (next - current), wave.color, '#4b6254');
  }

  const remaining = shiftLength - state.elapsed;
  const urgent = remaining <= 28;
  const clockHot = urgent && Math.floor(state.elapsed * 4) % 2 === 0;
  panel(ctx, 799, 11, 225, 74, 10, clockHot ? '#f19a73' : '#ffd389', '#ffdfa3');
  label(ctx, 'SHIFT TIMER', 911, 26, 17, '#634328', { align: 'center' });
  label(ctx, readShiftClock(state.elapsed), 911, 55, 44, '#2e2f26', { align: 'center', face: 'monospace' });
  meter(ctx, 811, 76, 201, 4, remaining / shiftLength, urgent ? '#a73d30' : '#795337', '#dbab6d');

  panel(ctx, 1036, 15, 224, 69, 9, '#213e33', '#49675a');
  oval(ctx, 1058, 37, 11, 11, '#eeb667', '#ffdb8a');
  label(ctx, '$', 1058, 38, 14, '#5e3928', { align: 'center' });
  label(ctx, String(state.coins), 1075, 37, 25, palette.light);
  label(ctx, `${state.served} served`, 1246, 37, 16, '#cbdbc3', { align: 'right' });
  label(ctx, `×${comboMultiplier(state.combo)} TIPS`, 1050, 66, 20, palette.gold);
  label(ctx, `${state.combo} streak`, 1246, 66, 16, palette.light, { align: 'right' });

  drawOrderBoard(ctx, state);
}
