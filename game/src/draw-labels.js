// Renders station signs, ingredient labels, and the service controls strip.
import { label, panel, palette } from './draw-primitives.js';

export function drawCounterSign(ctx) {
  drawKitchenSign(ctx, 'COUNTER INGREDIENTS', 51, 216, 302, 29);
}

export function drawCrateLabel(ctx, crate, data) {
  const { x, y, w } = crate;
  const prep = { pour: 'POUR', cook: 'COOK', chop: 'CHOP', both: 'CHOP + COOK' }[data.route];
  drawKitchenSign(ctx, data.name, x + 6, y + 53, w - 12, 35, { size: 18, prep });
}

export function drawStationSign(ctx, station) {
  const { x, y } = station;
  drawKitchenSign(ctx, station.label, x + 7, y + 5, undefined, 29);
}

export function drawKitchenSign(ctx, name, x, y, width, height, { size = 22, prep } = {}) {
  const title = name.toUpperCase();
  ctx.font = `800 ${size}px system-ui`;
  const w = width ?? Math.ceil(ctx.measureText(title).width) + 24;
  panel(ctx, x, y, w, height, height / 2, '#222d27', '#ba9065', 1);
  label(ctx, title, x + w / 2, y + (prep ? 11 : height / 2), size, palette.light, { align: 'center' });
  if (prep) label(ctx, prep, x + w / 2, y + 27, 11, '#e8bf88', { align: 'center' });
}

export function drawServiceFooter(ctx, state) {
  panel(ctx, 20, 753, 1240, 38, 8, '#172f27', '#365549');
  const notice = state.noticeUntil > state.elapsed ? state.notice : '';
  label(ctx, notice || 'WASD  Walk      E  Use / Chop      CLICK  Walk & use      Q  Focus ticket', 36, 772,
    notice ? 18 : 16, notice ? palette.gold : '#ebdbbe');
}
