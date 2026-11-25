// Defines kitchen furniture, walkable floor bounds, and interaction points.
import { ingredients } from './ingredients.js';

export const floorBounds = { left: 82, top: 372, right: 1158, bottom: 556 };

export const pantry = Object.keys(ingredients).map((id, index) => ({
  id, kind: 'ingredient', x: 45 + 172 * index, y: 252, w: 158, h: 92,
  standX: 124 + 172 * index, standY: 372,
}));

export const burners = [0, 1].map(index => ({
  id: `burner-${index + 1}`, kind: 'burner', index,
  x: 296 + 138 * index, y: 582, w: 138, h: 156,
  standX: 365 + 138 * index, standY: 556,
}));

export const worktops = [
  { id: 'chop', label: 'CHOP BOARD', x: 42, y: 582, w: 244, h: 156, standX: 164, standY: 556 },
  { id: 'stove', label: 'STOVE', x: 296, y: 582, w: 276, h: 156 },
  { id: 'plate', label: 'PLATING COUNTER', x: 582, y: 582, w: 352, h: 156, standX: 758, standY: 556 },
  { id: 'pass', label: 'SERVING WINDOW', x: 944, y: 582, w: 294, h: 156, standX: 1091, standY: 556 },
];

export const sink = { id: 'sink', label: 'SINK', x: 1180, y: 418, w: 58, h: 93, standX: 1158, standY: 465 };
export const coverIsland = { x: 553, y: 415, w: 151, h: 65 };
export const stations = [...pantry, ...burners, ...worktops.filter(station => station.id !== 'stove'), sink];

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
