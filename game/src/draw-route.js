// Draws a dotted route from the cook and numbers the upcoming station visits.
import { label, oval, panel, palette } from './draw-primitives.js';
import { floorBounds } from './kitchen-layout.js';
import { coverRoutePlan, routeForTicket } from './ticket-route.js';

export function drawRoute(ctx, state) {
  if (!state.showRoute || state.screen !== 'play') return;
  if (state.shot === 'cover') {
    drawCoverRoute(ctx);
    return;
  }
  const { cook } = state;
  const origin = [cook.x, cook.y + 20];
  const active = routeForTicket(state);
  if (!active.length) return;
  const points = active.map(routePoint);
  drawTrail(ctx, origin, points);
  points.forEach(([x, y], index) => {
    const visits = points.flatMap(([px, py], order) => px === x && py === y ? [order + 1] : []);
    if (visits[0] !== index + 1) return;
    if (visits.length > 1) panel(ctx, x - 31, y - 17, 62, 34, 14, palette.gold, '#283d31', 3);
    else oval(ctx, x, y, 17, 17, palette.gold, '#283d31', 3);
    label(ctx, visits.join('·'), x, y + 1, 23, '#25342a', { align: 'center' });
  });
}

function drawCoverRoute(ctx) {
  const { stops, detour, fastest, slower } = coverPlan;
  const points = stops.map(routePoint);
  const [chop, stove, plate] = points;

  // Only the leg around the island differs from the active route.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(...stove);
  const [left, right] = detour.map(routePoint);
  ctx.arcTo(...left, ...right, 14);
  ctx.arcTo(...right, ...plate, 14);
  ctx.lineTo(...plate);
  ctx.setLineDash([5, 5]);
  ctx.lineCap = 'round';
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#e3ebc378';
  ctx.stroke();
  ctx.restore();

  drawTrail(ctx, chop, [stove, plate]);
  const labels = ['CHOP', 'STOVE', 'PLATE'];
  points.forEach(([x, y], index) => {
    panel(ctx, x - 22, y + 18, 70, 23, 7, '#203b30');
    label(ctx, labels[index], x + 13, y + 30, 16, '#fff1bf', { align: 'center' });
    oval(ctx, x, y, 17, 17, palette.gold, '#283d31', 3);
    label(ctx, String(index + 1), x, y + 1, 23, '#25342a', { align: 'center' });
  });
  panel(ctx, 834, 400, 284, 32, 8, '#ffe1a0', '#304438');
  label(ctx, `FASTEST ROUTE ${fastest} s (alt ${slower} s)`, 976, 416, 19, '#25342a', { align: 'center' });
}

function drawTrail(ctx, from, points) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(...from);
  for (const to of points) {
    const [cx, cy] = routeSegment(from, to);
    ctx.quadraticCurveTo(cx, cy, ...to);
    from = to;
  }
  ctx.lineCap = 'round';
  ctx.setLineDash([1, 14]);
  ctx.strokeStyle = '#19382d';
  ctx.lineWidth = 9;
  ctx.stroke();
  ctx.strokeStyle = '#ffe3a0';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.restore();
}

export function routePoint({ standX, standY }) {
  const offset = standY === floorBounds.bottom ? -18 : standY === floorBounds.top ? 12 : 0;
  return [standX, standY + offset];
}

export function routeSegment(from, to) {
  return [(from[0] + to[0]) / 2, (from[1] + to[1]) / 2 - Math.min(65, Math.abs(from[0] - to[0]) * .25)];
}

const coverPlan = coverRoutePlan();
