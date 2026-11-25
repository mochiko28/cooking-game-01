// Renders station signs, ingredient labels, and the service controls strip.
import { label, panel, palette } from './canvas-ink.js';

export function drawCounterSign(ctx) {
  panel(ctx, 45, 217, 1190, 30, 5, '#233f34');
  label(ctx, 'COUNTER INGREDIENTS', 57, 233, 24, palette.light);
}

export function drawCrateLabel(ctx, crate, data) {
  const { x, y, w } = crate;
  const action = { pour: 'POUR', cook: 'COOK', chop: 'CHOP', both: 'CHOP + COOK' }[data.route];
  label(ctx, data.name, x + w / 2, y + 69, 22, '#30291f', { align: 'center' });
  label(ctx, action, x + w / 2, y + 85, 12, '#634334', { align: 'center' });
}

export function drawStationSign(ctx, station) {
  const { x, y, w } = station;
  panel(ctx, x + 5, y + 4, w - 10, 28, 4, '#f9dbac');
  label(ctx, station.label, x + 13, y + 19, 24, '#302c24');
}

export function drawServiceFooter(ctx, state) {
  panel(ctx, 20, 753, 1240, 38, 8, '#172f27', '#365549');
  const notice = state.noticeUntil > state.elapsed ? state.notice : '';
  label(ctx, notice || 'WASD  Walk      E  Use / Chop      CLICK  Walk & use      Q  Focus ticket', 36, 772,
    notice ? 18 : 16, notice ? palette.gold : '#ebdbbe');
}
