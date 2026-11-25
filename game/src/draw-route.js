// Draws a dotted route from the cook and numbers the upcoming station visits.
import { label, oval, panel, palette } from './canvas-ink.js';
import { floorBounds } from './kitchen-layout.js';
import { routeForTicket } from './ticket-route.js';

export function drawRoute(ctx, state) {
  if (!state.showRoute || state.screen !== 'play') return;
  const stations = routeForTicket(state);
  if (!stations.length) return;
  const { cook } = state;
  const points = stations.map(station => [station.standX, station.standY + (station.standY === floorBounds.bottom ? -18 : station.standY === floorBounds.top ? 12 : 0)]);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cook.x, cook.y + 20);
  let from = [cook.x, cook.y + 20];
  for (const to of points) {
    const bend = (from[1] + to[1]) / 2 - Math.min(65, Math.abs(from[0] - to[0]) * .25);
    ctx.quadraticCurveTo((from[0] + to[0]) / 2, bend, ...to);
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
  points.forEach(([x, y], index) => {
    const visits = points.flatMap(([px, py], order) => px === x && py === y ? [order + 1] : []);
    if (visits[0] !== index + 1) return;
    if (visits.length > 1) panel(ctx, x - 31, y - 17, 62, 34, 14, palette.gold, '#283d31', 3);
    else oval(ctx, x, y, 17, 17, palette.gold, '#283d31', 3);
    label(ctx, visits.join('·'), x, y + 1, 23, '#25342a', { align: 'center' });
  });
}
