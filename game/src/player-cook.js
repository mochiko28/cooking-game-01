// Moves the cook by keyboard or walks to a clicked station.
import { floorBounds } from './kitchen-layout.js';

export function walkCook(state, dx, dy, dt) {
  const cook = state.cook;
  const length = Math.hypot(dx, dy);
  cook.moving = length > 0;
  if (!length) return;
  const step = (cook.speed ?? cookSpeed) * dt;
  cook.x = Math.max(floorBounds.left, Math.min(floorBounds.right, cook.x + dx / length * step));
  cook.y = Math.max(floorBounds.top, Math.min(floorBounds.bottom, cook.y + dy / length * step));
  if (dx) cook.facing = Math.sign(dx);
}

export function walkToStation(state, dt) {
  const { cook, target } = state;
  const dx = target.standX - cook.x;
  const dy = target.standY - cook.y;
  if (Math.hypot(dx, dy) > (cook.speed ?? cookSpeed) * dt) {
    walkCook(state, dx, dy, dt);
    return null;
  }
  cook.x = target.standX;
  cook.y = target.standY;
  cook.moving = false;
  state.target = null;
  return target;
}

export const cookSpeed = 460;
