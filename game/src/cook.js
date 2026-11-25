// Moves the cook and translates keyboard and pointer input.
import { floorBounds, stationAt } from './stations.js';

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

export function bindKitchenInput(canvas, handlers) {
  const held = new Set();
  window.addEventListener('keydown', event => {
    if (!kitchenKeys.includes(event.code)) return;
    if (event.target instanceof HTMLButtonElement && ['Space', 'Enter'].includes(event.code)) return;
    event.preventDefault();
    held.add(event.code);
    if (!event.repeat) handlers.key(event.code);
  });
  window.addEventListener('keyup', event => held.delete(event.code));
  window.addEventListener('blur', () => held.clear());

  function canvasPoint(event) {
    const box = canvas.getBoundingClientRect();
    return [(event.clientX - box.left) * canvas.width / box.width,
      (event.clientY - box.top) * canvas.height / box.height];
  }

  canvas.addEventListener('pointermove', event => {
    const [x, y] = canvasPoint(event);
    handlers.hover(stationAt(x, y), x, y);
  });
  canvas.addEventListener('pointerleave', () => {
    canvas.style.cursor = '';
    handlers.hover(null, -1, -1);
  });
  canvas.addEventListener('click', event => handlers.click(...canvasPoint(event)));

  const pressed = codes => Number(codes.some(code => held.has(code)));
  return {
    read: () => ({
      x: pressed(walkRightKeys) - pressed(walkLeftKeys),
      y: pressed(walkDownKeys) - pressed(walkUpKeys),
      use: pressed(stationUseKeys),
    }),
    clear: () => held.clear(),
  };
}

const walkUpKeys = ['KeyW', 'ArrowUp'];
const walkDownKeys = ['KeyS', 'ArrowDown'];
const walkLeftKeys = ['KeyA', 'ArrowLeft'];
const walkRightKeys = ['KeyD', 'ArrowRight'];
const stationUseKeys = ['KeyE', 'Space'];
const kitchenKeys = [...walkUpKeys, ...walkDownKeys, ...walkLeftKeys, ...walkRightKeys, ...stationUseKeys, 'KeyR', 'KeyQ', 'KeyT', 'KeyP', 'KeyM', 'Escape', 'Enter'];
