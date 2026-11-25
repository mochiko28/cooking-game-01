// Composes the kitchen room, stations, route, player, and prep effects.
import { oval, panel, palette } from './draw-primitives.js';
import { drawRoom } from './draw-floor-and-walls.js';
import { drawFurniture } from './draw-stations.js';
import { drawStove } from './draw-burners.js';
import { drawPass, drawPlating } from './draw-plating.js';
import { drawCook } from './draw-cook.js';
import { drawRoute } from './draw-route.js';
import { drawServiceFooter } from './draw-labels.js';
import { nearbyStation } from './kitchen-layout.js';

export function drawKitchen(ctx, state) {
  drawRoom(ctx);
  drawFurniture(ctx, state);
  drawStove(ctx, state);
  drawPlating(ctx, state);
  drawPass(ctx, state);
  drawStationFocus(ctx, state);
  drawRoute(ctx, state);
  drawCook(ctx, state);
  for (const bit of state.particles) {
    ctx.globalAlpha = Math.min(1, bit.left * 4);
    panel(ctx, bit.x, bit.y, 5, 5, 1, bit.color);
  }
  ctx.globalAlpha = 1;
  drawServiceFooter(ctx, state);
}

function drawStationFocus(ctx, state) {
  if (state.staged || state.screen !== 'play') return;
  const station = state.hover ?? state.target ?? nearbyStation(state.cook);
  if (!station) return;
  panel(ctx, station.x - 2, station.y - 2, station.w + 4, station.h + 4, 9, null, palette.gold, 3);
  oval(ctx, station.standX, station.standY + 14, 11, 4, '#ffce749c');
}
