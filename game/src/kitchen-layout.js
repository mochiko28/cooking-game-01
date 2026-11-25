import { ingredients } from './ingredients.js';

export const pantry = Object.keys(ingredients).map((id, index) => ({
  id, kind: 'ingredient', x: 36 + 174 * index, y: 341, w: 164, h: 102,
  standX: 118 + 174 * index, standY: 467,
}));

export const worktops = [
  { id: 'chop', label: 'CHOP BOARD', x: 36, y: 542, w: 253, h: 177, standX: 162, standY: 517 },
  { id: 'stove', label: 'STOVE', x: 301, y: 542, w: 250, h: 177, standX: 426, standY: 517 },
  { id: 'plate', label: 'PLATING COUNTER', x: 563, y: 542, w: 329, h: 177, standX: 727, standY: 517 },
  { id: 'pass', label: 'SERVING WINDOW', x: 904, y: 542, w: 340, h: 177, standX: 1074, standY: 517 },
];

export const sink = { id: 'sink', label: 'SINK', x: 1180, y: 452, w: 64, h: 79, standX: 1158, standY: 511 };
export const stations = [...pantry, ...worktops, sink];

export function stationAt(x, y) {
  return stations.find(s => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h);
}

export function nearbyStation(player) {
  let closest;
  let distance = 47;
  for (const station of stations) {
    const gap = Math.hypot(player.x - station.standX, player.y - station.standY);
    if (gap < distance) {
      distance = gap;
      closest = station;
    }
  }
  return closest;
}
