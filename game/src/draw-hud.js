// Draws the stall name, wave indicator, shift countdown, and live tip multiplier.
import { label, meter, oval, panel, palette, stroke } from './canvas-ink.js';
import { readShiftClock, shiftLength } from './shift-timer.js';
import { serviceWave, serviceWaves } from './service-waves.js';
import { comboMultiplier } from './combo-streak.js';
import { drawOrderBoard } from './draw-order-board.js';

export function drawServiceHud(ctx, state) {
  const wave = serviceWave(state.elapsed);
  const waveName = wave.name.toUpperCase();
  const index = serviceWaves.indexOf(wave);
  drawStallLantern(ctx, 57, 47);
  if (state.shot === 'rush') {
    label(ctx, waveName, 105, 49, 60, palette.light);
  } else {
    label(ctx, 'LANTERN & LADLE', 105, 42, 43, palette.light, { face: 'Georgia, serif' });
    label(ctx, 'NIGHT MARKET KITCHEN', 108, 71, 15, '#b9ceba');
  }

  panel(ctx, 564, 15, 223, 69, 9, '#213e33', '#49675a');
  const waveLabel = state.shot === 'rush' ? `WAVE ${index + 1} / ${serviceWaves.length}` : waveName;
  label(ctx, waveLabel, 675, 36, 24, wave.color, { align: 'center' });
  for (let i = 0; i < serviceWaves.length; i++) {
    const current = serviceWaves[i].start;
    const next = serviceWaves[i + 1]?.start ?? shiftLength;
    meter(ctx, 579 + 67 * i, 59, 60, 9, (state.elapsed - current) / (next - current), wave.color, '#4b6254');
  }

  drawShiftTimer(ctx, state.elapsed);

  panel(ctx, 1036, 15, 224, 69, 9, '#213e33', '#49675a');
  oval(ctx, 1058, 37, 11, 11, '#eeb667', '#ffdb8a');
  label(ctx, '$', 1058, 38, 14, '#5e3928', { align: 'center' });
  label(ctx, String(state.coins), 1075, 37, 25, palette.light);
  label(ctx, `${state.served} served`, 1246, 37, 16, '#cbdbc3', { align: 'right' });
  label(ctx, `×${comboMultiplier(state.combo)} TIPS`, 1050, 66, 20, palette.gold);
  label(ctx, `${state.combo} streak`, 1246, 66, 16, palette.light, { align: 'right' });

  drawOrderBoard(ctx, state);
}

function drawShiftTimer(ctx, elapsed) {
  const remaining = Math.max(0, shiftLength - elapsed);
  const urgent = remaining < 30;
  const color = urgent ? '#ff9b59' : '#ffda8b';
  panel(ctx, 799, 11, 225, 74, 10, urgent ? '#5f3329' : '#2f3c2e', urgent ? '#e98352' : '#a78550', 2);
  const x = 841;
  const y = 48;
  oval(ctx, x, y, 25, 25, '#1e2c26', urgent ? '#90533d' : '#637358', 6);
  if (remaining > 0) {
    const start = -Math.PI / 2;
    ctx.beginPath();
    ctx.arc(x, y, 25, start, start + 2 * Math.PI * remaining / shiftLength);
    ctx.strokeStyle = color;
    ctx.lineWidth = urgent ? 7 + Math.sin(elapsed * 10) : 6;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  const angle = -Math.PI / 2 + 2 * Math.PI * (elapsed % 60) / 60;
  stroke(ctx, color, 2.5, [[x, y], [x + Math.cos(angle) * 14, y + Math.sin(angle) * 14]]);
  oval(ctx, x, y, 2.7, 2.7, color);
  label(ctx, 'SHIFT TIMER', 945, 29, 17, color, { align: 'center' });
  label(ctx, readShiftClock(elapsed), 945, 59, 44, '#fff0d7', { align: 'center', face: 'monospace' });
}

function drawStallLantern(ctx, x, y) {
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
